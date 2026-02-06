from rest_framework import serializers
from .models import (
    Attendance,
    Shift,
    EmployeeShift,
    BiometricIntegration,
    BiometricPunch,
    Timesheet,
    OvertimeRequest,
)
from employees.serializers import EmployeeListSerializer


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'attendance_id', 'employee', 'employee_name', 'date',
            'clock_in_time', 'clock_out_time', 'working_hours',
            'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['attendance_id', 'created_at', 'updated_at']


class AttendanceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating attendance records"""
    
    class Meta:
        model = Attendance
        fields = [
            'employee', 'date', 'clock_in_time', 'clock_out_time',
            'working_hours', 'status', 'notes'
        ]


class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = [
            'shift_id', 'name', 'start_time', 'end_time',
            'break_duration', 'description', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['shift_id', 'created_at', 'updated_at']


class EmployeeShiftSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    shift_name = serializers.CharField(source='shift.name', read_only=True)

    class Meta:
        model = EmployeeShift
        fields = [
            'id', 'employee', 'employee_name', 'shift', 'shift_name',
            'start_date', 'end_date', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class BiometricIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BiometricIntegration
        fields = [
            'integration_id', 'provider', 'display_name', 'connection_type',
            'base_url', 'device_id', 'credentials', 'data_mapping',
            'webhook_token', 'is_active', 'auto_sync', 'last_sync_at',
            'last_sync_status', 'last_sync_message', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'integration_id', 'webhook_token', 'last_sync_at',
            'last_sync_status', 'last_sync_message', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'credentials': {'write_only': True, 'required': False},
        }


class BiometricPunchSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = BiometricPunch
        fields = [
            'punch_id', 'integration', 'employee', 'employee_name',
            'employee_identifier', 'device_id', 'punch_time', 'direction',
            'raw_payload', 'created_at'
        ]
        read_only_fields = ['punch_id', 'created_at']


class TimesheetSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = Timesheet
        fields = [
            'timesheet_id', 'employee', 'employee_name', 'date',
            'clock_in_time', 'clock_out_time', 'working_hours',
            'overtime_hours', 'status', 'source', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['timesheet_id', 'created_at', 'updated_at']


class OvertimeRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)
    timesheet_date = serializers.DateField(source='timesheet.date', read_only=True)

    class Meta:
        model = OvertimeRequest
        fields = [
            'overtime_id', 'employee', 'employee_name', 'timesheet', 'timesheet_date',
            'date', 'hours', 'reason', 'status', 'approved_by', 'approved_by_name',
            'approved_at', 'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'overtime_id', 'approved_by', 'approved_at', 'created_at', 'updated_at',
        ]


class OvertimeRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OvertimeRequest
        fields = [
            'employee', 'timesheet', 'date', 'hours', 'reason', 'notes',
        ]
        extra_kwargs = {
            'employee': {'required': False},
        }

