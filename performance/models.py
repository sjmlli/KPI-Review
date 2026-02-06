from __future__ import annotations

from decimal import Decimal

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from employees.models import Department, Employee


class KPI(models.Model):
    """Configurable KPI used in performance reviews."""

    class Category(models.TextChoices):
        GENERAL = 'GENERAL', 'General'
        JOB_SPECIFIC = 'JOB_SPECIFIC', 'Job Specific'
        STRATEGIC = 'STRATEGIC', 'Strategic'

    kpi_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.GENERAL)
    weight = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('1.00'))
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    # Optional scoping
    related_department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='kpis',
    )
    related_role = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kpis'
        ordering = ['-is_active', 'category', 'title']

    def __str__(self) -> str:
        return self.title


class EvaluationPeriod(models.Model):
    """Evaluation periods like monthly / quarterly / annual."""

    class PeriodType(models.TextChoices):
        MONTHLY = 'MONTHLY', 'Monthly'
        QUARTERLY = 'QUARTERLY', 'Quarterly'
        ANNUAL = 'ANNUAL', 'Annual'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        ACTIVE = 'ACTIVE', 'Active'
        CLOSED = 'CLOSED', 'Closed'

    period_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    period_type = models.CharField(max_length=20, choices=PeriodType.choices, default=PeriodType.MONTHLY)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'evaluation_periods'
        ordering = ['-start_date']

    def __str__(self) -> str:
        return f"{self.name} ({self.period_type})"


class PerformanceReview(models.Model):
    """A manager review for a single employee during a period."""

    review_id = models.AutoField(primary_key=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='performance_reviews')
    manager = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews_given')
    period = models.ForeignKey(EvaluationPeriod, on_delete=models.PROTECT, related_name='reviews')

    total_score = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal('0.00'))
    final_comment = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'performance_reviews'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['employee', 'period'], name='unique_employee_period_review'),
        ]

    def __str__(self) -> str:
        return f"{self.employee.full_name} - {self.period.name}"

    def recalculate_total_score(self, *, save: bool = True) -> Decimal:
        """Recalculate total_score using weighted average over items."""
        items = list(self.items.select_related('kpi').all())
        total_weight = Decimal('0')
        weighted_sum = Decimal('0')
        for item in items:
            if not item.kpi:
                continue
            weight = item.kpi.weight or Decimal('0')
            total_weight += weight
            weighted_sum += Decimal(item.score) * weight

        if total_weight == 0:
            score = Decimal('0')
        else:
            score = weighted_sum / total_weight

        score = score.quantize(Decimal('0.01'))
        self.total_score = score
        if save:
            # include updated_at explicitly when using update_fields
            self.save(update_fields=['total_score', 'updated_at'])
        return score


class PerformanceReviewItem(models.Model):
    """A single KPI score within a performance review."""

    item_id = models.AutoField(primary_key=True)
    review = models.ForeignKey(PerformanceReview, on_delete=models.CASCADE, related_name='items')
    kpi = models.ForeignKey(KPI, on_delete=models.PROTECT, related_name='review_items')

    # Standard: 0-100
    score = models.PositiveSmallIntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    comment = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'performance_review_items'
        ordering = ['kpi__title']
        constraints = [
            models.UniqueConstraint(fields=['review', 'kpi'], name='unique_review_kpi'),
        ]

    def __str__(self) -> str:
        return f"{self.review_id} - {self.kpi.title}"
