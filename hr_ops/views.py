from datetime import date, timedelta

from django.utils import timezone
from django.db import transaction
from rest_framework import viewsets, status, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from employees.permissions import RolePermission, EmployeeOrRolePermission, is_employee, get_employee_profile
from employees.models import Employee
from .models import (
    OnboardingChecklistTemplate,
    OnboardingTaskTemplate,
    OnboardingTask,
    EmployeeDocument,
    Asset,
    AssetAssignment,
    Policy,
    PolicyAcknowledgment,
)
from .serializers import (
    OnboardingChecklistTemplateSerializer,
    OnboardingTaskTemplateSerializer,
    OnboardingTaskSerializer,
    EmployeeDocumentSerializer,
    AssetSerializer,
    AssetAssignmentSerializer,
    PolicySerializer,
    PolicyAcknowledgmentSerializer,
)


class OnboardingChecklistTemplateViewSet(viewsets.ModelViewSet):
    queryset = OnboardingChecklistTemplate.objects.all()
    serializer_class = OnboardingChecklistTemplateSerializer
    permission_classes = [RolePermission]
    permission_required = 'onboarding.manage'
    read_permission = 'onboarding.view'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['name']
    filterset_fields = ['is_active']

    @action(detail=True, methods=['post'])
    def generate_tasks(self, request, pk=None):
        checklist = self.get_object()
        employee_id = request.data.get('employee')
        start_date = request.data.get('start_date')
        if not employee_id:
            return Response({'detail': 'Employee is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not Employee.objects.filter(employee_id=employee_id).exists():
            return Response({'detail': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)

        employee = get_employee_profile(request.user)
        assignee = employee if employee else None
        tasks = []
        base_date = date.fromisoformat(start_date) if start_date else timezone.localdate()

        with transaction.atomic():
            for template in checklist.task_templates.all():
                due_date = base_date + timedelta(days=template.due_offset_days or 0)
                tasks.append(
                    OnboardingTask(
                        employee_id=employee_id,
                        template=template,
                        title=template.title,
                        description=template.description,
                        assigned_to=template.assigned_to,
                        due_date=due_date,
                    )
                )
            OnboardingTask.objects.bulk_create(tasks)

        return Response({'created': len(tasks)}, status=status.HTTP_201_CREATED)


class OnboardingTaskTemplateViewSet(viewsets.ModelViewSet):
    queryset = OnboardingTaskTemplate.objects.select_related('checklist')
    serializer_class = OnboardingTaskTemplateSerializer
    permission_classes = [RolePermission]
    permission_required = 'onboarding.manage'
    read_permission = 'onboarding.view'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['title', 'checklist__name']
    filterset_fields = ['checklist', 'assigned_to']


class OnboardingTaskViewSet(viewsets.ModelViewSet):
    queryset = OnboardingTask.objects.select_related('employee', 'template')
    serializer_class = OnboardingTaskSerializer
    permission_classes = [EmployeeOrRolePermission]
    permission_required = 'onboarding.manage'
    read_permission = 'onboarding.view'
    employee_permission = 'onboarding.self'
    employee_write_allowed = True
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'employee__first_name', 'employee__last_name']
    filterset_fields = ['employee', 'status', 'assigned_to']
    ordering_fields = ['due_date', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        if is_employee(self.request.user):
            employee = get_employee_profile(self.request.user)
            if employee:
                return queryset.filter(employee=employee)
            return queryset.none()
        return queryset

    def create(self, request, *args, **kwargs):
        if is_employee(request.user):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        if is_employee(request.user):
            employee = get_employee_profile(request.user)
            if not employee or task.employee_id != employee.employee_id:
                return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        task.status = 'Completed'
        task.completed_at = timezone.now()
        task.save(update_fields=['status', 'completed_at', 'updated_at'])
        serializer = self.get_serializer(task)
        return Response(serializer.data)


class EmployeeDocumentViewSet(viewsets.ModelViewSet):
    queryset = EmployeeDocument.objects.select_related('employee', 'uploaded_by')
    serializer_class = EmployeeDocumentSerializer
    permission_classes = [EmployeeOrRolePermission]
    permission_required = 'onboarding.manage'
    read_permission = 'onboarding.view'
    employee_permission = 'onboarding.self'
    employee_write_allowed = True
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['title', 'employee__first_name', 'employee__last_name']
    filterset_fields = ['employee', 'doc_type', 'status']

    def get_queryset(self):
        queryset = super().get_queryset()
        if is_employee(self.request.user):
            employee = get_employee_profile(self.request.user)
            if employee:
                return queryset.filter(employee=employee)
            return queryset.none()
        return queryset

    def perform_create(self, serializer):
        employee = get_employee_profile(self.request.user)
        if is_employee(self.request.user) and employee:
            serializer.save(employee=employee, uploaded_by=employee)
        else:
            if not serializer.validated_data.get('employee'):
                raise serializers.ValidationError({'employee': 'Employee is required.'})
            serializer.save(uploaded_by=employee)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        document = self.get_object()
        if is_employee(request.user):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        document.status = 'Verified'
        document.notes = request.data.get('notes') or document.notes
        document.save(update_fields=['status', 'notes', 'updated_at'])
        return Response(self.get_serializer(document).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        document = self.get_object()
        if is_employee(request.user):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        document.status = 'Rejected'
        document.notes = request.data.get('notes') or document.notes
        document.save(update_fields=['status', 'notes', 'updated_at'])
        return Response(self.get_serializer(document).data)


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [RolePermission]
    permission_required = 'assets.manage'
    read_permission = 'assets.view'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['asset_tag', 'serial_number', 'model']
    filterset_fields = ['asset_type', 'status']


class AssetAssignmentViewSet(viewsets.ModelViewSet):
    queryset = AssetAssignment.objects.select_related('asset', 'employee', 'assigned_by')
    serializer_class = AssetAssignmentSerializer
    permission_classes = [EmployeeOrRolePermission]
    permission_required = 'assets.manage'
    read_permission = 'assets.view'
    employee_permission = 'assets.self'
    employee_write_allowed = False
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['asset__asset_tag', 'employee__first_name', 'employee__last_name']
    filterset_fields = ['asset', 'employee']

    def get_queryset(self):
        queryset = super().get_queryset()
        if is_employee(self.request.user):
            employee = get_employee_profile(self.request.user)
            if employee:
                return queryset.filter(employee=employee)
            return queryset.none()
        return queryset

    def perform_create(self, serializer):
        assigned_by = get_employee_profile(self.request.user)
        assignment = serializer.save(assigned_by=assigned_by)
        assignment.asset.status = 'Assigned'
        assignment.asset.save(update_fields=['status', 'updated_at'])

    @action(detail=True, methods=['post'])
    def return_asset(self, request, pk=None):
        assignment = self.get_object()
        assignment.returned_at = timezone.now()
        assignment.return_condition = request.data.get('return_condition', assignment.return_condition)
        assignment.notes = request.data.get('notes', assignment.notes)
        assignment.save(update_fields=['returned_at', 'return_condition', 'notes'])
        assignment.asset.status = 'Available'
        assignment.asset.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(assignment).data)


class PolicyViewSet(viewsets.ModelViewSet):
    queryset = Policy.objects.all()
    serializer_class = PolicySerializer
    permission_classes = [EmployeeOrRolePermission]
    permission_required = 'policies.manage'
    read_permission = 'policies.view'
    employee_permission = 'policies.self'
    employee_write_allowed = False
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['title', 'content']
    filterset_fields = ['is_active']

    def get_queryset(self):
        queryset = super().get_queryset()
        if is_employee(self.request.user):
            return queryset.filter(is_active=True)
        return queryset

    def perform_create(self, serializer):
        created_by = get_employee_profile(self.request.user)
        serializer.save(created_by=created_by)


class PolicyAcknowledgmentViewSet(viewsets.ModelViewSet):
    queryset = PolicyAcknowledgment.objects.select_related('policy', 'employee')
    serializer_class = PolicyAcknowledgmentSerializer
    permission_classes = [EmployeeOrRolePermission]
    permission_required = 'policies.manage'
    read_permission = 'policies.view'
    employee_permission = 'policies.self'
    employee_write_allowed = True
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['policy__title', 'employee__first_name', 'employee__last_name']
    filterset_fields = ['policy', 'employee', 'status']

    def get_queryset(self):
        queryset = super().get_queryset()
        if is_employee(self.request.user):
            employee = get_employee_profile(self.request.user)
            if employee:
                return queryset.filter(employee=employee)
            return queryset.none()
        return queryset

    def create(self, request, *args, **kwargs):
        if is_employee(request.user):
            employee = get_employee_profile(request.user)
            if not employee:
                return Response({'detail': 'Employee profile not found.'}, status=status.HTTP_400_BAD_REQUEST)
            mutable_data = request.data.copy()
            mutable_data['employee'] = employee.employee_id
            serializer = self.get_serializer(data=mutable_data)
            serializer.is_valid(raise_exception=True)
            policy = serializer.validated_data['policy']
            if not policy.is_active:
                return Response({'detail': 'Policy is inactive.'}, status=status.HTTP_400_BAD_REQUEST)
            if policy.require_ack is False:
                return Response({'detail': 'Acknowledgment not required.'}, status=status.HTTP_400_BAD_REQUEST)
            if PolicyAcknowledgment.objects.filter(policy=policy, employee=employee).exists():
                return Response({'detail': 'Already acknowledged.'}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return super().create(request, *args, **kwargs)
