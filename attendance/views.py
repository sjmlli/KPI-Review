from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import SAFE_METHODS, AllowAny
from rest_framework.views import APIView
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Attendance, Shift, EmployeeShift, BiometricIntegration, BiometricPunch, Timesheet, OvertimeRequest
from .serializers import (
    AttendanceSerializer,
    AttendanceCreateSerializer,
    ShiftSerializer,
    EmployeeShiftSerializer,
    BiometricIntegrationSerializer,
    BiometricPunchSerializer,
    TimesheetSerializer,
    OvertimeRequestSerializer,
    OvertimeRequestCreateSerializer,
)
from employees.permissions import (
    EmployeeOrRolePermission,
    RolePermission,
    IsAdminOrManager,
    is_employee,
    is_admin_or_hr,
    get_employee_profile,
    is_manager_user,
    is_manager_of,
)
from .biometric_utils import parse_punch_payload, update_attendance_from_punch
from .timesheet_utils import update_timesheet_from_attendance


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing attendance
    """
    queryset = Attendance.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['employee__first_name', 'employee__last_name']
    filterset_fields = ['employee', 'status', 'date']
    ordering_fields = ['date', 'clock_in_time']
    ordering = ['-date', '-clock_in_time']

    permission_required = 'attendance.manage'
    read_permission = 'attendance.view'
    employee_write_allowed = False
    employee_permission = 'attendance.self'

    def get_permissions(self):
        return [EmployeeOrRolePermission()]

    def get_queryset(self):
        queryset = Attendance.objects.all()
        if is_employee(self.request.user):
            employee = getattr(self.request.user, 'employee_profile', None)
            if employee:
                return queryset.filter(employee=employee)
        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return AttendanceCreateSerializer
        return AttendanceSerializer

    def perform_create(self, serializer):
        attendance = serializer.save()
        update_timesheet_from_attendance(attendance, source='Attendance')

    def perform_update(self, serializer):
        attendance = serializer.save()
        update_timesheet_from_attendance(attendance, source='Attendance')

    @action(detail=False, methods=['post'])
    def clock_in(self, request):
        """Clock in for an employee"""
        employee_id = request.data.get('employee_id')
        # Implementation for clock in
        return Response({'message': 'Clocked in successfully'})

    @action(detail=False, methods=['post'])
    def clock_out(self, request):
        """Clock out for an employee"""
        employee_id = request.data.get('employee_id')
        # Implementation for clock out
        return Response({'message': 'Clocked out successfully'})


class ShiftViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing shifts
    """
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    permission_classes = [RolePermission]
    permission_required = 'attendance.manage'
    read_permission = 'attendance.view'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active']
    search_fields = ['name']


class EmployeeShiftViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing employee shift assignments
    """
    queryset = EmployeeShift.objects.all()
    serializer_class = EmployeeShiftSerializer
    permission_classes = [RolePermission]
    permission_required = 'attendance.manage'
    read_permission = 'attendance.view'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['employee', 'shift', 'is_active']
    search_fields = ['employee__first_name', 'employee__last_name']


class BiometricIntegrationViewSet(viewsets.ModelViewSet):
    queryset = BiometricIntegration.objects.all()
    serializer_class = BiometricIntegrationSerializer
    permission_classes = [RolePermission]
    permission_required = 'attendance.manage'
    read_permission = 'attendance.view'

    @action(detail=True, methods=['post'])
    def test(self, request, pk=None):
        integration = self.get_object()
        if not integration.credentials:
            return Response(
                {'success': False, 'message': 'No credentials stored.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'success': True, 'message': 'Credentials saved.'})

    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        integration = self.get_object()
        if integration.connection_type != 'Polling':
            return Response(
                {'success': False, 'message': 'Sync available only for polling integrations.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        integration.last_sync_at = timezone.now()
        integration.last_sync_status = 'Queued'
        integration.last_sync_message = 'Polling sync queued (stub).'
        integration.save(update_fields=['last_sync_at', 'last_sync_status', 'last_sync_message'])
        return Response({'success': True, 'message': 'Sync queued.'})


class BiometricPunchViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BiometricPunch.objects.select_related('employee', 'integration')
    serializer_class = BiometricPunchSerializer
    permission_classes = [RolePermission]
    permission_required = 'attendance.view'
    read_permission = 'attendance.view'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['employee__first_name', 'employee__last_name', 'employee_identifier']
    filterset_fields = ['integration', 'employee']
    ordering_fields = ['punch_time', 'created_at']
    ordering = ['-punch_time']


class BiometricWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.headers.get('X-Biometric-Token') or request.query_params.get('token')
        integration = BiometricIntegration.objects.filter(
            webhook_token=token,
            is_active=True,
        ).first()
        if not integration:
            return Response(
                {'success': False, 'message': 'Invalid token.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        payload = request.data if isinstance(request.data, dict) else {}
        punches = parse_punch_payload(integration, payload)
        if not punches:
            return Response(
                {'success': False, 'message': 'No punch records found.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created = 0
        for punch_data in punches:
            punch = BiometricPunch.objects.create(
                integration=integration,
                employee=punch_data['employee'],
                employee_identifier=punch_data['employee_identifier'],
                device_id=integration.device_id,
                punch_time=punch_data['punch_time'],
                direction=punch_data['direction'],
                raw_payload=punch_data['raw_payload'],
            )
            if punch.employee:
                update_attendance_from_punch(punch.employee, punch.punch_time)
            created += 1

        integration.last_sync_at = timezone.now()
        integration.last_sync_status = 'Success'
        integration.last_sync_message = f'Webhook ingested {created} punches.'
        integration.save(update_fields=['last_sync_at', 'last_sync_status', 'last_sync_message'])

        return Response({'success': True, 'created': created}, status=status.HTTP_201_CREATED)


class TimesheetViewSet(viewsets.ModelViewSet):
    queryset = Timesheet.objects.select_related('employee')
    serializer_class = TimesheetSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__email']
    filterset_fields = ['employee', 'status', 'date']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']
    permission_required = 'timesheet.manage'
    read_permission = 'timesheet.view'
    employee_permission = 'timesheet.self'
    employee_write_allowed = False

    def get_permissions(self):
        if self.action in ('approve', 'reject'):
            return [IsAdminOrManager()]
        return [EmployeeOrRolePermission()]

    def get_queryset(self):
        queryset = Timesheet.objects.select_related('employee')
        if is_admin_or_hr(self.request.user):
            return queryset
        employee = get_employee_profile(self.request.user)
        if not employee:
            return queryset.none()
        if is_manager_user(self.request.user):
            return queryset.filter(models.Q(employee=employee) | models.Q(employee__managers=employee))
        return queryset.filter(employee=employee)

    @action(detail=True, methods=['put'])
    def approve(self, request, pk=None):
        timesheet = self.get_object()
        if not self._can_manage_timesheet(request.user, timesheet):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        timesheet.status = 'Approved'
        timesheet.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(timesheet).data)

    @action(detail=True, methods=['put'])
    def reject(self, request, pk=None):
        timesheet = self.get_object()
        if not self._can_manage_timesheet(request.user, timesheet):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        timesheet.status = 'Rejected'
        timesheet.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(timesheet).data)

    def _can_manage_timesheet(self, user, timesheet):
        manager = get_employee_profile(user)
        if is_admin_or_hr(user):
            return True
        return is_manager_of(manager, timesheet.employee)


class OvertimeRequestViewSet(viewsets.ModelViewSet):
    queryset = OvertimeRequest.objects.select_related('employee', 'timesheet', 'approved_by')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__email']
    filterset_fields = ['employee', 'status', 'date']
    ordering_fields = ['created_at', 'date']
    ordering = ['-created_at']
    permission_required = 'overtime.manage'
    read_permission = 'overtime.view'
    employee_permission = 'overtime.self'

    def get_permissions(self):
        if self.action in ('approve', 'reject'):
            return [IsAdminOrManager()]
        if self.request.method in SAFE_METHODS or self.request.method == 'POST':
            return [EmployeeOrRolePermission()]
        return [RolePermission()]

    def get_queryset(self):
        queryset = OvertimeRequest.objects.select_related('employee', 'timesheet', 'approved_by')
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
            return OvertimeRequestCreateSerializer
        return OvertimeRequestSerializer

    def perform_create(self, serializer):
        if is_employee(self.request.user):
            serializer.save(employee=self.request.user.employee_profile)
        else:
            serializer.save()

    @action(detail=True, methods=['put'])
    def approve(self, request, pk=None):
        overtime_request = self.get_object()
        if not self._can_manage_request(request.user, overtime_request):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        overtime_request.status = 'Approved'
        overtime_request.approved_by = get_employee_profile(request.user)
        overtime_request.approved_at = timezone.now()
        overtime_request.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])
        return Response(self.get_serializer(overtime_request).data)

    @action(detail=True, methods=['put'])
    def reject(self, request, pk=None):
        overtime_request = self.get_object()
        if not self._can_manage_request(request.user, overtime_request):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        overtime_request.status = 'Rejected'
        overtime_request.notes = request.data.get('notes') or overtime_request.notes
        overtime_request.approved_by = get_employee_profile(request.user)
        overtime_request.approved_at = timezone.now()
        overtime_request.save(update_fields=['status', 'notes', 'approved_by', 'approved_at', 'updated_at'])
        return Response(self.get_serializer(overtime_request).data)

    def _can_manage_request(self, user, overtime_request):
        manager = get_employee_profile(user)
        if is_admin_or_hr(user):
            return True
        return is_manager_of(manager, overtime_request.employee)
