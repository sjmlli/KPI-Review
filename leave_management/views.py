from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import SAFE_METHODS
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import LeaveRequest, LeaveBalance, Holiday
from .serializers import (
    LeaveRequestSerializer,
    LeaveRequestCreateSerializer,
    LeaveBalanceSerializer,
    HolidaySerializer
)
from employees.permissions import (
    EmployeeOrRolePermission,
    IsManager,
    is_admin_or_hr,
    is_employee,
    get_employee_profile,
    is_manager_user,
    is_manager_of,
)
from employees.role_utils import get_emails_for_permission
from employees.email_utils import send_templated_email
from .emails import (
    leave_request_created_email,
    leave_request_approved_email,
    leave_request_rejected_email,
)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing leave requests
    """
    queryset = LeaveRequest.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__email']
    filterset_fields = ['employee', 'status', 'leave_type']
    ordering_fields = ['created_at', 'start_date']
    ordering = ['-created_at']
    permission_required = 'leave.manage'
    read_permission = 'leave.view'
    employee_permission = 'leave.self'

    def get_permissions(self):
        if self.request.method in SAFE_METHODS or self.request.method == 'POST':
            return [EmployeeOrRolePermission()]
        return [IsManager()]

    def get_queryset(self):
        queryset = LeaveRequest.objects.all()
        if is_admin_or_hr(self.request.user):
            return queryset
        employee = get_employee_profile(self.request.user)
        if not employee:
            return queryset.none()
        if is_manager_user(self.request.user):
            return queryset.filter(Q(employee=employee) | Q(employee__managers=employee))
        return queryset.filter(employee=employee)

    def get_serializer_class(self):
        if self.action == 'create':
            return LeaveRequestCreateSerializer
        return LeaveRequestSerializer

    def perform_create(self, serializer):
        leave_request = None
        if is_employee(self.request.user):
            leave_request = serializer.save(employee=self.request.user.employee_profile)
        else:
            leave_request = serializer.save()

        if leave_request:
            self._send_leave_notification(leave_request, event='created')

    @action(detail=True, methods=['put'])
    def approve(self, request, pk=None):
        """Approve a leave request"""
        leave_request = self.get_object()
        if not self._can_manage_leave(request.user, leave_request):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        leave_request.status = 'Approved'
        leave_request.approved_by = request.user.employee_profile if hasattr(request.user, 'employee_profile') else None
        leave_request.save()
        
        self._apply_leave_balance(leave_request)
        self._send_leave_notification(leave_request, event='approved')
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)

    @action(detail=True, methods=['put'])
    def reject(self, request, pk=None):
        """Reject a leave request"""
        leave_request = self.get_object()
        if not self._can_manage_leave(request.user, leave_request):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        rejection_reason = request.data.get('rejection_reason', '')
        leave_request.status = 'Rejected'
        leave_request.rejection_reason = rejection_reason
        leave_request.save()
        self._send_leave_notification(leave_request, event='rejected')
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        leave_request = self.get_object()
        if not self._can_manage_leave(request.user, leave_request):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        previous_status = leave_request.status
        response = super().update(request, *args, **kwargs)
        leave_request.refresh_from_db()
        if leave_request.status != previous_status:
            if leave_request.status == 'Approved':
                self._apply_leave_balance(leave_request)
                self._send_leave_notification(leave_request, event='approved')
            elif leave_request.status == 'Rejected':
                self._send_leave_notification(leave_request, event='rejected')
        return response

    def partial_update(self, request, *args, **kwargs):
        leave_request = self.get_object()
        if not self._can_manage_leave(request.user, leave_request):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        previous_status = leave_request.status
        response = super().partial_update(request, *args, **kwargs)
        leave_request.refresh_from_db()
        if leave_request.status != previous_status:
            if leave_request.status == 'Approved':
                self._apply_leave_balance(leave_request)
                self._send_leave_notification(leave_request, event='approved')
            elif leave_request.status == 'Rejected':
                self._send_leave_notification(leave_request, event='rejected')
        return response

    def _can_manage_leave(self, user, leave_request):
        manager = get_employee_profile(user)
        return is_manager_of(manager, leave_request.employee)

    def _send_leave_notification(self, leave_request, event):
        manager_emails = list(leave_request.employee.managers.values_list('email', flat=True))
        admin_emails = get_emails_for_permission('leave.manage')
        recipients = [leave_request.employee.email, *manager_emails, *admin_emails]

        if event == 'created':
            content = leave_request_created_email(leave_request)
        elif event == 'approved':
            content = leave_request_approved_email(leave_request)
        else:
            content = leave_request_rejected_email(leave_request)

        send_templated_email(content['subject'], content['html'], recipients)

    def _apply_leave_balance(self, leave_request):
        leave_balance, _ = LeaveBalance.objects.get_or_create(
            employee=leave_request.employee,
            leave_type=leave_request.leave_type,
            year=leave_request.start_date.year,
            defaults={'balance': 0, 'used': 0}
        )
        leave_balance.used += leave_request.total_days
        leave_balance.save()


class LeaveBalanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing leave balances
    """
    queryset = LeaveBalance.objects.all()
    serializer_class = LeaveBalanceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['employee', 'leave_type', 'year']
    search_fields = ['employee__first_name', 'employee__last_name']
    permission_required = 'leave.manage'
    read_permission = 'leave.view'
    employee_permission = 'leave.self'
    employee_write_allowed = False

    def get_permissions(self):
        return [EmployeeOrRolePermission()]

    def get_queryset(self):
        queryset = LeaveBalance.objects.all()
        if is_employee(self.request.user):
            employee = getattr(self.request.user, 'employee_profile', None)
            if employee:
                return queryset.filter(employee=employee)
        return queryset


class HolidayViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing holidays
    """
    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_active']
    ordering_fields = ['date']
    ordering = ['date']
    permission_required = 'leave.manage'
    read_permission = 'leave.view'
    employee_permission = 'leave.self'
    employee_write_allowed = False

    def get_permissions(self):
        return [EmployeeOrRolePermission()]
