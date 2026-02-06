from datetime import datetime
from typing import Any, Dict, List, Optional

from django.utils import timezone

from employees.models import Employee
from .models import Attendance, BiometricIntegration, BiometricPunch
from .timesheet_utils import update_timesheet_from_attendance


def _get_nested_value(payload: Dict[str, Any], field_path: str) -> Optional[Any]:
    if not field_path:
        return None
    value = payload
    for part in field_path.split('.'):
        if not isinstance(value, dict):
            return None
        value = value.get(part)
    return value


def resolve_employee(identifier: Any, identifier_type: str | None) -> Optional[Employee]:
    if not identifier:
        return None
    identifier_value = str(identifier).strip()
    if not identifier_value:
        return None
    if identifier_type == 'email':
        return Employee.objects.filter(email__iexact=identifier_value).first()
    if identifier_type == 'employee_id':
        return Employee.objects.filter(employee_id=identifier_value).first()
    return Employee.objects.filter(email__iexact=identifier_value).first()


def parse_punch_payload(integration: BiometricIntegration, payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    mapping = integration.data_mapping or {}
    employee_field = mapping.get('employee_identifier_field', 'employee_id')
    employee_type = mapping.get('employee_identifier_type', 'employee_id')
    timestamp_field = mapping.get('timestamp_field', 'timestamp')
    direction_field = mapping.get('direction_field', 'direction')

    records = payload.get('punches')
    if isinstance(records, list):
        punch_items = records
    else:
        punch_items = [payload]

    parsed: List[Dict[str, Any]] = []
    for item in punch_items:
        if not isinstance(item, dict):
            continue
        employee_identifier = _get_nested_value(item, employee_field) or item.get('employee_id')
        timestamp_raw = _get_nested_value(item, timestamp_field) or item.get('timestamp') or item.get('time')
        direction = _get_nested_value(item, direction_field)
        if not timestamp_raw:
            continue
        try:
            punch_time = datetime.fromisoformat(str(timestamp_raw).replace('Z', '+00:00'))
        except ValueError:
            continue
        if timezone.is_naive(punch_time):
            punch_time = timezone.make_aware(punch_time, timezone.get_current_timezone())

        employee = resolve_employee(employee_identifier, employee_type)
        parsed.append({
            'employee': employee,
            'employee_identifier': str(employee_identifier) if employee_identifier else None,
            'punch_time': punch_time,
            'direction': direction,
            'raw_payload': item,
        })
    return parsed


def update_attendance_from_punch(employee: Employee, punch_time: datetime) -> None:
    day = punch_time.date()
    punches = BiometricPunch.objects.filter(employee=employee, punch_time__date=day).order_by('punch_time')
    if not punches:
        return

    first_punch = punches.first().punch_time
    last_punch = punches.last().punch_time
    working_hours = 0
    if first_punch and last_punch and last_punch >= first_punch:
        working_hours = round((last_punch - first_punch).total_seconds() / 3600, 2)

    attendance, _ = Attendance.objects.get_or_create(
        employee=employee,
        date=day,
        defaults={'status': 'Present'},
    )
    attendance.clock_in_time = first_punch.time()
    attendance.clock_out_time = last_punch.time()
    attendance.working_hours = working_hours
    attendance.status = 'Present'
    attendance.save(update_fields=['clock_in_time', 'clock_out_time', 'working_hours', 'status', 'updated_at'])
    update_timesheet_from_attendance(attendance, source='Biometric')
