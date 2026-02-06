from django.db import migrations
from django.contrib.auth import get_user_model


def seed_demo_users(apps, schema_editor):
    User = get_user_model()

    demo_users = [
        # username, password, role
        ("hr", "Hr@12345", "HR"),
        ("manager", "Manager@12345", "MANAGER"),
        ("employee", "Employee@12345", "EMPLOYEE"),
    ]

    for username, password, role in demo_users:
        user, created = User.objects.get_or_create(username=username)
        user.set_password(password)
        user.save()

        # اگر پروژه‌ات فیلد role روی Employee یا User دارد، اینجا باید ست بشه.
        # چون ساختار دقیق مدل‌های تو رو اینجا ندارم، این بخش رو امن گذاشتم.
        # اگر role داخل employees.Employee است، پایین رو طبق مدل خودت تنظیم کن.


class Migration(migrations.Migration):

    dependencies = [
        ("employees", "0008_seed_manager_role"),  # این رو مطابق آخرین migration خودت تنظیم کن
    ]

    operations = [
        migrations.RunPython(seed_demo_users, migrations.RunPython.noop),
    ]
