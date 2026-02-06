from django.db import migrations
from django.utils import timezone
from django.contrib.auth.hashers import make_password


def seed_demo_users(apps, schema_editor):
    Role = apps.get_model("employees", "Role")
    Employee = apps.get_model("employees", "Employee")
    Department = apps.get_model("employees", "Department")
    User = apps.get_model("auth", "User")

    Role.objects.get_or_create(
        name="HR",
        defaults={
            "description": "Human Resources",
            "portal": "Admin",
            "permissions": [],
            "is_system": True,
        },
    )
    Role.objects.get_or_create(
        name="Manager",
        defaults={
            "description": "Manager role",
            "portal": "Employee",
            "permissions": [],
            "is_system": True,
        },
    )
    Role.objects.get_or_create(
        name="Employee",
        defaults={
            "description": "Employee role",
            "portal": "Employee",
            "permissions": [],
            "is_system": True,
        },
    )

    dept, _ = Department.objects.get_or_create(name="General")
    today = timezone.now().date()

    demo = [
        {
            "username": "hr",
            "password": "Hr@12345678",
            "first_name": "Demo",
            "last_name": "HR",
            "email": "hr@example.com",
            "designation": "HR",
            "role": "HR",
        },
        {
            "username": "manager",
            "password": "Manager@12345678",
            "first_name": "Demo",
            "last_name": "Manager",
            "email": "manager@example.com",
            "designation": "Manager",
            "role": "Manager",
        },
        {
            "username": "employee",
            "password": "Employee@12345678",
            "first_name": "Demo",
            "last_name": "Employee",
            "email": "employee@example.com",
            "designation": "Employee",
            "role": "Employee",
        },
    ]

    created_emps = {}

    for item in demo:
        # نکته مهم: اینجا set_password نداریم، پس password رو هش می‌کنیم
        user, created = User.objects.get_or_create(
            username=item["username"],
            defaults={
                "email": item["email"],
                "first_name": item["first_name"],
                "last_name": item["last_name"],
                "password": make_password(item["password"]),
                "is_active": True,
            },
        )

        # اگر یوزر از قبل بود، پسوردش رو آپدیت کن (ولی Migration فقط یک‌بار اجرا میشه؛ این بیشتر برای اطمینانه)
        if not created:
            user.password = make_password(item["password"])
            user.is_active = True
            user.save()

        emp, _ = Employee.objects.get_or_create(
            user=user,
            defaults={
                "first_name": item["first_name"],
                "last_name": item["last_name"],
                "email": item["email"],
                "hire_date": today,
                "designation": item["designation"],
                "role": item["role"],
                "salary": 10000000,
                "status": "Active",
                "department": dept,
            },
        )

        emp.role = item["role"]
        emp.department = dept
        emp.save()

        created_emps[item["username"]] = emp

    mgr = created_emps.get("manager")
    emp = created_emps.get("employee")
    if mgr and emp:
        emp.managers.add(mgr)
        emp.team_lead = mgr
        emp.save()


class Migration(migrations.Migration):
    dependencies = [
        ("employees", "0008_seed_manager_role"),
    ]

    operations = [
        migrations.RunPython(seed_demo_users, migrations.RunPython.noop),
    ]
