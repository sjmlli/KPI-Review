from rest_framework import serializers
from .models import JobPosting, Recruitment, RecruitmentIntegration, JobPostingIntegration


class JobPostingSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = JobPosting
        fields = [
            'job_posting_id', 'job_title', 'department', 'department_name',
            'description', 'requirements', 'location', 'employment_type',
            'salary_range_min', 'salary_range_max', 'posted_date',
            'closing_date', 'status', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['job_posting_id', 'posted_date', 'created_at', 'updated_at']


class RecruitmentSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job_posting.job_title', read_only=True)
    department_name = serializers.CharField(source='job_posting.department.name', read_only=True)

    class Meta:
        model = Recruitment
        fields = [
            'recruitment_id', 'job_posting', 'job_title', 'department_name',
            'candidate_name', 'email', 'phone_number', 'resume', 'resume_url',
            'profile_url', 'source_provider', 'external_id',
            'cover_letter', 'status', 'interview_date', 'interview_notes',
            'offer_status', 'offer_salary', 'offer_date', 'hired_employee',
            'notes', 'source_payload', 'created_at', 'updated_at'
        ]
        read_only_fields = ['recruitment_id', 'source_payload', 'created_at', 'updated_at']


class JobPostingIntegrationSerializer(serializers.ModelSerializer):
    provider = serializers.CharField(source='integration.provider', read_only=True)
    integration_name = serializers.CharField(source='integration.display_name', read_only=True)

    class Meta:
        model = JobPostingIntegration
        fields = [
            'id', 'job_posting', 'integration', 'provider', 'integration_name',
            'external_job_id', 'external_job_url', 'sync_status', 'sync_message',
            'last_synced_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RecruitmentIntegrationSerializer(serializers.ModelSerializer):
    has_credentials = serializers.SerializerMethodField()

    class Meta:
        model = RecruitmentIntegration
        fields = [
            'integration_id', 'provider', 'display_name', 'is_active',
            'auto_post_jobs', 'auto_sync_applicants', 'credentials',
            'has_credentials', 'webhook_token', 'last_sync_at',
            'last_sync_status', 'last_sync_message', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'integration_id', 'has_credentials', 'webhook_token', 'last_sync_at',
            'last_sync_status', 'last_sync_message', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'credentials': {'write_only': True, 'required': False},
        }

    def get_has_credentials(self, obj):
        return bool(obj.credentials)

    def update(self, instance, validated_data):
        credentials = validated_data.pop('credentials', None)
        if credentials is not None:
            instance.credentials = credentials
        return super().update(instance, validated_data)

