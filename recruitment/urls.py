from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobPostingViewSet, RecruitmentViewSet, RecruitmentIntegrationViewSet, RecruitmentWebhookView

router = DefaultRouter()
router.register(r'job-postings', JobPostingViewSet, basename='job-posting')
router.register(r'recruitment', RecruitmentViewSet, basename='recruitment')
router.register(r'integrations', RecruitmentIntegrationViewSet, basename='recruitment-integration')

urlpatterns = [
    path('', include(router.urls)),
    path('webhook/<str:provider>/', RecruitmentWebhookView.as_view(), name='recruitment-webhook'),
]

