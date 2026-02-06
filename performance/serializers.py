from __future__ import annotations

from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from employees.models import Employee
from employees.permissions import get_employee_profile, is_manager_of

from .models import EvaluationPeriod, KPI, PerformanceReview, PerformanceReviewItem
from .permissions import is_hr_user


class KPISerializer(serializers.ModelSerializer):
    class Meta:
        model = KPI
        fields = [
            'kpi_id',
            'title',
            'category',
            'weight',
            'description',
            'is_active',
            'related_department',
            'related_role',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['kpi_id', 'created_at', 'updated_at']

    def validate_weight(self, value: Decimal):
        if value is None:
            return Decimal('0')
        if value < 0:
            raise serializers.ValidationError('Weight must be a non-negative number.')
        return value


class EvaluationPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationPeriod
        fields = [
            'period_id',
            'name',
            'period_type',
            'start_date',
            'end_date',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['period_id', 'created_at', 'updated_at']

    def validate(self, attrs):
        start = attrs.get('start_date')
        end = attrs.get('end_date')
        if start and end and end < start:
            raise serializers.ValidationError({'end_date': 'end_date must be after start_date.'})
        return attrs


class PerformanceReviewItemSerializer(serializers.ModelSerializer):
    kpi_title = serializers.CharField(source='kpi.title', read_only=True)
    kpi_category = serializers.CharField(source='kpi.category', read_only=True)
    kpi_weight = serializers.DecimalField(source='kpi.weight', max_digits=6, decimal_places=2, read_only=True)
    weighted_score = serializers.SerializerMethodField()

    class Meta:
        model = PerformanceReviewItem
        fields = [
            'item_id',
            'review',
            'kpi',
            'kpi_title',
            'kpi_category',
            'kpi_weight',
            'score',
            'weighted_score',
            'comment',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['item_id', 'created_at', 'updated_at', 'kpi_title', 'kpi_category', 'kpi_weight', 'weighted_score']
        extra_kwargs = {
            # When review items are nested inside PerformanceReviewSerializer, we attach `review` in code.
            'review': {'required': False},
        }

    def get_weighted_score(self, obj: PerformanceReviewItem):
        try:
            return (Decimal(obj.score) * (obj.kpi.weight or Decimal('0'))).quantize(Decimal('0.01'))
        except Exception:
            return Decimal('0.00')


class PerformanceReviewItemCRUDSerializer(PerformanceReviewItemSerializer):
    """CRUD serializer for review items when used as a standalone endpoint."""

    class Meta(PerformanceReviewItemSerializer.Meta):
        extra_kwargs = {
            'review': {'required': True},
        }


class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    manager_name = serializers.CharField(source='manager.full_name', read_only=True)
    period_detail = EvaluationPeriodSerializer(source='period', read_only=True)

    items = PerformanceReviewItemSerializer(many=True, required=False)

    class Meta:
        model = PerformanceReview
        fields = [
            'review_id',
            'employee',
            'employee_name',
            'manager',
            'manager_name',
            'period',
            'period_detail',
            'total_score',
            'final_comment',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['review_id', 'total_score', 'created_at', 'updated_at', 'employee_name', 'manager_name', 'period_detail']

    def validate(self, attrs):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        employee_profile = get_employee_profile(user)

        employee: Employee = attrs.get('employee') or getattr(self.instance, 'employee', None)
        period: EvaluationPeriod = attrs.get('period') or getattr(self.instance, 'period', None)

        # Enforce active period for create/update
        if period and period.status != EvaluationPeriod.Status.ACTIVE:
            raise serializers.ValidationError({'period': 'Only ACTIVE periods can be used for reviews.'})

        # Unique check for create
        if self.instance is None and employee and period:
            if PerformanceReview.objects.filter(employee=employee, period=period).exists():
                raise serializers.ValidationError('A review already exists for this employee and period.')

        # Manager scoping (HR can do everything)
        if not is_hr_user(user):
            if not employee_profile:
                raise serializers.ValidationError('Employee profile is required.')
            if not is_manager_of(employee_profile, employee):
                raise serializers.ValidationError('You are not allowed to review this employee.')

        items = attrs.get('items')
        if items is not None:
            for item in items:
                kpi = item.get('kpi')
                if not kpi:
                    raise serializers.ValidationError({'items': 'Each item must include a KPI.'})
                if not kpi.is_active:
                    raise serializers.ValidationError({'items': f'KPI "{kpi.title}" is inactive.'})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        employee_profile = get_employee_profile(user)

        items_data = validated_data.pop('items', [])

        manager = validated_data.get('manager')
        if manager is None:
            manager = employee_profile

        review = PerformanceReview.objects.create(manager=manager, **validated_data)

        for item in items_data:
            item.pop('review', None)
            PerformanceReviewItem.objects.create(review=review, **item)

        review.recalculate_total_score(save=True)
        return review

    @transaction.atomic
    def update(self, instance: PerformanceReview, validated_data):
        items_data = validated_data.pop('items', None)

        for field in ['final_comment']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])

        # Disallow changing employee/period by default
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item in items_data:
                item.pop('review', None)
                PerformanceReviewItem.objects.create(review=instance, **item)
            instance.recalculate_total_score(save=True)

        return instance
