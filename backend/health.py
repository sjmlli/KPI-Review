from django.http import JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def health(request):
    """Simple health check endpoint for Render."""
    return JsonResponse({"status": "ok"})
