from __future__ import annotations

from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP

from django.db.models import Q

from .models import Attendance, EmployeeShift, Timesheet


DEFAULT_EXPECTED_HOURS = Decimal('8.00')


def _to_decimal(value: float | Decimal) -> Decimal:
    if isinstance(value, Decimal):
        return value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    return Decimal(str(value)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def _calculate_working_hours(attendance: Attendance) -> Decimal:
    if attendance.clock_in_time and attendance.clock_out_time:
        start = datetime.combine(attendance.date, attendance.clock_in_time)
        end = datetime.combine(attendance.date, attendance.clock_out_time)
        if end <= start:
            end += timedelta(days=1)
        hours = (end - start).total_seconds() / 3600
        return _to_decimal(max(hours, 0))
    return _to_decimal(0)


def _get_expected_hours(employee, date) -> Decimal:
    assignment = (
        EmployeeShift.objects
        .filter(employee=employee, is_active=True, start_date__lte=date)
        .filter(Q(end_date__isnull=True) | Q(end_date__gte=date))
        .select_related('shift')
        .order_by('-start_date')
        .first()
    )
    if not assignment or not assignment.shift:
        return DEFAULT_EXPECTED_HOURS

    shift = assignment.shift
    start = datetime.combine(date, shift.start_time)
    end = datetime.combine(date, shift.end_time)
    if end <= start:
        end += timedelta(days=1)
    total_minutes = (end - start).total_seconds() / 60
    total_minutes -= shift.break_duration or 0
    hours = max(total_minutes / 60, 0)
    return _to_decimal(hours)


def update_timesheet_from_attendance(attendance: Attendance, source: str = 'Attendance') -> Timesheet:
    working_hours = _to_decimal(attendance.working_hours or 0)
    if not attendance.working_hours and (attendance.clock_in_time or attendance.clock_out_time):
        working_hours = _calculate_working_hours(attendance)

    expected_hours = _get_expected_hours(attendance.employee, attendance.date)
    overtime_hours = _to_decimal(max(Decimal('0'), working_hours - expected_hours))

    timesheet, created = Timesheet.objects.get_or_create(
        employee=attendance.employee,
        date=attendance.date,
        defaults={
            'clock_in_time': attendance.clock_in_time,
            'clock_out_time': attendance.clock_out_time,
            'working_hours': working_hours,
            'overtime_hours': overtime_hours,
            'status': 'Open',
            'source': source,
            'notes': attendance.notes,
        },
    )

    if not created:
        timesheet.clock_in_time = attendance.clock_in_time
        timesheet.clock_out_time = attendance.clock_out_time
        timesheet.working_hours = working_hours
        timesheet.overtime_hours = overtime_hours
        timesheet.source = source
        timesheet.notes = attendance.notes
        timesheet.save(update_fields=[
            'clock_in_time',
            'clock_out_time',
            'working_hours',
            'overtime_hours',
            'source',
            'notes',
            'updated_at',
        ])
    return timesheet
