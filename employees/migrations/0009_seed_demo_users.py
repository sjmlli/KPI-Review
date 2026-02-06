from django.db import migrations


def seed_demo_users(apps, schema_editor):
    Role = apps.get_model("employees", "Role")
    Employee = apps.get_model("employees", "Employee")
    User = apps.get_model("auth", "User")  # اگر یوزر سفارشی داری باید این خط عوض بشه

    # نقش‌ها (اگر قبلاً ساخته شده باشند، دوباره ساخته نمی‌شن)
    hr_role, _ = Role.objects.get_or_create(name="HR")
    manager_role, _ = Role.objects.get_or_create(name="MANAGER")
    employee_role, _ = Role.objects.get_or_create(name="EMPLOYEE")

    demo_users = [
        ("hr", "hr12345678", hr_role),
        ("manager", "manager12345678", manager_role),
        ("employee", "employee12345678", employee_role),
    ]

    for username, password, role in demo_users:
        user, created = User.objects.get_or_create(username=username)
        if created:
            user.set_password(password)
            user.is_active = True
            user.save()

        # اگر Employee قبلاً وجود داشت، آپدیتش کن
        emp, _ = Employee.objects.get_or_create(user=user)
        emp.role = role
        emp.save()


class Migration(migrations.Migration):

    dependencies = [
        ("employees", "0008_seed_manager_role"),  # اگر آخرین migration تو عددش فرق داره، اینو درست کن
    ]

    operations = [
        migrations.RunPython(seed_demo_users, migrations.RunPython.noop),
    ]
