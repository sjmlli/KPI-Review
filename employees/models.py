from django.db import models
from django.contrib.auth.models import User


class Role(models.Model):
    """Role model for custom RBAC"""
    PORTAL_CHOICES = [
        ('Admin', 'Admin Portal'),
        ('Employee', 'Employee Portal'),
    ]

    role_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    portal = models.CharField(max_length=20, choices=PORTAL_CHOICES, default='Employee')
    permissions = models.JSONField(default=list, blank=True)
    is_system = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'roles'
        ordering = ['name']

    def __str__(self):
        return self.name


class Department(models.Model):
    """Department model"""
    department_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    manager = models.ForeignKey(
        'Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_departments'
    )
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'departments'
        ordering = ['name']

    def __str__(self):
        return self.name


class Employee(models.Model):
    """Employee model"""
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('On Leave', 'On Leave'),
        ('Terminated', 'Terminated'),
    ]

    employee_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='employee_profile',
        null=True,
        blank=True
    )
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    hire_date = models.DateField()
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees'
    )
    designation = models.CharField(max_length=255)
    role = models.CharField(max_length=50, default='Employee')
    salary = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    managers = models.ManyToManyField(
        'self',
        symmetrical=False,
        blank=True,
        related_name='direct_reports'
    )
    team_lead = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='team_members'
    )
    address = models.TextField(blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=255, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    bank_account_number = models.CharField(max_length=50, blank=True, null=True)
    bank_name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'employees'
        ordering = ['-hire_date']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class EmailSettings(models.Model):
    """SMTP settings for notifications"""
    settings_id = models.AutoField(primary_key=True)
    display_name = models.CharField(max_length=100, default='Default SMTP')
    from_email = models.EmailField()
    smtp_host = models.CharField(max_length=255)
    smtp_port = models.IntegerField(default=587)
    smtp_username = models.CharField(max_length=255, blank=True, null=True)
    smtp_password = models.CharField(max_length=255, blank=True, null=True)
    use_tls = models.BooleanField(default=True)
    use_ssl = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'email_settings'
        ordering = ['-updated_at']

    def __str__(self):
        return self.display_name


class OfferLetterTemplate(models.Model):
    """Offer letter template"""
    template_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, default='Default Template')
    company_name = models.CharField(max_length=255)
    company_address = models.TextField(blank=True, null=True)
    company_logo = models.FileField(upload_to='offer_letter_logos/', blank=True, null=True)
    subject = models.CharField(max_length=255, default='Offer Letter')
    body = models.TextField()
    footer = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'offer_letter_templates'
        ordering = ['-updated_at']

    def __str__(self):
        return self.name


class OfferLetter(models.Model):
    """Generated offer letters for employees"""
    offer_letter_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='offer_letters'
    )
    joining_date = models.DateField()
    ctc = models.DecimalField(max_digits=15, decimal_places=2)
    designation = models.CharField(max_length=255)
    probation_period = models.CharField(max_length=100)
    reporting_manager = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issued_offer_letters'
    )
    work_location = models.CharField(max_length=255)
    benefits = models.TextField(blank=True, null=True)
    shift_timings = models.CharField(max_length=255, blank=True, null=True)
    template = models.ForeignKey(
        OfferLetterTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='offer_letters'
    )
    pdf_file = models.FileField(upload_to='offer_letters/', blank=True, null=True)
    issued_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_offer_letters'
    )
    issued_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'offer_letters'
        ordering = ['-issued_at']

    def __str__(self):
        return f"Offer Letter - {self.employee.full_name}"


class AuditLog(models.Model):
    """Audit log model for tracking changes"""
    ACTION_CHOICES = [
        ('Create', 'Create'),
        ('Update', 'Update'),
        ('Delete', 'Delete'),
    ]

    audit_id = models.AutoField(primary_key=True)
    table_name = models.CharField(max_length=255)
    record_id = models.IntegerField()
    action_type = models.CharField(max_length=20, choices=ACTION_CHOICES)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    changed_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action_type} on {self.table_name} (ID: {self.record_id})"
