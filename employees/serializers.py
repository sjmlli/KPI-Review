from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Department, Employee, Role, EmailSettings, OfferLetterTemplate, OfferLetter
from .permissions import has_role_permission
from .role_utils import DEFAULT_ROLE_DEFINITIONS, get_role_portal, get_role_permissions


class DepartmentSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)

    class Meta:
        model = Department
        fields = ['department_id', 'name', 'manager', 'manager_name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['department_id', 'created_at', 'updated_at']


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    full_name = serializers.CharField(read_only=True)
    managers = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Employee.objects.all(),
        required=False
    )
    managers_details = serializers.SerializerMethodField()
    team_lead_name = serializers.CharField(source='team_lead.full_name', read_only=True)
    direct_reports_count = serializers.IntegerField(source='direct_reports.count', read_only=True)
    role_portal = serializers.SerializerMethodField()
    role_permissions = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'employee_id', 'first_name', 'last_name', 'full_name', 'email',
            'phone_number', 'date_of_birth', 'hire_date', 'department',
            'department_name', 'designation', 'role', 'salary', 'status', 'address',
            'managers', 'managers_details', 'team_lead', 'team_lead_name',
            'direct_reports_count', 'role_portal', 'role_permissions',
            'emergency_contact_name', 'emergency_contact_phone',
            'bank_account_number', 'bank_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['employee_id', 'created_at', 'updated_at']

    def get_managers_details(self, obj):
        return [
            {
                'employee_id': manager.employee_id,
                'full_name': manager.full_name,
                'email': manager.email,
                'designation': manager.designation,
            }
            for manager in obj.managers.all()
        ]

    def update(self, instance, validated_data):
        managers = validated_data.pop('managers', None)
        instance = super().update(instance, validated_data)
        if managers is not None:
            instance.managers.set(managers)
        return instance

    def get_role_portal(self, obj):
        return get_role_portal(obj.role)

    def get_role_permissions(self, obj):
        return get_role_permissions(obj.role)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if not request:
            return data
        if not has_role_permission(request.user, 'employees.view_salary'):
            data.pop('salary', None)
        if not has_role_permission(request.user, 'employees.view_bank'):
            data.pop('bank_account_number', None)
            data.pop('bank_name', None)
        return data

class EmployeeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating employees"""
    password = serializers.CharField(write_only=True, required=False)
    managers = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Employee.objects.all(),
        required=False
    )

    class Meta:
        model = Employee
        fields = [
            'first_name', 'last_name', 'email', 'password', 'phone_number',
            'date_of_birth', 'hire_date', 'department', 'designation',
            'role', 'salary', 'status', 'address', 'managers', 'team_lead'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        email = validated_data.get('email')
        
        # Create user account if password is provided
        user = None
        if password:
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password
            )
        
        managers = validated_data.pop('managers', [])
        employee = Employee.objects.create(user=user, **validated_data)
        if managers:
            employee.managers.set(managers)
        return employee

    def validate_role(self, value):
        if Role.objects.filter(name__iexact=value).exists():
            return value
        if value in DEFAULT_ROLE_DEFINITIONS:
            return value
        raise serializers.ValidationError('Invalid role. Please choose a configured role.')


class EmployeeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for employee lists"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = Employee
        fields = [
            'employee_id', 'full_name', 'email', 'department_name',
            'designation', 'status', 'hire_date'
        ]


class EmailSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailSettings
        fields = [
            'settings_id', 'display_name', 'from_email', 'smtp_host', 'smtp_port',
            'smtp_username', 'smtp_password', 'use_tls', 'use_ssl', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['settings_id', 'created_at', 'updated_at']
        extra_kwargs = {
            'smtp_password': {'write_only': True, 'required': False},
        }


class OfferLetterTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfferLetterTemplate
        fields = [
            'template_id', 'name', 'company_name', 'company_address',
            'company_logo', 'subject', 'body', 'footer', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['template_id', 'created_at', 'updated_at']


class OfferLetterSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    reporting_manager_name = serializers.CharField(source='reporting_manager.full_name', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)

    class Meta:
        model = OfferLetter
        fields = [
            'offer_letter_id', 'employee', 'employee_name', 'joining_date', 'ctc',
            'designation', 'probation_period', 'reporting_manager',
            'reporting_manager_name', 'work_location', 'benefits',
            'shift_timings', 'template', 'template_name', 'pdf_file',
            'issued_by', 'issued_at', 'updated_at'
        ]
        read_only_fields = ['offer_letter_id', 'issued_at', 'updated_at', 'pdf_file']


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = [
            'role_id', 'name', 'description', 'portal', 'permissions', 'is_system',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['role_id', 'created_at', 'updated_at']

