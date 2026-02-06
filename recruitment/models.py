import secrets
from django.db import models
from employees.models import Department, Employee


def default_webhook_token():
    return secrets.token_urlsafe(24)


class JobPosting(models.Model):
    """Job posting model"""
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Closed', 'Closed'),
        ('Draft', 'Draft'),
    ]

    job_posting_id = models.AutoField(primary_key=True)
    job_title = models.CharField(max_length=255)
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='job_postings'
    )
    description = models.TextField()
    requirements = models.TextField()
    location = models.CharField(max_length=255, blank=True, null=True)
    employment_type = models.CharField(
        max_length=50,
        choices=[
            ('Full-time', 'Full-time'),
            ('Part-time', 'Part-time'),
            ('Contract', 'Contract'),
            ('Internship', 'Internship'),
        ],
        default='Full-time'
    )
    salary_range_min = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    salary_range_max = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    posted_date = models.DateField(auto_now_add=True)
    closing_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    created_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_job_postings'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'job_postings'
        ordering = ['-posted_date']

    def __str__(self):
        return f"{self.job_title} - {self.department}"


class Recruitment(models.Model):
    """Recruitment/Application model"""
    STATUS_CHOICES = [
        ('Applied', 'Applied'),
        ('Screening', 'Screening'),
        ('Interviewed', 'Interviewed'),
        ('Shortlisted', 'Shortlisted'),
        ('Hired', 'Hired'),
        ('Rejected', 'Rejected'),
        ('Withdrawn', 'Withdrawn'),
    ]

    SOURCE_CHOICES = [
        ('Manual', 'Manual'),
        ('LinkedIn', 'LinkedIn'),
        ('Naukri', 'Naukri'),
    ]

    OFFER_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Offered', 'Offered'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    ]

    recruitment_id = models.AutoField(primary_key=True)
    job_posting = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    candidate_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    resume_url = models.URLField(blank=True, null=True)
    profile_url = models.URLField(blank=True, null=True)
    source_provider = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='Manual')
    external_id = models.CharField(max_length=255, blank=True, null=True)
    cover_letter = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Applied')
    interview_date = models.DateTimeField(blank=True, null=True)
    interview_notes = models.TextField(blank=True, null=True)
    offer_status = models.CharField(max_length=20, choices=OFFER_STATUS_CHOICES, blank=True, null=True)
    offer_salary = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    offer_date = models.DateField(blank=True, null=True)
    hired_employee = models.OneToOneField(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recruitment_record'
    )
    notes = models.TextField(blank=True, null=True)
    source_payload = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'recruitment'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.candidate_name} - {self.job_posting.job_title} ({self.status})"


class RecruitmentIntegration(models.Model):
    PROVIDER_CHOICES = [
        ('LinkedIn', 'LinkedIn'),
        ('Naukri', 'Naukri'),
    ]

    integration_id = models.AutoField(primary_key=True)
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    display_name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    auto_post_jobs = models.BooleanField(default=True)
    auto_sync_applicants = models.BooleanField(default=True)
    credentials = models.JSONField(blank=True, null=True)
    webhook_token = models.CharField(max_length=64, unique=True, default=default_webhook_token)
    last_sync_at = models.DateTimeField(blank=True, null=True)
    last_sync_status = models.CharField(max_length=20, blank=True, null=True)
    last_sync_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'recruitment_integrations'
        ordering = ['provider', 'display_name']

    def __str__(self):
        return f"{self.provider} - {self.display_name}"


class JobPostingIntegration(models.Model):
    job_posting = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,
        related_name='integration_links'
    )
    integration = models.ForeignKey(
        RecruitmentIntegration,
        on_delete=models.CASCADE,
        related_name='job_postings'
    )
    external_job_id = models.CharField(max_length=255, blank=True, null=True)
    external_job_url = models.URLField(blank=True, null=True)
    sync_status = models.CharField(max_length=20, blank=True, null=True)
    sync_message = models.TextField(blank=True, null=True)
    last_synced_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'job_posting_integrations'
        unique_together = ('job_posting', 'integration')
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.job_posting.job_title} - {self.integration.provider}"
