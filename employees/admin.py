from django.contrib import admin
from .models import (
    Department,
    Employee,
    Role,
    AuditLog,
    EmailSettings,
    OfferLetterTemplate,
    OfferLetter,
)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'manager', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    autocomplete_fields = ['manager']


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'department', 'designation', 'role', 'status', 'hire_date']
    list_filter = ['role', 'status', 'department', 'designation', 'hire_date']
    search_fields = ['first_name', 'last_name', 'email', 'employee_id']
    readonly_fields = ['employee_id', 'created_at', 'updated_at']
    filter_horizontal = ['managers']
    fieldsets = (
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone_number', 'date_of_birth', 'address')
        }),
        ('Employment Information', {
            'fields': ('employee_id', 'department', 'designation', 'role', 'hire_date', 'status', 'salary')
        }),
        ('Reporting Structure', {
            'fields': ('managers', 'team_lead')
        }),
        ('Emergency Contact', {
            'fields': ('emergency_contact_name', 'emergency_contact_phone')
        }),
        ('Bank Information', {
            'fields': ('bank_account_number', 'bank_name')
        }),
        ('System', {
            'fields': ('user', 'created_at', 'updated_at')
        }),
    )


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'portal', 'is_system', 'updated_at']
    list_filter = ['portal', 'is_system']
    search_fields = ['name']
    readonly_fields = ['role_id', 'created_at', 'updated_at']


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['table_name', 'record_id', 'action_type', 'changed_by', 'timestamp']
    list_filter = ['action_type', 'table_name', 'timestamp']
    search_fields = ['table_name', 'record_id']
    readonly_fields = ['audit_id', 'timestamp']
    date_hierarchy = 'timestamp'


@admin.register(EmailSettings)
class EmailSettingsAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'from_email', 'smtp_host', 'smtp_port', 'is_active', 'updated_at']
    list_filter = ['is_active']
    search_fields = ['display_name', 'from_email', 'smtp_host']
    readonly_fields = ['settings_id', 'created_at', 'updated_at']


@admin.register(OfferLetterTemplate)
class OfferLetterTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'company_name', 'is_active', 'updated_at']
    list_filter = ['is_active']
    search_fields = ['name', 'company_name']
    readonly_fields = ['template_id', 'created_at', 'updated_at']


@admin.register(OfferLetter)
class OfferLetterAdmin(admin.ModelAdmin):
    list_display = ['employee', 'designation', 'joining_date', 'issued_at']
    list_filter = ['joining_date']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__email']
    readonly_fields = ['offer_letter_id', 'issued_at', 'updated_at']
