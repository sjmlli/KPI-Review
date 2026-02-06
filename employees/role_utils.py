from __future__ import annotations

from typing import Dict, List

from .models import Employee, Role


DEFAULT_ROLE_DEFINITIONS: Dict[str, Dict[str, object]] = {
    'Admin': {
        'portal': 'Admin',
        'permissions': ['*'],
        'is_system': True,
    },
    'HR': {
        'portal': 'Admin',
        'permissions': [
            'portal.admin',
            'dashboard.view',
            'employees.view',
            'employees.manage',
            'employees.view_salary',
            'employees.view_bank',
            'org_chart.view',
            'onboarding.view',
            'onboarding.manage',
            'assets.view',
            'assets.manage',
            'policies.view',
            'policies.manage',
            'leave.view',
            'leave.manage',
            'attendance.view',
            'attendance.manage',
            'timesheet.view',
            'timesheet.manage',
            'overtime.view',
            'overtime.manage',
            'payroll.view',
            'payroll.manage',
            'claims.view',
            'claims.manage',
            'performance.view',
            'performance.manage',
            'recruitment.view',
            'recruitment.manage',
            'settings.view',
            'settings.manage',
            'offer_letters.view',
            'offer_letters.manage',
            'roles.manage',
        ],
        'is_system': True,
    },
    'Employee': {
        'portal': 'Employee',
        'permissions': [
            'portal.employee',
            'dashboard.view',
            'employees.self_view',
            'onboarding.self',
            'assets.self',
            'policies.self',
            'leave.self',
            'attendance.self',
            'timesheet.self',
            'overtime.self',
            'payroll.self',
            'claims.self',
        ],
        'is_system': True,
    },
    'Manager': {
        # Managers are employees with direct reports. We keep them in the
        # Employee portal but grant them extra performance/team capabilities.
        'portal': 'Employee',
        'permissions': [
            'portal.employee',
            'dashboard.view',
            'employees.self_view',
            'onboarding.self',
            'assets.self',
            'policies.self',
            'leave.self',
            'attendance.self',
            'timesheet.self',
            'overtime.self',
            'payroll.self',
            'claims.self',
            # Performance management for team
            'performance.view',
            'performance.manage',
        ],
        'is_system': True,
    },
}


def _permission_matches(permissions: List[str], permission: str) -> bool:
    if '*' in permissions:
        return True
    if permission in permissions:
        return True
    parts = permission.split('.')
    for idx in range(len(parts), 0, -1):
        wildcard = '.'.join(parts[:idx]) + '.*'
        if wildcard in permissions:
            return True
    return False


def get_role_definition(role_name: str | None) -> Dict[str, object]:
    role_name = role_name or 'Employee'
    role = Role.objects.filter(name__iexact=role_name).first()
    if role:
        return {
            'portal': role.portal,
            'permissions': role.permissions or [],
            'is_system': role.is_system,
        }
    return DEFAULT_ROLE_DEFINITIONS.get(role_name, DEFAULT_ROLE_DEFINITIONS['Employee'])


def role_has_permission(role_name: str | None, permission: str) -> bool:
    role_def = get_role_definition(role_name)
    permissions = role_def.get('permissions', [])
    if isinstance(permissions, list):
        return _permission_matches(permissions, permission)
    return False


def get_role_permissions(role_name: str | None) -> List[str]:
    role_def = get_role_definition(role_name)
    permissions = role_def.get('permissions', [])
    if isinstance(permissions, list):
        return permissions
    return []


def get_role_portal(role_name: str | None) -> str:
    role_def = get_role_definition(role_name)
    portal = role_def.get('portal') or 'Employee'
    return str(portal)


def get_emails_for_permission(permission: str) -> List[str]:
    role_names = set(DEFAULT_ROLE_DEFINITIONS.keys())
    for role in Role.objects.all():
        role_names.add(role.name)

    allowed_roles = {
        name
        for name in role_names
        if role_has_permission(name, permission)
    }

    if not allowed_roles:
        return []
    return list(
        Employee.objects.filter(role__in=allowed_roles).values_list('email', flat=True)
    )
