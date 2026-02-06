from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import JobPosting, Recruitment, RecruitmentIntegration, JobPostingIntegration
from .serializers import (
    JobPostingSerializer,
    RecruitmentSerializer,
    RecruitmentIntegrationSerializer,
)
from .integrations import (
    get_adapter,
    sync_job_posting_to_integration,
    sync_job_postings_for_integration,
    sync_applications_for_integration,
    update_integration_sync_status,
)
from employees.permissions import RolePermission


class JobPostingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing job postings
    """
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer
    permission_classes = [RolePermission]
    permission_required = 'recruitment.manage'
    read_permission = 'recruitment.view'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['job_title', 'description', 'department__name']
    filterset_fields = ['department', 'status', 'employment_type']
    ordering_fields = ['posted_date', 'closing_date']
    ordering = ['-posted_date']

    def _sync_to_integrations(self, job_posting: JobPosting) -> None:
        if job_posting.status != 'Open':
            return
        integrations = RecruitmentIntegration.objects.filter(
            is_active=True,
            auto_post_jobs=True,
        )
        for integration in integrations:
            try:
                sync_job_posting_to_integration(job_posting, integration)
            except Exception as exc:  # noqa: BLE001
                JobPostingIntegration.objects.update_or_create(
                    job_posting=job_posting,
                    integration=integration,
                    defaults={
                        'sync_status': 'Failed',
                        'sync_message': str(exc),
                    },
                )

    def perform_create(self, serializer):
        job_posting = serializer.save()
        self._sync_to_integrations(job_posting)

    def perform_update(self, serializer):
        job_posting = serializer.save()
        self._sync_to_integrations(job_posting)


class RecruitmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing recruitment/applications
    """
    queryset = Recruitment.objects.all()
    serializer_class = RecruitmentSerializer
    permission_classes = [RolePermission]
    permission_required = 'recruitment.manage'
    read_permission = 'recruitment.view'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['candidate_name', 'email', 'job_posting__job_title']
    filterset_fields = ['job_posting', 'status', 'offer_status']
    ordering_fields = ['created_at', 'interview_date']
    ordering = ['-created_at']


class RecruitmentIntegrationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing job board integrations
    """
    queryset = RecruitmentIntegration.objects.all()
    serializer_class = RecruitmentIntegrationSerializer
    permission_classes = [RolePermission]
    permission_required = 'recruitment.manage'
    read_permission = 'recruitment.view'

    @action(detail=True, methods=['post'])
    def test(self, request, pk=None):
        integration = self.get_object()
        adapter = get_adapter(integration.provider)
        ok, message = adapter.validate_credentials(integration.credentials or {})
        response_status = status.HTTP_200_OK if ok else status.HTTP_400_BAD_REQUEST
        return Response({'success': ok, 'message': message}, status=response_status)

    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        integration = self.get_object()
        if not integration.is_active:
            return Response(
                {'success': False, 'message': 'Integration is inactive.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        sync_job_postings_for_integration(integration)
        if integration.last_sync_status == 'Blocked':
            return Response(
                {'success': False, 'message': integration.last_sync_message or 'Sync blocked.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        created_count = sync_applications_for_integration(integration)
        update_integration_sync_status(
            integration,
            'Queued',
            f'Sync started. {created_count} applications ingested.',
        )
        return Response(
            {'success': True, 'message': 'Sync started.'},
            status=status.HTTP_200_OK,
        )


class RecruitmentWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, provider):
        provider_key = provider.strip().lower()
        if provider_key in {'linkedin', 'linked_in'}:
            provider_name = 'LinkedIn'
        elif provider_key in {'naukri', 'naukri.com', 'naukriin'}:
            provider_name = 'Naukri'
        else:
            return Response(
                {'success': False, 'message': 'Unknown provider.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token = request.headers.get('X-Integration-Token') or request.query_params.get('token')
        integration = RecruitmentIntegration.objects.filter(
            provider=provider_name,
            webhook_token=token,
            is_active=True,
        ).first()
        if not integration:
            return Response(
                {'success': False, 'message': 'Invalid integration token.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        payload = request.data if isinstance(request.data, dict) else {}
        candidate = payload.get('candidate') if isinstance(payload.get('candidate'), dict) else {}

        candidate_name = (
            payload.get('candidate_name')
            or candidate.get('name')
            or candidate.get('full_name')
        )
        if not candidate_name:
            first_name = payload.get('first_name') or candidate.get('first_name')
            last_name = payload.get('last_name') or candidate.get('last_name')
            candidate_name = f"{first_name or ''} {last_name or ''}".strip() or 'Unknown'
        email = payload.get('email') or candidate.get('email')
        if not email:
            return Response(
                {'success': False, 'message': 'Candidate email is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        phone_number = payload.get('phone_number') or candidate.get('phone') or candidate.get('phone_number')
        profile_url = payload.get('profile_url') or candidate.get('profile_url') or candidate.get('linkedin_url')
        resume_url = payload.get('resume_url') or candidate.get('resume_url') or payload.get('resume')
        external_id = (
            payload.get('external_application_id')
            or payload.get('application_id')
            or payload.get('external_id')
            or payload.get('id')
        )

        job_posting_id = payload.get('job_posting_id') or payload.get('job_posting') or payload.get('job_id')
        job_posting = None
        if job_posting_id:
            job_posting = JobPosting.objects.filter(pk=job_posting_id).first()
        if not job_posting:
            external_job_id = payload.get('external_job_id') or payload.get('job_external_id')
            if external_job_id:
                link = JobPostingIntegration.objects.filter(
                    integration=integration,
                    external_job_id=external_job_id,
                ).first()
                if link:
                    job_posting = link.job_posting

        if not job_posting:
            return Response(
                {'success': False, 'message': 'Job posting not found.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if external_id and Recruitment.objects.filter(
            external_id=external_id,
            source_provider=integration.provider
        ).exists():
            return Response(
                {'success': True, 'message': 'Application already exists.'},
                status=status.HTTP_200_OK,
            )

        application = Recruitment.objects.create(
            job_posting=job_posting,
            candidate_name=candidate_name,
            email=email,
            phone_number=phone_number,
            resume_url=resume_url,
            profile_url=profile_url,
            source_provider=integration.provider,
            external_id=external_id,
            source_payload=payload,
        )
        return Response(
            {'success': True, 'application_id': application.recruitment_id},
            status=status.HTTP_201_CREATED,
        )
