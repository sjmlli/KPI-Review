from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceViewSet, ShiftViewSet, EmployeeShiftViewSet

router = DefaultRouter()
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'shifts', ShiftViewSet, basename='shift')
router.register(r'employee-shifts', EmployeeShiftViewSet, basename='employee-shift')

urlpatterns = [
    path('', include(router.urls)),
]

