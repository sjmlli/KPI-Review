import secrets
from django.db import models
from employees.models import Employee


class Attendance(models.Model):
    """Attendance model"""
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Leave', 'Leave'),
        ('Half Day', 'Half Day'),
    ]

    attendance_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='attendances'
    )
    date = models.DateField()
    clock_in_time = models.TimeField(blank=True, null=True)
    clock_out_time = models.TimeField(blank=True, null=True)
    working_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Present')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'attendance'
        unique_together = ['employee', 'date']
        ordering = ['-date', '-clock_in_time']

    def __str__(self):
        return f"{self.employee.full_name} - {self.date} ({self.status})"


class Shift(models.Model):
    """Shift management model"""
    shift_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    start_time = models.TimeField()
    end_time = models.TimeField()
    break_duration = models.IntegerField(default=60)  # in minutes
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'shifts'
        ordering = ['start_time']

    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"


class EmployeeShift(models.Model):
    """Employee shift assignment"""
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='shifts'
    )
    shift = models.ForeignKey(
        Shift,
        on_delete=models.CASCADE,
        related_name='employee_assignments'
    )
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'employee_shifts'
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.shift.name}"


def default_biometric_token():
    return secrets.token_urlsafe(24)


class BiometricIntegration(models.Model):
    PROVIDER_CHOICES = [
        ('ZKTeco', 'ZKTeco'),
        ('eSSL', 'eSSL'),
        ('BioStar', 'BioStar'),
        ('Suprema', 'Suprema'),
        ('Generic', 'Generic'),
    ]
    CONNECTION_CHOICES = [
        ('Webhook', 'Webhook'),
        ('Polling', 'Polling'),
    ]

    integration_id = models.AutoField(primary_key=True)
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES, default='Generic')
    display_name = models.CharField(max_length=100)
    connection_type = models.CharField(max_length=20, choices=CONNECTION_CHOICES, default='Webhook')
    base_url = models.CharField(max_length=255, blank=True, null=True)
    device_id = models.CharField(max_length=100, blank=True, null=True)
    credentials = models.JSONField(blank=True, null=True)
    data_mapping = models.JSONField(blank=True, null=True)
    webhook_token = models.CharField(max_length=64, unique=True, default=default_biometric_token)
    is_active = models.BooleanField(default=True)
    auto_sync = models.BooleanField(default=True)
    last_sync_at = models.DateTimeField(blank=True, null=True)
    last_sync_status = models.CharField(max_length=20, blank=True, null=True)
    last_sync_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'biometric_integrations'
        ordering = ['provider', 'display_name']

    def __str__(self):
        return f"{self.provider} - {self.display_name}"


class BiometricPunch(models.Model):
    punch_id = models.AutoField(primary_key=True)
    integration = models.ForeignKey(
        BiometricIntegration,
        on_delete=models.CASCADE,
        related_name='punches'
    )
    employee = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='biometric_punches'
    )
    employee_identifier = models.CharField(max_length=100, blank=True, null=True)
    device_id = models.CharField(max_length=100, blank=True, null=True)
    punch_time = models.DateTimeField()
    direction = models.CharField(max_length=20, blank=True, null=True)
    raw_payload = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'biometric_punches'
        ordering = ['-punch_time']

    def __str__(self):
        return f"{self.employee_identifier or self.employee_id} - {self.punch_time}"


class Timesheet(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Submitted', 'Submitted'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    SOURCE_CHOICES = [
        ('Attendance', 'Attendance'),
        ('Biometric', 'Biometric'),
        ('Manual', 'Manual'),
    ]

    timesheet_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='timesheets'
    )
    date = models.DateField()
    clock_in_time = models.TimeField(blank=True, null=True)
    clock_out_time = models.TimeField(blank=True, null=True)
    working_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    overtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='Attendance')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'timesheets'
        unique_together = ['employee', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.date}"


class OvertimeRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

    overtime_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='overtime_requests'
    )
    timesheet = models.ForeignKey(
        Timesheet,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='overtime_requests'
    )
    date = models.DateField()
    hours = models.DecimalField(max_digits=6, decimal_places=2)
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    approved_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_overtime_requests'
    )
    approved_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'overtime_requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee.full_name} - {self.date} ({self.hours}h)"
