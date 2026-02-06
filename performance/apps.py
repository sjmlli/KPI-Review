from django.apps import AppConfig


class PerformanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'performance'

    def ready(self):
        # noqa: F401
        from . import signals  # noqa
