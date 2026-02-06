from django.db import models
from employees.models import Employee


class OnboardingChecklistTemplate(models.Model):
    """Template for onboarding checklists"""
    template_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'onboarding_checklist_templates'
        ordering = ['name']

    def __str__(self):
        return self.name


class OnboardingTaskTemplate(models.Model):
    """Task templates attached to a checklist"""
    ASSIGNED_TO_CHOICES = [
        ('HR', 'HR'),
        ('Employee', 'Employee'),
    ]

    task_template_id = models.AutoField(primary_key=True)
    checklist = models.ForeignKey(
        OnboardingChecklistTemplate,
        on_delete=models.CASCADE,
        related_name='task_templates'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    assigned_to = models.CharField(max_length=20, choices=ASSIGNED_TO_CHOICES, default='Employee')
    due_offset_days = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'onboarding_task_templates'
        ordering = ['task_template_id']

    def __str__(self):
        return self.title


class OnboardingTask(models.Model):
    """Actual onboarding tasks for an employee"""
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]
    ASSIGNED_TO_CHOICES = [
        ('HR', 'HR'),
        ('Employee', 'Employee'),
    ]

    task_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='onboarding_tasks'
    )
    template = models.ForeignKey(
        OnboardingTaskTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    assigned_to = models.CharField(max_length=20, choices=ASSIGNED_TO_CHOICES, default='Employee')
    due_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    notes = models.TextField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'onboarding_tasks'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee.full_name} - {self.title}"


class EmployeeDocument(models.Model):
    """Employee onboarding documents"""
    DOC_TYPE_CHOICES = [
        ('ID', 'Identity Proof'),
        ('Bank', 'Bank Details'),
        ('Tax', 'Tax Document'),
        ('Contract', 'Employment Contract'),
        ('Other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Verified', 'Verified'),
        ('Rejected', 'Rejected'),
    ]

    document_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    doc_type = models.CharField(max_length=20, choices=DOC_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='employee_documents/')
    uploaded_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_documents'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'employee_documents'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee.full_name} - {self.title}"


class Asset(models.Model):
    """Asset inventory"""
    ASSET_TYPE_CHOICES = [
        ('Laptop', 'Laptop'),
        ('Phone', 'Phone'),
        ('AccessCard', 'Access Card'),
        ('Monitor', 'Monitor'),
        ('Other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Assigned', 'Assigned'),
        ('Repair', 'Repair'),
        ('Retired', 'Retired'),
    ]

    asset_id = models.AutoField(primary_key=True)
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES)
    asset_tag = models.CharField(max_length=100, unique=True)
    serial_number = models.CharField(max_length=100, blank=True, null=True)
    model = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    purchase_date = models.DateField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assets'
        ordering = ['asset_tag']

    def __str__(self):
        return f"{self.asset_tag} ({self.asset_type})"


class AssetAssignment(models.Model):
    """Asset handover log"""
    assignment_id = models.AutoField(primary_key=True)
    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='asset_assignments'
    )
    assigned_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_assets'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    returned_at = models.DateTimeField(blank=True, null=True)
    return_condition = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'asset_assignments'
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.asset.asset_tag} -> {self.employee.full_name}"


class Policy(models.Model):
    """Company policy content"""
    policy_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    version = models.CharField(max_length=50, default='1.0')
    effective_date = models.DateField()
    is_active = models.BooleanField(default=True)
    require_ack = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_policies'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'policies'
        ordering = ['-effective_date']

    def __str__(self):
        return self.title


class PolicyAcknowledgment(models.Model):
    """Acknowledgment record per employee"""
    STATUS_CHOICES = [
        ('Acknowledged', 'Acknowledged'),
        ('Declined', 'Declined'),
    ]

    acknowledgment_id = models.AutoField(primary_key=True)
    policy = models.ForeignKey(
        Policy,
        on_delete=models.CASCADE,
        related_name='acknowledgments'
    )
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='policy_acknowledgments'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Acknowledged')
    comment = models.TextField(blank=True, null=True)
    acknowledged_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'policy_acknowledgments'
        unique_together = ['policy', 'employee']
        ordering = ['-acknowledged_at']

    def __str__(self):
        return f"{self.employee.full_name} - {self.policy.title}"
