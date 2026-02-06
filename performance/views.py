from __future__ import annotations

from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from employees.permissions import get_employee_profile

from .models import EvaluationPeriod, KPI, PerformanceReview, PerformanceReviewItem
from .permissions import HRWritePermission, PerformanceReviewItemPermission, PerformanceReviewPermission, is_hr_user
from .serializers import (
    EvaluationPeriodSerializer,
    KPISerializer,
    PerformanceReviewItemCRUDSerializer,
    PerformanceReviewItemSerializer,
    PerformanceReviewSerializer,
)


class KPIViewSet(viewsets.ModelViewSet):
    queryset = KPI.objects.all()
    serializer_class = KPISerializer
    permission_classes = [HRWritePermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    filterset_fields = ['category', 'is_active', 'related_department', 'related_role']
    ordering_fields = ['title', 'category', 'weight', 'is_active', 'created_at']
    ordering = ['-is_active', 'category', 'title']

    def get_queryset(self):
        qs = super().get_queryset()
        if is_hr_user(self.request.user):
            return qs
        return qs.filter(is_active=True)


class EvaluationPeriodViewSet(viewsets.ModelViewSet):
    queryset = EvaluationPeriod.objects.all()
    serializer_class = EvaluationPeriodSerializer
    permission_classes = [HRWritePermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    filterset_fields = ['period_type', 'status']
    ordering_fields = ['start_date', 'end_date', 'status', 'created_at']
    ordering = ['-start_date']

    def get_queryset(self):
        qs = super().get_queryset()
        if is_hr_user(self.request.user):
            return qs
        # Non-HR users only need ACTIVE periods for scoring.
        return qs.filter(status=EvaluationPeriod.Status.ACTIVE)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        period = self.get_object()
        period.status = EvaluationPeriod.Status.ACTIVE
        period.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(period).data)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        period = self.get_object()
        period.status = EvaluationPeriod.Status.CLOSED
        period.save(update_fields=['status', 'updated_at'])
        return Response(self.get_serializer(period).data)


class PerformanceReviewViewSet(viewsets.ModelViewSet):
    serializer_class = PerformanceReviewSerializer
    permission_classes = [PerformanceReviewPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__email', 'period__name']
    filterset_fields = ['employee', 'manager', 'period']
    ordering_fields = ['created_at', 'updated_at', 'total_score']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = PerformanceReview.objects.select_related('employee', 'manager', 'period').prefetch_related('items__kpi')
        user = self.request.user
        if is_hr_user(user):
            return qs

        employee_profile = get_employee_profile(user)
        if not employee_profile:
            return qs.none()

        # Managers can see team reviews; employees see only self reviews.
        team_employee_ids = list(employee_profile.direct_reports.values_list('employee_id', flat=True))
        if team_employee_ids:
            # Managers can see both their team's reviews and their own.
            return qs.filter(Q(employee_id__in=team_employee_ids) | Q(employee_id=employee_profile.employee_id))
        return qs.filter(employee_id=employee_profile.employee_id)

    def perform_create(self, serializer):
        # default manager to the authenticated employee profile
        employee_profile = get_employee_profile(self.request.user)
        serializer.save(manager=employee_profile)


class PerformanceReviewItemViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReviewItem.objects.select_related('review', 'kpi', 'review__employee', 'review__period')
    permission_classes = [PerformanceReviewItemPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['kpi__title', 'review__employee__first_name', 'review__employee__last_name']
    filterset_fields = ['review', 'kpi']
    ordering_fields = ['created_at', 'updated_at', 'score']
    ordering = ['kpi__title']

    def get_serializer_class(self):
        # Require `review` on standalone create/update
        if self.action in {'create', 'update', 'partial_update'}:
            return PerformanceReviewItemCRUDSerializer
        return PerformanceReviewItemSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if is_hr_user(user):
            return qs

        employee_profile = get_employee_profile(user)
        if not employee_profile:
            return qs.none()

        team_employee_ids = list(employee_profile.direct_reports.values_list('employee_id', flat=True))
        if team_employee_ids:
            return qs.filter(
                Q(review__employee_id__in=team_employee_ids)
                | Q(review__employee_id=employee_profile.employee_id)
            )
        return qs.filter(review__employee_id=employee_profile.employee_id)
