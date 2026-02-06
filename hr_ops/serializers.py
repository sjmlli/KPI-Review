from rest_framework import serializers
from employees.models import Employee
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


class OnboardingChecklistTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingChecklistTemplate
        fields = ['template_id', 'name', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['template_id', 'created_at', 'updated_at']


class OnboardingTaskTemplateSerializer(serializers.ModelSerializer):
    checklist_name = serializers.CharField(source='checklist.name', read_only=True)

    class Meta:
        model = OnboardingTaskTemplate
        fields = [
            'task_template_id', 'checklist', 'checklist_name', 'title', 'description',
            'assigned_to', 'due_offset_days', 'created_at', 'updated_at'
        ]
        read_only_fields = ['task_template_id', 'created_at', 'updated_at']


class OnboardingTaskSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    template_title = serializers.CharField(source='template.title', read_only=True)

    class Meta:
        model = OnboardingTask
        fields = [
            'task_id', 'employee', 'employee_name', 'template', 'template_title',
            'title', 'description', 'assigned_to', 'due_date', 'status',
            'notes', 'completed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['task_id', 'completed_at', 'created_at', 'updated_at']


class EmployeeDocumentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)

    class Meta:
        model = EmployeeDocument
        fields = [
            'document_id', 'employee', 'employee_name', 'doc_type', 'title', 'file',
            'uploaded_by', 'uploaded_by_name', 'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['document_id', 'created_at', 'updated_at', 'uploaded_by']
        extra_kwargs = {
            'employee': {'required': False},
        }


class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = [
            'asset_id', 'asset_type', 'asset_tag', 'serial_number', 'model',
            'status', 'purchase_date', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['asset_id', 'created_at', 'updated_at']


class AssetAssignmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    asset_tag = serializers.CharField(source='asset.asset_tag', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.full_name', read_only=True)

    class Meta:
        model = AssetAssignment
        fields = [
            'assignment_id', 'asset', 'asset_tag', 'employee', 'employee_name',
            'assigned_by', 'assigned_by_name', 'assigned_at', 'returned_at',
            'return_condition', 'notes'
        ]
        read_only_fields = ['assignment_id', 'assigned_at', 'assigned_by']


class PolicySerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = Policy
        fields = [
            'policy_id', 'title', 'content', 'version', 'effective_date',
            'is_active', 'require_ack', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['policy_id', 'created_at', 'updated_at', 'created_by']


class PolicyAcknowledgmentSerializer(serializers.ModelSerializer):
    policy_title = serializers.CharField(source='policy.title', read_only=True)
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = PolicyAcknowledgment
        fields = [
            'acknowledgment_id', 'policy', 'policy_title', 'employee', 'employee_name',
            'status', 'comment', 'acknowledged_at', 'created_at'
        ]
        read_only_fields = ['acknowledgment_id', 'acknowledged_at', 'created_at']
