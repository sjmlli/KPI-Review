from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import SAFE_METHODS
from django.core.files.base import ContentFile
from django.http import FileResponse
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Payroll, SalaryStructure, ExpenseClaim
from .serializers import (
    PayrollSerializer,
    PayrollCreateSerializer,
    SalaryStructureSerializer,
    ExpenseClaimSerializer,
    ExpenseClaimCreateSerializer,
)
from employees.permissions import (
    RolePermission,
    EmployeeOrRolePermission,
    IsAdminOrManager,
    is_employee,
    is_admin_or_hr,
    get_employee_profile,
    is_manager_user,
)
from .payslip_utils import generate_payslip_pdf


class PayrollViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing payroll
    """
    queryset = Payroll.objects.select_related('employee')
    permission_required = 'payroll.manage'
    read_permission = 'payroll.view'
    employee_permission = 'payroll.self'
    employee_write_allowed = False
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__email']
    filterset_fields = ['employee', 'status', 'pay_period_start', 'pay_period_end']
    ordering_fields = ['pay_period_start', 'pay_period_end', 'created_at']
    ordering = ['-pay_period_start', '-pay_period_end']

    def get_permissions(self):
        return [EmployeeOrRolePermission()]

    def get_queryset(self):
        queryset = Payroll.objects.select_related('employee')
        if is_admin_or_hr(self.request.user):
            return queryset
        employee = get_employee_profile(self.request.user)
        if not employee:
            return queryset.none()
        if is_manager_user(self.request.user):
            return queryset.filter(models.Q(employee=employee) | models.Q(employee__managers=employee))
        return queryset.filter(employee=employee)

    def get_serializer_class(self):
        if self.action == 'create':
            return PayrollCreateSerializer
        return PayrollSerializer

    @action(detail=True, methods=['post'])
    def generate_payslip(self, request, pk=None):
        """Generate payslip for a payroll record"""
        payroll = self.get_object()
        pdf_bytes = generate_payslip_pdf(payroll)
        filename = f"payslip_{payroll.employee.employee_id}_{payroll.pay_period_start}_{payroll.pay_period_end}.pdf"
        payroll.payslip_file.save(filename, ContentFile(pdf_bytes), save=False)
        payroll.payslip_generated = True
        payroll.save()
        serializer = self.get_serializer(payroll)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def download_payslip(self, request, pk=None):
        payroll = self.get_object()
        if not payroll.payslip_file:
            return Response({'detail': 'Payslip not generated yet.'}, status=status.HTTP_404_NOT_FOUND)
        return FileResponse(payroll.payslip_file.open('rb'), content_type='application/pdf')


class SalaryStructureViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing salary structures
    """
    queryset = SalaryStructure.objects.all()
    serializer_class = SalaryStructureSerializer
    permission_classes = [RolePermission]
    permission_required = 'payroll.manage'
    read_permission = 'payroll.view'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['employee', 'is_active']
    search_fields = ['employee__first_name', 'employee__last_name']


class ExpenseClaimViewSet(viewsets.ModelViewSet):
    queryset = ExpenseClaim.objects.select_related('employee', 'approved_by')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__email']
    filterset_fields = ['employee', 'status', 'category', 'expense_date']
    ordering_fields = ['created_at', 'expense_date']
    ordering = ['-created_at']
    permission_required = 'claims.manage'
    read_permission = 'claims.view'
    employee_permission = 'claims.self'

    def get_permissions(self):
        if self.action in ('approve', 'reject'):
            return [IsAdminOrManager()]
        if self.request.method in SAFE_METHODS or self.request.method == 'POST':
            return [EmployeeOrRolePermission()]
        return [RolePermission()]

    def get_queryset(self):
        queryset = ExpenseClaim.objects.select_related('employee', 'approved_by')
        if is_admin_or_hr(self.request.user):
            return queryset
        employee = get_employee_profile(self.request.user)
        if not employee:
            return queryset.none()
        if is_manager_user(self.request.user):
            return queryset.filter(models.Q(employee=employee) | models.Q(employee__managers=employee))
        return queryset.filter(employee=employee)

    def get_serializer_class(self):
        if self.action == 'create':
            return ExpenseClaimCreateSerializer
        return ExpenseClaimSerializer

    def perform_create(self, serializer):
        if is_employee(self.request.user):
            serializer.save(employee=self.request.user.employee_profile)
        else:
            serializer.save()

    @action(detail=True, methods=['put'])
    def approve(self, request, pk=None):
        claim = self.get_object()
        if not self._can_manage_claim(request.user, claim):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        claim.status = 'Approved'
        claim.approved_by = get_employee_profile(request.user)
        claim.approved_at = timezone.now()
        claim.rejection_reason = None
        claim.save(update_fields=['status', 'approved_by', 'approved_at', 'rejection_reason', 'updated_at'])
        return Response(self.get_serializer(claim).data)

    @action(detail=True, methods=['put'])
    def reject(self, request, pk=None):
        claim = self.get_object()
        if not self._can_manage_claim(request.user, claim):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        claim.status = 'Rejected'
        claim.rejection_reason = request.data.get('rejection_reason') or claim.rejection_reason
        claim.approved_by = get_employee_profile(request.user)
        claim.approved_at = timezone.now()
        claim.save(update_fields=['status', 'rejection_reason', 'approved_by', 'approved_at', 'updated_at'])
        return Response(self.get_serializer(claim).data)

    def _can_manage_claim(self, user, claim):
        manager = get_employee_profile(user)
        if is_admin_or_hr(user):
            return True
        return manager and claim.employee.managers.filter(employee_id=manager.employee_id).exists()
