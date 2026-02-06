from django.contrib import admin
from .models import Payroll, SalaryStructure, ExpenseClaim


@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display = ['employee', 'pay_period_start', 'pay_period_end', 'net_pay', 'status', 'payment_date']
    list_filter = ['status', 'pay_period_start']
    search_fields = ['employee__first_name', 'employee__last_name']
    readonly_fields = ['payroll_id', 'created_at', 'updated_at']
    date_hierarchy = 'pay_period_start'


@admin.register(SalaryStructure)
class SalaryStructureAdmin(admin.ModelAdmin):
    list_display = ['employee', 'basic_salary', 'total_salary', 'effective_from', 'is_active']
    list_filter = ['is_active', 'effective_from']
    search_fields = ['employee__first_name', 'employee__last_name']


@admin.register(ExpenseClaim)
class ExpenseClaimAdmin(admin.ModelAdmin):
    list_display = ['employee', 'category', 'amount', 'status', 'expense_date']
    list_filter = ['status', 'category', 'expense_date']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__email']
