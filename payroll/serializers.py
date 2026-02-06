from rest_framework import serializers
from .models import Payroll, SalaryStructure, ExpenseClaim
from employees.serializers import EmployeeListSerializer


class PayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = Payroll
        fields = [
            'payroll_id', 'employee', 'employee_name', 'pay_period_start',
            'pay_period_end', 'basic_salary', 'allowances', 'bonus',
            'overtime_pay', 'deductions', 'tax', 'insurance', 'net_pay',
            'status', 'payslip_generated', 'payslip_file', 'payment_date',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['payroll_id', 'net_pay', 'created_at', 'updated_at']


class PayrollCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payroll records"""
    
    class Meta:
        model = Payroll
        fields = [
            'employee', 'pay_period_start', 'pay_period_end',
            'basic_salary', 'allowances', 'bonus', 'overtime_pay',
            'deductions', 'tax', 'insurance', 'notes'
        ]


class SalaryStructureSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    total_salary = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = SalaryStructure
        fields = [
            'structure_id', 'employee', 'employee_name', 'basic_salary',
            'house_rent_allowance', 'transport_allowance', 'medical_allowance',
            'other_allowances', 'provident_fund_percentage', 'tax_percentage',
            'total_salary', 'effective_from', 'effective_to', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['structure_id', 'created_at', 'updated_at']


class ExpenseClaimSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)

    class Meta:
        model = ExpenseClaim
        fields = [
            'claim_id', 'employee', 'employee_name', 'category', 'amount', 'currency',
            'expense_date', 'description', 'receipt', 'status', 'approved_by',
            'approved_by_name', 'approved_at', 'rejection_reason', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'claim_id', 'approved_by', 'approved_at', 'created_at', 'updated_at',
        ]


class ExpenseClaimCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseClaim
        fields = [
            'employee', 'category', 'amount', 'currency', 'expense_date',
            'description', 'receipt', 'notes',
        ]
        extra_kwargs = {
            'employee': {'required': False},
        }

