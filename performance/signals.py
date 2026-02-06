from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import PerformanceReviewItem


@receiver(post_save, sender=PerformanceReviewItem)
@receiver(post_delete, sender=PerformanceReviewItem)
def update_review_total_score(sender, instance: PerformanceReviewItem, **kwargs):
    """Keep PerformanceReview.total_score in sync."""
    if instance.review_id:
        instance.review.recalculate_total_score(save=True)
