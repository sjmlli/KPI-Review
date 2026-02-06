from django.contrib import admin
from .models import JobPosting, Recruitment, RecruitmentIntegration, JobPostingIntegration


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ['job_title', 'department', 'employment_type', 'status', 'posted_date', 'closing_date']
    list_filter = ['status', 'employment_type', 'posted_date']
    search_fields = ['job_title', 'department__name']
    date_hierarchy = 'posted_date'
    readonly_fields = ['job_posting_id', 'created_at', 'updated_at']


@admin.register(Recruitment)
class RecruitmentAdmin(admin.ModelAdmin):
    list_display = ['candidate_name', 'job_posting', 'source_provider', 'status', 'offer_status', 'interview_date', 'created_at']
    list_filter = ['source_provider', 'status', 'offer_status', 'interview_date']
    search_fields = ['candidate_name', 'email', 'job_posting__job_title']
    readonly_fields = ['recruitment_id', 'created_at', 'updated_at']


@admin.register(RecruitmentIntegration)
class RecruitmentIntegrationAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'provider', 'is_active', 'auto_post_jobs', 'auto_sync_applicants', 'last_sync_at']
    list_filter = ['provider', 'is_active', 'auto_post_jobs', 'auto_sync_applicants']
    search_fields = ['display_name', 'provider']
    readonly_fields = ['integration_id', 'webhook_token', 'created_at', 'updated_at']


@admin.register(JobPostingIntegration)
class JobPostingIntegrationAdmin(admin.ModelAdmin):
    list_display = ['job_posting', 'integration', 'sync_status', 'last_synced_at']
    list_filter = ['sync_status', 'integration__provider']
    search_fields = ['job_posting__job_title', 'integration__display_name', 'external_job_id']
    readonly_fields = ['created_at', 'updated_at']
