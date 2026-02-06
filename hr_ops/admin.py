from django.contrib import admin

from .models import (
    OnboardingChecklistTemplate,
    OnboardingTaskTemplate,
    OnboardingTask,
    EmployeeDocument,
    Asset,
    AssetAssignment,
    Policy,
    PolicyAcknowledgment,
)


@admin.register(OnboardingChecklistTemplate)
class OnboardingChecklistTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'updated_at']
    list_filter = ['is_active']
    search_fields = ['name']


@admin.register(OnboardingTaskTemplate)
class OnboardingTaskTemplateAdmin(admin.ModelAdmin):
    list_display = ['title', 'checklist', 'assigned_to', 'due_offset_days']
    list_filter = ['assigned_to']
    search_fields = ['title']


@admin.register(OnboardingTask)
class OnboardingTaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'employee', 'assigned_to', 'status', 'due_date']
    list_filter = ['assigned_to', 'status']
    search_fields = ['title', 'employee__first_name', 'employee__last_name']


@admin.register(EmployeeDocument)
class EmployeeDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'employee', 'doc_type', 'status', 'created_at']
    list_filter = ['doc_type', 'status']
    search_fields = ['title', 'employee__first_name', 'employee__last_name']


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ['asset_tag', 'asset_type', 'status']
    list_filter = ['asset_type', 'status']
    search_fields = ['asset_tag', 'serial_number', 'model']


@admin.register(AssetAssignment)
class AssetAssignmentAdmin(admin.ModelAdmin):
    list_display = ['asset', 'employee', 'assigned_at', 'returned_at']
    list_filter = ['assigned_at', 'returned_at']
    search_fields = ['asset__asset_tag', 'employee__first_name', 'employee__last_name']


@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    list_display = ['title', 'version', 'effective_date', 'is_active']
    list_filter = ['is_active']
    search_fields = ['title']


@admin.register(PolicyAcknowledgment)
class PolicyAcknowledgmentAdmin(admin.ModelAdmin):
    list_display = ['policy', 'employee', 'status', 'acknowledged_at']
    list_filter = ['status']
    search_fields = ['policy__title', 'employee__first_name', 'employee__last_name']
