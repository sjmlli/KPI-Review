from django.contrib import admin

from .models import EvaluationPeriod, KPI, PerformanceReview, PerformanceReviewItem


@admin.register(KPI)
class KPIAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'weight', 'is_active', 'related_department', 'related_role']
    list_filter = ['category', 'is_active', 'related_department']
    search_fields = ['title', 'description', 'related_role']
    readonly_fields = ['kpi_id', 'created_at', 'updated_at']


@admin.register(EvaluationPeriod)
class EvaluationPeriodAdmin(admin.ModelAdmin):
    list_display = ['name', 'period_type', 'start_date', 'end_date', 'status']
    list_filter = ['period_type', 'status']
    search_fields = ['name']
    readonly_fields = ['period_id', 'created_at', 'updated_at']


class PerformanceReviewItemInline(admin.TabularInline):
    model = PerformanceReviewItem
    extra = 0


@admin.register(PerformanceReview)
class PerformanceReviewAdmin(admin.ModelAdmin):
    list_display = ['employee', 'manager', 'period', 'total_score', 'created_at']
    list_filter = ['period__status', 'period__period_type']
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__email', 'period__name']
    readonly_fields = ['review_id', 'total_score', 'created_at', 'updated_at']
    inlines = [PerformanceReviewItemInline]


@admin.register(PerformanceReviewItem)
class PerformanceReviewItemAdmin(admin.ModelAdmin):
    list_display = ['review', 'kpi', 'score', 'created_at']
    list_filter = ['kpi__category']
    search_fields = ['kpi__title', 'review__employee__first_name', 'review__employee__last_name']
    readonly_fields = ['item_id', 'created_at', 'updated_at']
