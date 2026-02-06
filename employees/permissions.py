from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Employee
from .role_utils import get_role_permissions, get_role_portal, role_has_permission


def is_admin_or_hr(user):
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser or user.is_staff:
        return True
    employee = getattr(user, 'employee_profile', None)
    if not employee:
        return False
    return get_role_portal(employee.role) == 'Admin'


def get_employee_profile(user):
    return getattr(user, 'employee_profile', None)


def is_employee(user):
    if not user or not user.is_authenticated:
        return False
    employee = get_employee_profile(user)
    if not employee:
        return False
    return get_role_portal(employee.role) == 'Employee'


def is_manager_user(user):
    employee = get_employee_profile(user)
    if not employee:
        return False
    return Employee.objects.filter(managers=employee).exists()


def is_manager_of(manager, employee):
    if not manager or not employee:
        return False
    return employee.managers.filter(employee_id=manager.employee_id).exists()


def has_role_permission(user, permission):
    if not permission:
        return True
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser or user.is_staff:
        return True
    employee = get_employee_profile(user)
    if not employee:
        return False
    return role_has_permission(employee.role, permission)


def get_role_permissions_for_user(user):
    employee = get_employee_profile(user)
    if not employee:
        return []
    return get_role_permissions(employee.role)


def get_portal_for_user(user):
    employee = get_employee_profile(user)
    if not employee:
        return 'Admin' if user and (user.is_staff or user.is_superuser) else 'Employee'
    return get_role_portal(employee.role)


class IsAdminOrHR(BasePermission):
    def has_permission(self, request, view):
        return is_admin_or_hr(request.user)


class IsAdminOrEmployee(BasePermission):
    def has_permission(self, request, view):
        return is_admin_or_hr(request.user) or is_employee(request.user)


class IsAdminOrManager(BasePermission):
    def has_permission(self, request, view):
        return is_admin_or_hr(request.user) or is_manager_user(request.user)


class IsManager(BasePermission):
    def has_permission(self, request, view):
        return is_manager_user(request.user)


class RolePermission(BasePermission):
    def has_permission(self, request, view):
        permission_required = getattr(view, 'permission_required', None)
        read_permission = getattr(view, 'read_permission', None)
        if request.method in SAFE_METHODS:
            permission_required = read_permission or permission_required
        if not permission_required:
            return True
        return has_role_permission(request.user, permission_required)


class EmployeeOrRolePermission(BasePermission):
    def has_permission(self, request, view):
        if is_employee(request.user):
            allow_employee_write = getattr(view, 'employee_write_allowed', True)
            employee_permission = getattr(view, 'employee_permission', None)
            if employee_permission and not has_role_permission(request.user, employee_permission):
                return False
            if request.method in SAFE_METHODS:
                return True
            if request.method == 'POST':
                return allow_employee_write
            return False
        permission_required = getattr(view, 'permission_required', None)
        read_permission = getattr(view, 'read_permission', None)
        if request.method in SAFE_METHODS:
            permission_required = read_permission or permission_required
        if not permission_required:
            return True
        return has_role_permission(request.user, permission_required)
