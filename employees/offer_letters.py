from io import BytesIO
from typing import Dict

from django.utils import timezone

from .models import OfferLetter, OfferLetterTemplate


DEFAULT_BODY_TEMPLATE = """Dear {employee_name},

We are pleased to offer you the position of {designation} at {company_name}. Your expected joining date is {joining_date}.

Your annual CTC will be {ctc}. You will be on probation for {probation_period}. Your reporting manager will be {reporting_manager}.

Work location: {work_location}
Shift timings: {shift_timings}
Benefits: {benefits}

Please sign and return this letter as acceptance of this offer.
"""


def _safe_format(template_text: str, context: Dict[str, str]) -> str:
    class SafeDict(dict):
        def __missing__(self, key):
            return f"{{{key}}}"

    return template_text.format_map(SafeDict(context))


def generate_offer_letter_pdf(offer_letter: OfferLetter, template: OfferLetterTemplate | None) -> bytes:
    try:
        from reportlab.lib.pagesizes import LETTER
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer
    except ImportError as exc:
        raise RuntimeError('reportlab is required to generate offer letters.') from exc

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=LETTER, title='Offer Letter')
    styles = getSampleStyleSheet()

    context = {
        'employee_name': offer_letter.employee.full_name,
        'designation': offer_letter.designation,
        'company_name': template.company_name if template else 'Company',
        'joining_date': offer_letter.joining_date.strftime('%d %b %Y'),
        'ctc': f"{offer_letter.ctc}",
        'probation_period': offer_letter.probation_period,
        'reporting_manager': offer_letter.reporting_manager.full_name if offer_letter.reporting_manager else 'N/A',
        'work_location': offer_letter.work_location,
        'shift_timings': offer_letter.shift_timings or 'N/A',
        'benefits': offer_letter.benefits or 'N/A',
        'issued_date': timezone.localdate().strftime('%d %b %Y'),
    }

    body_template = template.body if template and template.body else DEFAULT_BODY_TEMPLATE
    body_text = _safe_format(body_template, context)
    footer_text = ''
    if template and template.footer:
        footer_text = _safe_format(template.footer, context)

    elements = []
    if template and template.company_logo:
        try:
            elements.append(Image(template.company_logo.path, width=120, height=60))
            elements.append(Spacer(1, 12))
        except Exception:
            pass

    title_text = template.subject if template else 'Offer Letter'
    elements.append(Paragraph(f"<b>{title_text}</b>", styles['Title']))
    elements.append(Spacer(1, 12))

    if template and template.company_name:
        elements.append(Paragraph(template.company_name, styles['Heading2']))
    if template and template.company_address:
        elements.append(Paragraph(template.company_address.replace('\n', '<br/>'), styles['Normal']))
    elements.append(Spacer(1, 12))

    for section in body_text.split('\n\n'):
        elements.append(Paragraph(section.replace('\n', '<br/>'), styles['Normal']))
        elements.append(Spacer(1, 12))

    if footer_text:
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(footer_text.replace('\n', '<br/>'), styles['Normal']))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
