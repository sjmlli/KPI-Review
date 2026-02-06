"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from backend.health import health

# Import all viewsets
from employees.views import (
    DepartmentViewSet,
    EmployeeViewSet,
    RoleViewSet,
    EmailSettingsViewSet,
    OfferLetterTemplateViewSet,
    OfferLetterViewSet,
)
from leave_management.views import LeaveRequestViewSet, LeaveBalanceViewSet, HolidayViewSet
from payroll.views import PayrollViewSet, SalaryStructureViewSet, ExpenseClaimViewSet
from attendance.views import (
    AttendanceViewSet,
    ShiftViewSet,
    EmployeeShiftViewSet,
    BiometricIntegrationViewSet,
    BiometricPunchViewSet,
    BiometricWebhookView,
    TimesheetViewSet,
    OvertimeRequestViewSet,
)
from hr_ops.views import (
    OnboardingChecklistTemplateViewSet,
    OnboardingTaskTemplateViewSet,
    OnboardingTaskViewSet,
    EmployeeDocumentViewSet,
    AssetViewSet,
    AssetAssignmentViewSet,
    PolicyViewSet,
    PolicyAcknowledgmentViewSet,
)
from performance.views import (
    EvaluationPeriodViewSet,
    KPIViewSet,
    PerformanceReviewItemViewSet,
    PerformanceReviewViewSet,
)
from recruitment.views import JobPostingViewSet, RecruitmentViewSet, RecruitmentIntegrationViewSet, RecruitmentWebhookView

# Create a single router for all viewsets
router = DefaultRouter()
router.register(r'employees/departments', DepartmentViewSet, basename='department')
router.register(r'employees/roles', RoleViewSet, basename='role')
router.register(r'employees/email-settings', EmailSettingsViewSet, basename='email-settings')
router.register(r'employees/offer-letter-templates', OfferLetterTemplateViewSet, basename='offer-letter-template')
router.register(r'employees/offer-letters', OfferLetterViewSet, basename='offer-letter')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'leave/leave-requests', LeaveRequestViewSet, basename='leave-request')
router.register(r'leave/leave-balances', LeaveBalanceViewSet, basename='leave-balance')
router.register(r'leave/holidays', HolidayViewSet, basename='holiday')
router.register(r'payroll/payrolls', PayrollViewSet, basename='payroll')
router.register(r'payroll/salary-structures', SalaryStructureViewSet, basename='salary-structure')
router.register(r'payroll/claims', ExpenseClaimViewSet, basename='expense-claim')
router.register(r'attendance/shifts', ShiftViewSet, basename='shift')
router.register(r'attendance/employee-shifts', EmployeeShiftViewSet, basename='employee-shift')
router.register(r'attendance/biometric-integrations', BiometricIntegrationViewSet, basename='biometric-integration')
router.register(r'attendance/biometric-punches', BiometricPunchViewSet, basename='biometric-punch')
router.register(r'attendance/timesheets', TimesheetViewSet, basename='timesheet')
router.register(r'attendance/overtime-requests', OvertimeRequestViewSet, basename='overtime-request')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'hr/onboarding-checklists', OnboardingChecklistTemplateViewSet, basename='onboarding-checklist')
router.register(r'hr/onboarding-task-templates', OnboardingTaskTemplateViewSet, basename='onboarding-task-template')
router.register(r'hr/onboarding-tasks', OnboardingTaskViewSet, basename='onboarding-task')
router.register(r'hr/employee-documents', EmployeeDocumentViewSet, basename='employee-document')
router.register(r'hr/assets', AssetViewSet, basename='asset')
router.register(r'hr/asset-assignments', AssetAssignmentViewSet, basename='asset-assignment')
router.register(r'hr/policies', PolicyViewSet, basename='policy')
router.register(r'hr/policy-acknowledgments', PolicyAcknowledgmentViewSet, basename='policy-acknowledgment')
router.register(r'performance/reviews', PerformanceReviewViewSet, basename='performance-review')
router.register(r'performance/review-items', PerformanceReviewItemViewSet, basename='performance-review-item')
router.register(r'performance/kpis', KPIViewSet, basename='performance-kpi')
router.register(r'performance/periods', EvaluationPeriodViewSet, basename='performance-period')
router.register(r'recruitment/job-postings', JobPostingViewSet, basename='job-posting')
router.register(r'recruitment/applications', RecruitmentViewSet, basename='recruitment')
router.register(r'recruitment/integrations', RecruitmentIntegrationViewSet, basename='recruitment-integration')

urlpatterns = [
    path('health/', health, name='health'),
    path('admin/', admin.site.urls),
    
    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API v1 endpoints
    path('api/v1/attendance/biometric-webhook/', BiometricWebhookView.as_view(), name='biometric-webhook'),
    path('api/v1/recruitment/webhook/<str:provider>/', RecruitmentWebhookView.as_view(), name='recruitment-webhook'),
    path('api/v1/', include(router.urls)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
