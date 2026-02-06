from django.contrib import admin
from .models import LeaveRequest, LeaveBalance, Holiday


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'start_date', 'end_date', 'total_days', 'status', 'created_at']
    list_filter = ['status', 'leave_type', 'start_date']
    search_fields = ['employee__first_name', 'employee__last_name']
    date_hierarchy = 'start_date'
    readonly_fields = ['leave_id', 'created_at', 'updated_at']


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'balance', 'used', 'available', 'year']
    list_filter = ['leave_type', 'year']
    search_fields = ['employee__first_name', 'employee__last_name']


@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ['name', 'date', 'is_active']
    list_filter = ['is_active', 'date']
    search_fields = ['name']
