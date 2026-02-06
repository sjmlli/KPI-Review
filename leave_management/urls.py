from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeaveRequestViewSet, LeaveBalanceViewSet, HolidayViewSet

router = DefaultRouter()
router.register(r'leave-requests', LeaveRequestViewSet, basename='leave-request')
router.register(r'leave-balances', LeaveBalanceViewSet, basename='leave-balance')
router.register(r'holidays', HolidayViewSet, basename='holiday')

urlpatterns = [
    path('', include(router.urls)),
]

