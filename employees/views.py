from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.core.files.base import ContentFile
from .models import Department, Employee, Role, EmailSettings, OfferLetterTemplate, OfferLetter
from .serializers import (
    DepartmentSerializer,
    EmployeeSerializer,
    EmployeeCreateSerializer,
    RoleSerializer,
    EmailSettingsSerializer,
    OfferLetterTemplateSerializer,
    OfferLetterSerializer,
)
from .permissions import IsAdminOrManager, RolePermission, has_role_permission
from .offer_letters import generate_offer_letter_pdf


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing departments
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [RolePermission]
    permission_required = 'employees.manage'
    read_permission = 'employees.view'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    filterset_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing employees
    """
    queryset = Employee.objects.all().prefetch_related('managers')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'email', 'designation']
    filterset_fields = ['department', 'status', 'designation']
    ordering_fields = ['hire_date', 'first_name', 'last_name', 'created_at']
    ordering = ['-hire_date']
    permission_classes = [RolePermission]
    permission_required = 'employees.manage'
    read_permission = 'employees.view'

    def get_serializer_class(self):
        if self.action == 'create':
            return EmployeeCreateSerializer
        return EmployeeSerializer

    def get_permissions(self):
        if self.action == 'me':
            return [IsAuthenticated()]
        if self.action == 'team':
            return [IsAdminOrManager()]
        return super().get_permissions()

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        """Get detailed employee profile"""
        employee = self.get_object()
        serializer = EmployeeSerializer(employee, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the authenticated employee profile"""
        employee = getattr(request.user, 'employee_profile', None)
        if not employee:
            return Response({'detail': 'Employee profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = EmployeeSerializer(employee, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def team(self, request):
        """Get direct reports for the authenticated manager"""
        employee = getattr(request.user, 'employee_profile', None)
        if not employee:
            return Response({'detail': 'Employee profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        team = Employee.objects.filter(managers=employee)
        serializer = EmployeeSerializer(team, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def org_chart(self, request):
        """Get a simplified org chart for HR/Admin"""
        if not has_role_permission(request.user, 'org_chart.view'):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        managers = Employee.objects.filter(direct_reports__isnull=False).distinct()
        data = []
        for manager in managers:
            reports = EmployeeSerializer(manager.direct_reports.all(), many=True, context={'request': request}).data
            data.append({
                'manager_id': manager.employee_id,
                'manager_name': manager.full_name,
                'manager_email': manager.email,
                'designation': manager.designation,
                'team': reports,
            })
        return Response(data)


class EmailSettingsViewSet(viewsets.ModelViewSet):
    queryset = EmailSettings.objects.all()
    serializer_class = EmailSettingsSerializer
    permission_classes = [RolePermission]
    permission_required = 'settings.manage'
    read_permission = 'settings.view'

    def perform_create(self, serializer):
        if serializer.validated_data.get('is_active', True):
            EmailSettings.objects.update(is_active=False)
        serializer.save()

    def perform_update(self, serializer):
        if serializer.validated_data.get('is_active', False):
            EmailSettings.objects.update(is_active=False)
        serializer.save()


class OfferLetterTemplateViewSet(viewsets.ModelViewSet):
    queryset = OfferLetterTemplate.objects.all()
    serializer_class = OfferLetterTemplateSerializer
    permission_classes = [RolePermission]
    permission_required = 'offer_letters.manage'
    read_permission = 'offer_letters.view'

    def perform_create(self, serializer):
        if serializer.validated_data.get('is_active', True):
            OfferLetterTemplate.objects.update(is_active=False)
        serializer.save()

    def perform_update(self, serializer):
        if serializer.validated_data.get('is_active', False):
            OfferLetterTemplate.objects.update(is_active=False)
        serializer.save()


class OfferLetterViewSet(viewsets.ModelViewSet):
    queryset = OfferLetter.objects.all()
    serializer_class = OfferLetterSerializer
    permission_classes = [RolePermission]
    permission_required = 'offer_letters.manage'
    read_permission = 'offer_letters.view'

    def perform_create(self, serializer):
        template = serializer.validated_data.get('template')
        if not template:
            template = OfferLetterTemplate.objects.filter(is_active=True).first()
        issued_by = getattr(self.request.user, 'employee_profile', None)
        offer_letter = serializer.save(template=template, issued_by=issued_by)

        pdf_bytes = generate_offer_letter_pdf(offer_letter, template)
        filename = f"offer_letter_{offer_letter.offer_letter_id}.pdf"
        offer_letter.pdf_file.save(filename, ContentFile(pdf_bytes), save=True)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        offer_letter = self.get_object()
        if not offer_letter.pdf_file:
            return Response({'detail': 'Offer letter not generated yet.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'file_url': offer_letter.pdf_file.url})


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [RolePermission]
    permission_required = 'roles.manage'
    read_permission = 'roles.manage'

    def perform_create(self, serializer):
        serializer.save(is_system=False)
