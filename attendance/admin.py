from django.contrib import admin
from .models import (
    Attendance,
    Shift,
    EmployeeShift,
    BiometricIntegration,
    BiometricPunch,
    Timesheet,
    OvertimeRequest,
)


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'clock_in_time', 'clock_out_time', 'working_hours', 'status']
    list_filter = ['status', 'date']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__email']
    date_hierarchy = 'date'


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_time', 'end_time', 'break_duration', 'is_active']
    list_filter = ['is_active']


@admin.register(EmployeeShift)
class EmployeeShiftAdmin(admin.ModelAdmin):
    list_display = ['employee', 'shift', 'start_date', 'end_date', 'is_active']
    list_filter = ['is_active', 'shift', 'start_date']


@admin.register(BiometricIntegration)
class BiometricIntegrationAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'provider', 'connection_type', 'is_active', 'last_sync_at']
    list_filter = ['provider', 'connection_type', 'is_active']
    search_fields = ['display_name', 'provider']
    readonly_fields = ['integration_id', 'webhook_token', 'created_at', 'updated_at']


@admin.register(BiometricPunch)
class BiometricPunchAdmin(admin.ModelAdmin):
    list_display = ['employee', 'employee_identifier', 'punch_time', 'direction', 'integration']
    list_filter = ['direction', 'integration']
    search_fields = ['employee_identifier', 'employee__email', 'employee__first_name']
    readonly_fields = ['punch_id', 'created_at']


@admin.register(Timesheet)
class TimesheetAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'working_hours', 'overtime_hours', 'status', 'source']
    list_filter = ['status', 'source', 'date']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__email']
    date_hierarchy = 'date'


@admin.register(OvertimeRequest)
class OvertimeRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'hours', 'status', 'approved_by']
    list_filter = ['status', 'date']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__email']
