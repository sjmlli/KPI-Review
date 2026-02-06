from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PayrollViewSet, SalaryStructureViewSet

router = DefaultRouter()
router.register(r'payrolls', PayrollViewSet, basename='payroll')
router.register(r'salary-structures', SalaryStructureViewSet, basename='salary-structure')

urlpatterns = [
    path('', include(router.urls)),
]

