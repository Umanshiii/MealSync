from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from schools.models import School, Student
from bmi.models import BMIRecord, BMIComplianceStatus
from datetime import date, timedelta
from pathlib import Path
import random
import pandas as pd

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database from Excel dataset for MealSync"

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting data seeding...")

        base_dir = Path(__file__).resolve().parents[3]
        file_path = base_dir / "data" / "school_dataset.xlsx"

        df = pd.read_excel(file_path)
        df = df.fillna("")

        developer, created = User.objects.get_or_create(
            username="developer",
            defaults={
                "email": "developer@mealsync.dev",
                "first_name": "Dev",
                "last_name": "Admin",
                "is_staff": True,
                "is_superuser": True,
                "role": None,
                "school": None,
            },
        )
        if created:
            developer.set_password("dev123")
            developer.save()
            self.stdout.write(self.style.SUCCESS("Created developer superuser"))

        gov_admin, created = User.objects.get_or_create(
            username="gov_admin",
            defaults={
                "email": "admin@mealsync.gov",
                "first_name": "Government",
                "last_name": "Admin",
                "role": "admin",
                "is_staff": False,
                "is_superuser": False,
                "school": None,
            },
        )
        if created:
            gov_admin.set_password("admin123")
            gov_admin.save()
            self.stdout.write(self.style.SUCCESS("Created government admin user"))

        schools = []

        for _, row in df.iterrows():
            school_code = str(row["School ID"]).strip()
            school_name = str(row["School Name"]).strip()
            agency_id = str(row["Agency ID"]).strip()
            agency_name = str(row["Agency Name"]).strip()
            district = str(row["District"]).strip()
            state = str(row["State"]).strip()

            if not school_code or school_code.lower() == "nan":
                continue

            school, created = School.objects.get_or_create(
                code=school_code,
                defaults={
                    "name": school_name,
                    "location": "",
                    "district": district,
                    "state": state,
                    "principal_name": agency_name,
                    "contact_email": "",
                    "contact_phone": "",
                    "agency_id": agency_id,
                    "agency_name": agency_name,
                },
            )

            school.name = school_name or school.name
            school.district = district or school.district
            school.state = state or school.state
            if hasattr(school, "agency_id"):
                school.agency_id = agency_id
            if hasattr(school, "agency_name"):
                school.agency_name = agency_name
            school.save()

            if created:
                self.stdout.write(f"Created school: {school.name}")

            schools.append(school)

            supervisor_username = f"supervisor_{school_code.lower()}"
            supervisor_email = str(row["Supervisor Mail"]).strip()
            supervisor_name = str(row["Supervisor Name"]).strip()
            supervisor_contact = str(row["Supervisor Contact"]).strip()

            supervisor, created = User.objects.get_or_create(
                username=supervisor_username,
                defaults={
                    "email": supervisor_email,
                    "first_name": supervisor_name.split(" ")[0] if supervisor_name else "Supervisor",
                    "last_name": " ".join(supervisor_name.split(" ")[1:]) if len(supervisor_name.split(" ")) > 1 else school_code,
                    "phone": supervisor_contact,
                    "role": "supervisor",
                    "school": school,
                    "is_staff": False,
                    "is_superuser": False,
                },
            )

            if created:
                supervisor.set_password("supervisor123")
                supervisor.save()
                self.stdout.write(f"Created supervisor for {school.name}")

        first_names = ["Amit", "Priya", "Rahul", "Sneha", "Vikas", "Pooja", "Ravi", "Anjali", "Sachin", "Neha"]
        last_names = ["Kumar", "Sharma", "Singh", "Patel", "Gupta", "Verma", "Reddy", "Rao", "Joshi", "Mehta"]
        classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
        sections = ["A", "B", "C"]

        for school in schools:
            for i in range(30):
                roll_number = str(1000 + i)
                student, created = Student.objects.get_or_create(
                    school=school,
                    roll_number=roll_number,
                    defaults={
                        "name": f"{random.choice(first_names)} {random.choice(last_names)}",
                        "date_of_birth": date.today() - timedelta(days=random.randint(2555, 5475)),
                        "gender": random.choice(["male", "female"]),
                        "class_name": random.choice(classes),
                        "section": random.choice(sections),
                        "guardian_name": f"{random.choice(first_names)} {random.choice(last_names)}",
                        "guardian_phone": f"98765{random.randint(10000, 99999)}",
                        "is_active": True,
                    },
                )

                if created and random.random() < 0.7:
                    BMIRecord.objects.create(
                        student=student,
                        school=school,
                        height_cm=round(random.uniform(120, 170), 1),
                        weight_kg=round(random.uniform(25, 65), 1),
                        month=date.today().month,
                        year=date.today().year,
                        recorded_by=gov_admin,
                    )

            self.stdout.write(f"Created students for {school.name}")

            BMIComplianceStatus.update_compliance(
                school=school,
                month=date.today().month,
                year=date.today().year,
            )

        self.stdout.write(self.style.SUCCESS("Data seeding completed successfully!"))
        self.stdout.write("")
        self.stdout.write("Demo Credentials:")
        self.stdout.write("  Developer: username=developer, password=dev123")
        self.stdout.write("  Government Admin: username=gov_admin, password=admin123")
        self.stdout.write("  Supervisors: username=supervisor_[school_code], password=supervisor123")