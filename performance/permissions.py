from __future__ import annotations

from rest_framework.permissions import BasePermission, SAFE_METHODS

from employees.permissions import get_employee_profile, is_manager_of, is_manager_user


def is_hr_user(user) -> bool:
    """HR/Admin users: full access.

    We treat Django staff/superuser as HR. For employee profiles we check role name.
    """
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser or user.is_staff:
        return True
    employee = get_employee_profile(user)
    if not employee:
        return False
    return (employee.role or '').lower() in {'hr', 'admin'}


def is_manager(user) -> bool:
    employee = get_employee_profile(user)
    if not employee:
        return False
    # Either explicit role, or having direct reports.
    return (employee.role or '').lower() == 'manager' or is_manager_user(user)


class HRWritePermission(BasePermission):
    """Allow anyone authenticated to read, but only HR to write."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return is_hr_user(request.user)


class PerformanceReviewPermission(BasePermission):
    """RBAC for performance reviews:

    - HR: full access
    - Manager: create/update for direct reports
    - Employee: read-only for self
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        return is_hr_user(request.user) or is_manager(request.user)

    def has_object_permission(self, request, view, obj):
        if is_hr_user(request.user):
            return True

        employee_profile = get_employee_profile(request.user)
        if not employee_profile:
            return False

        if request.method in SAFE_METHODS:
            if obj.employee_id == employee_profile.employee_id:
                return True
            return is_manager_of(employee_profile, obj.employee)

        # Mutations: only manager of that employee
        return is_manager_of(employee_profile, obj.employee)


class PerformanceReviewItemPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return is_hr_user(request.user) or is_manager(request.user)

    def has_object_permission(self, request, view, obj):
        # obj is PerformanceReviewItem
        review = getattr(obj, 'review', None)
        if not review:
            return False
        if is_hr_user(request.user):
            return True
        employee_profile = get_employee_profile(request.user)
        if not employee_profile:
            return False
        if request.method in SAFE_METHODS:
            if review.employee_id == employee_profile.employee_id:
                return True
            return is_manager_of(employee_profile, review.employee)
        return is_manager_of(employee_profile, review.employee)
