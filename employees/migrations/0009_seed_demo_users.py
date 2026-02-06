from django.db import migrations
from django.utils import timezone
from django.contrib.auth.hashers import make_password


def seed_demo_users(apps, schema_editor):
    Role = apps.get_model("employees", "Role")
    Employee = apps.get_model("employees", "Employee")
    Department = apps.get_model("employees", "Department")
    User = apps.get_model("auth", "User")

    # 1) نقش‌ها داخل جدول roles
    # توجه: portal تو مدل تو فقط Admin/Employee قبول می‌کنه
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

    # 2) یک دپارتمان پیش‌فرض
    dept, _ = Department.objects.get_or_create(name="General")

    # 3) ساخت ۳ یوزر + پروفایل Employee
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
        hashed = make_password(item["password"])

        user, created = User.objects.get_or_create(
            username=item["username"],
            defaults={
                "email": item["email"],
                "first_name": item["first_name"],
                "last_name": item["last_name"],
                "password": hashed,        # ✅ هش مستقیم
                "is_active": True,
            },
        )

        if not created:
            # ✅ اگر یوزر قبلاً هست، پسورد/فعال بودن رو آپدیت کن
            user.password = hashed
            user.is_active = True
            user.email = item["email"]
            user.first_name = item["first_name"]
            user.last_name = item["last_name"]
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

        # اگر از قبل وجود داشت، حداقل role/department و info رو درست کن
        emp.first_name = item["first_name"]
        emp.last_name = item["last_name"]
        emp.email = item["email"]
        emp.role = item["role"]
        emp.department = dept
        emp.save()

        created_emps[item["username"]] = emp

    # 4) ست کردن Manager برای کارمند
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
