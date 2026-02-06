from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

# اگر مدل Employee جدا داری، اینجا import کن:
# from employees.models import Employee

class Command(BaseCommand):
    help = "Create demo users for HR / Manager / Employee if they don't exist."

    @transaction.atomic
    def handle(self, *args, **options):
        User = get_user_model()

        demo_users = [
            # username, password, role
            ("hr_demo", "Hr@123456", "hr"),
            ("manager_demo", "Manager@123456", "manager"),
            ("employee_demo", "Employee@123456", "employee"),
        ]

        created_any = False

        for username, password, role in demo_users:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={"is_active": True},
            )
            if created:
                user.set_password(password)

                # ✅ این قسمت رو با ساختار پروژه خودت ست کن:
                # اگر role روی خود User هست:
                if hasattr(user, "role"):
                    user.role = role

                user.save()
                created_any = True

            # اگر role روی مدل Employee جداست، اینجا باید Employee بسازی/آپدیت کنی:
            # Employee.objects.update_or_create(user=user, defaults={"role": role})

        if created_any:
            self.stdout.write(self.style.SUCCESS("✅ Demo users created/updated."))
        else:
            self.stdout.write("ℹ️ Demo users already exist. Nothing to do.")
