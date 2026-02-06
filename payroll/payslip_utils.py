from __future__ import annotations

from io import BytesIO

from django.utils import timezone

from .models import Payroll


def generate_payslip_pdf(payroll: Payroll) -> bytes:
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import LETTER
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    except ImportError as exc:
        raise RuntimeError('reportlab is required to generate payslips.') from exc

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=LETTER, title='Payslip')
    styles = getSampleStyleSheet()

    employee = payroll.employee
    department = employee.department.name if employee.department else 'N/A'

    elements = [
        Paragraph('Payslip', styles['Title']),
        Spacer(1, 12),
        Paragraph(f"Employee: {employee.full_name}", styles['Normal']),
        Paragraph(f"Employee ID: {employee.employee_id}", styles['Normal']),
        Paragraph(f"Department: {department}", styles['Normal']),
        Paragraph(f"Designation: {employee.designation}", styles['Normal']),
        Paragraph(
            f"Pay Period: {payroll.pay_period_start} to {payroll.pay_period_end}",
            styles['Normal'],
        ),
        Paragraph(f"Issued On: {timezone.localdate()}", styles['Normal']),
        Spacer(1, 12),
    ]

    earnings = [
        ['Earnings', 'Amount'],
        ['Basic Salary', f"{payroll.basic_salary}"],
        ['Allowances', f"{payroll.allowances}"],
        ['Bonus', f"{payroll.bonus}"],
        ['Overtime Pay', f"{payroll.overtime_pay}"],
    ]
    deductions = [
        ['Deductions', 'Amount'],
        ['Deductions', f"{payroll.deductions}"],
        ['Tax', f"{payroll.tax}"],
        ['Insurance', f"{payroll.insurance}"],
    ]

    earnings_table = Table(earnings, hAlign='LEFT')
    deductions_table = Table(deductions, hAlign='LEFT')

    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
    ])
    earnings_table.setStyle(style)
    deductions_table.setStyle(style)

    elements.append(Paragraph('Earnings', styles['Heading3']))
    elements.append(earnings_table)
    elements.append(Spacer(1, 12))
    elements.append(Paragraph('Deductions', styles['Heading3']))
    elements.append(deductions_table)
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"Net Pay: {payroll.net_pay}", styles['Heading2']))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
