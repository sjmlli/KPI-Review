from django.db import migrations
from django.utils import timezone
from django.contrib.auth.hashers import make_password


def seed_demo_users(apps, schema_editor):
    Role = apps.get_model("employees", "Role")
    Employee = apps.get_model("employees", "Employee")
    Department = apps.get_model("employees", "Department")
    User = apps.get_model("auth", "User")

    # 1) Roles
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

    # 2) Default department
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
            "is_staff": True,     # اگر بعداً خواستی /admin هم داشته باشه
            "is_superuser": False,
        },
        {
            "username": "manager",
            "password": "Manager@12345678",
            "first_name": "Demo",
            "last_name": "Manager",
            "email": "manager@example.com",
            "designation": "Manager",
            "role": "Manager",
            "is_staff": False,
            "is_superuser": False,
        },
        {
            "username": "employee",
            "password": "Employee@12345678",
            "first_name": "Demo",
            "last_name": "Employee",
            "email": "employee@example.com",
            "designation": "Employee",
            "role": "Employee",
            "is_staff": False,
            "is_superuser": False,
        },
    ]

    created_emps = {}

    for item in demo:
        user, created = User.objects.get_or_create(
            username=item["username"],
            defaults={
                "email": item["email"],
                "first_name": item["first_name"],
                "last_name": item["last_name"],
                "is_active": True,
                "is_staff": item["is_staff"],
                "is_superuser": item["is_superuser"],
                "password": make_password(item["password"]),  # ✅ درست داخل migration
            },
        )

        # اگر قبلاً وجود داشته، باز هم پسورد/ایمیل/نام‌ها رو آپدیت کن که مطمئن باشیم همونه
        if not created:
            user.email = item["email"]
            user.first_name = item["first_name"]
            user.last_name = item["last_name"]
            user.is_active = True
            user.is_staff = item["is_staff"]
            user.is_superuser = item["is_superuser"]
            user.password = make_password(item["password"])
            user.save()

        emp, _ = Employee.objects.get_or_create(
            user=user,
            defaults={
                "first_name": item["first_name"],
                "last_name": item["last_name"],
                "email": item["email"],
                "hire_date": today,
                "designation": item["designation"],
                "role": item["role"],   # CharField
                "salary": 10000000,
                "status": "Active",
                "department": dept,
            },
        )

        # sync در صورت وجود قبلی
        emp.first_name = item["first_name"]
        emp.last_name = item["last_name"]
        emp.email = item["email"]
        emp.designation = item["designation"]
        emp.role = item["role"]
        emp.department = dept
        emp.save()

        created_emps[item["username"]] = emp

    # 4) set manager for employee
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
