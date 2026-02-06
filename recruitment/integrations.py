from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

from django.utils import timezone

from .models import JobPosting, JobPostingIntegration, Recruitment, RecruitmentIntegration


PROVIDER_CONFIG = {
    'LinkedIn': {
        'required_any': ['access_token', 'client_id', 'client_secret'],
        'display_name': 'LinkedIn',
    },
    'Naukri': {
        'required_any': ['api_key', 'client_id', 'client_secret', 'access_token'],
        'display_name': 'Naukri',
    },
}


@dataclass
class SyncResult:
    status: str
    message: str
    external_job_id: Optional[str] = None
    external_job_url: Optional[str] = None


class JobBoardAdapter:
    provider = ''

    def validate_credentials(self, credentials: Dict[str, Any]) -> Tuple[bool, str]:
        if not credentials:
            return False, 'No credentials provided.'
        config = PROVIDER_CONFIG.get(self.provider, {})
        required_any = config.get('required_any', [])
        if required_any and not any(credentials.get(key) for key in required_any):
            return False, f"Provide at least one of: {', '.join(required_any)}"
        return True, 'Credentials look valid.'

    def post_job(self, job_posting: JobPosting, credentials: Dict[str, Any]) -> SyncResult:
        return SyncResult(
            status='Queued',
            message='Adapter stubbed. Replace with provider API calls.',
        )

    def fetch_applications(self, credentials: Dict[str, Any]) -> List[Dict[str, Any]]:
        return []


class LinkedInAdapter(JobBoardAdapter):
    provider = 'LinkedIn'


class NaukriAdapter(JobBoardAdapter):
    provider = 'Naukri'


ADAPTERS = {
    'LinkedIn': LinkedInAdapter(),
    'Naukri': NaukriAdapter(),
}


def get_adapter(provider: str) -> JobBoardAdapter:
    return ADAPTERS.get(provider, JobBoardAdapter())


def sync_job_posting_to_integration(
    job_posting: JobPosting,
    integration: RecruitmentIntegration
) -> JobPostingIntegration:
    adapter = get_adapter(integration.provider)
    credentials = integration.credentials or {}
    ok, message = adapter.validate_credentials(credentials)
    if not ok:
        result = SyncResult(status='Blocked', message=message)
    else:
        result = adapter.post_job(job_posting, credentials)
    link, _ = JobPostingIntegration.objects.get_or_create(
        job_posting=job_posting,
        integration=integration,
    )
    link.sync_status = result.status
    link.sync_message = result.message
    if result.external_job_id:
        link.external_job_id = result.external_job_id
    if result.external_job_url:
        link.external_job_url = result.external_job_url
    link.last_synced_at = timezone.now()
    link.save()
    return link


def sync_job_postings_for_integration(
    integration: RecruitmentIntegration
) -> List[JobPostingIntegration]:
    adapter = get_adapter(integration.provider)
    ok, message = adapter.validate_credentials(integration.credentials or {})
    if not ok:
        update_integration_sync_status(integration, 'Blocked', message)
        return []
    postings = JobPosting.objects.filter(status='Open')
    links: List[JobPostingIntegration] = []
    for posting in postings:
        links.append(sync_job_posting_to_integration(posting, integration))
    update_integration_sync_status(
        integration,
        'Queued',
        'Job postings queued for sync.',
    )
    return links


def sync_applications_for_integration(
    integration: RecruitmentIntegration
) -> int:
    adapter = get_adapter(integration.provider)
    ok, message = adapter.validate_credentials(integration.credentials or {})
    if not ok:
        update_integration_sync_status(integration, 'Blocked', message)
        return 0
    applications = adapter.fetch_applications(integration.credentials or {})
    created_count = 0
    for payload in applications:
        external_id = payload.get('external_id')
        if external_id and Recruitment.objects.filter(
            external_id=external_id,
            source_provider=integration.provider
        ).exists():
            continue
        job_posting = payload.get('job_posting')
        if not job_posting:
            continue
        if isinstance(job_posting, int):
            try:
                job_posting = JobPosting.objects.get(pk=job_posting)
            except JobPosting.DoesNotExist:
                continue
        Recruitment.objects.create(
            job_posting=job_posting,
            candidate_name=payload.get('candidate_name', 'Unknown'),
            email=payload.get('email', ''),
            phone_number=payload.get('phone_number'),
            resume_url=payload.get('resume_url'),
            profile_url=payload.get('profile_url'),
            source_provider=integration.provider,
            external_id=external_id,
            source_payload=payload,
        )
        created_count += 1
    return created_count


def update_integration_sync_status(
    integration: RecruitmentIntegration,
    status: str,
    message: str
) -> None:
    integration.last_sync_at = timezone.now()
    integration.last_sync_status = status
    integration.last_sync_message = message
    integration.save(update_fields=['last_sync_at', 'last_sync_status', 'last_sync_message'])
