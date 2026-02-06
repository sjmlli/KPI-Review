from typing import Iterable, Tuple

from django.core.mail import EmailMultiAlternatives
from django.core.mail.backends.smtp import EmailBackend

from .models import EmailSettings


def get_active_email_settings() -> EmailSettings | None:
    return EmailSettings.objects.filter(is_active=True).order_by('-updated_at').first()


def send_templated_email(
    subject: str,
    html_body: str,
    recipients: Iterable[str],
    text_body: str | None = None,
) -> Tuple[bool, str]:
    settings = get_active_email_settings()
    if not settings:
        return False, 'No active SMTP settings configured.'

    backend = EmailBackend(
        host=settings.smtp_host,
        port=settings.smtp_port,
        username=settings.smtp_username,
        password=settings.smtp_password,
        use_tls=settings.use_tls,
        use_ssl=settings.use_ssl,
        fail_silently=False,
    )

    from_email = settings.from_email
    recipient_list = list({email for email in recipients if email})
    if not recipient_list:
        return False, 'No recipients configured.'

    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body or '',
        from_email=from_email,
        to=recipient_list,
        connection=backend,
    )
    if html_body:
        message.attach_alternative(html_body, 'text/html')
    try:
        message.send()
    except Exception as exc:  # noqa: BLE001
        return False, str(exc)
    return True, 'Email sent'
