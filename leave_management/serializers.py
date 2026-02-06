from rest_framework import serializers
from .models import LeaveRequest, LeaveBalance, Holiday
from employees.serializers import EmployeeListSerializer


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            'leave_id', 'employee', 'employee_name', 'leave_type',
            'start_date', 'end_date', 'total_days', 'status', 'reason',
            'approved_by', 'approved_by_name', 'rejection_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['leave_id', 'created_at', 'updated_at']


class LeaveRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating leave requests"""
    
    class Meta:
        model = LeaveRequest
        fields = [
            'employee', 'leave_type', 'start_date', 'end_date',
            'total_days', 'reason'
        ]

    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError("End date must be after start date.")
        
        return data


class LeaveBalanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    available = serializers.IntegerField(read_only=True)

    class Meta:
        model = LeaveBalance
        fields = [
            'balance_id', 'employee', 'employee_name', 'leave_type',
            'balance', 'used', 'available', 'year', 'created_at', 'updated_at'
        ]
        read_only_fields = ['balance_id', 'created_at', 'updated_at']


class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = ['holiday_id', 'name', 'date', 'is_active', 'description', 'created_at']
        read_only_fields = ['holiday_id', 'created_at']

