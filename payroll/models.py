from django.db import models
from employees.models import Employee


class Payroll(models.Model):
    """Payroll model"""
    STATUS_CHOICES = [
        ('Paid', 'Paid'),
        ('Unpaid', 'Unpaid'),
        ('Pending', 'Pending'),
    ]

    payroll_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='payrolls'
    )
    pay_period_start = models.DateField()
    pay_period_end = models.DateField()
    basic_salary = models.DecimalField(max_digits=15, decimal_places=2)
    allowances = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    bonus = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    overtime_pay = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    deductions = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    insurance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    net_pay = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    payslip_generated = models.BooleanField(default=False)
    payslip_file = models.FileField(upload_to='payslips/', blank=True, null=True)
    payment_date = models.DateField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payroll'
        unique_together = ['employee', 'pay_period_start', 'pay_period_end']
        ordering = ['-pay_period_start', '-pay_period_end']

    def __str__(self):
        return f"{self.employee.full_name} - {self.pay_period_start} to {self.pay_period_end}"

    def calculate_net_pay(self):
        """Calculate net pay"""
        gross_pay = self.basic_salary + self.allowances + self.bonus + self.overtime_pay
        total_deductions = self.deductions + self.tax + self.insurance
        return gross_pay - total_deductions

    def save(self, *args, **kwargs):
        if not self.net_pay:
            self.net_pay = self.calculate_net_pay()
        super().save(*args, **kwargs)


class SalaryStructure(models.Model):
    """Salary structure model"""
    structure_id = models.AutoField(primary_key=True)
    employee = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name='salary_structure'
    )
    basic_salary = models.DecimalField(max_digits=15, decimal_places=2)
    house_rent_allowance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    transport_allowance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    medical_allowance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    other_allowances = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    provident_fund_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    effective_from = models.DateField()
    effective_to = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'salary_structures'
        ordering = ['-effective_from']

    def __str__(self):
        return f"{self.employee.full_name} - Salary Structure"

    @property
    def total_salary(self):
        return (
            self.basic_salary +
            self.house_rent_allowance +
            self.transport_allowance +
            self.medical_allowance +
            self.other_allowances
        )


class ExpenseClaim(models.Model):
    CATEGORY_CHOICES = [
        ('Travel', 'Travel'),
        ('Meal', 'Meal'),
        ('Office', 'Office'),
        ('Training', 'Training'),
        ('Other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('Submitted', 'Submitted'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Paid', 'Paid'),
    ]

    claim_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='expense_claims'
    )
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='Other')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    expense_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    receipt = models.FileField(upload_to='claims/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Submitted')
    approved_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_expense_claims'
    )
    approved_at = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'expense_claims'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee.full_name} - {self.category} ({self.amount})"
