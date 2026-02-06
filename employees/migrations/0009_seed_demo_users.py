from django.db import migrations
from django.utils import timezone


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

    # 2) یک دپارتمان پیش‌فرض (چون بعضی جاها ممکنه لازم بشه)
    dept, _ = Department.objects.get_or_create(name="General")

    # 3) ساخت ۳ یوزر + پروفایل Employee
    # نکته: Employee.email unique است، پس باید یکتا باشد
    # نکته: hire_date و salary اجباری هستند
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
        user, created = User.objects.get_or_create(
            username=item["username"],
            defaults={"email": item["email"], "first_name": item["first_name"], "last_name": item["last_name"]},
        )
        if created:
            user.set_password(item["password"])
            user.is_active = True
            user.save()
        else:
            # اگر یوزر از قبل هست، پسورد رو ست کن که مطمئن باشی همونه
            user.set_password(item["password"])
            user.save()

        emp, _ = Employee.objects.get_or_create(
            user=user,
            defaults={
                "first_name": item["first_name"],
                "last_name": item["last_name"],
                "email": item["email"],
                "hire_date": today,
                "designation": item["designation"],
                "role": item["role"],          # اینجا CharField است
                "salary": 10000000,            # مقدار تستی
                "status": "Active",
                "department": dept,
            },
        )

        # اگر از قبل وجود داشت، حداقل role/department رو درست کن
        emp.role = item["role"]
        emp.department = dept
        emp.save()

        created_emps[item["username"]] = emp

    # 4) ست کردن Manager برای کارمند (اختیاری ولی برای تست خوبه)
    mgr = created_emps.get("manager")
    emp = created_emps.get("employee")
    if mgr and emp:
        emp.managers.add(mgr)
        emp.team_lead = mgr
        emp.save()


class Migration(migrations.Migration):
    dependencies = [
        ("employees", "0008_seed_manager_role"),  # اگر آخرین migration تو چیز دیگه‌ست، همینو عوض کن
    ]

    operations = [
        migrations.RunPython(seed_demo_users, migrations.RunPython.noop),
    ]
