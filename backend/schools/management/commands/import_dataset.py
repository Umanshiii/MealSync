from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from schools.models import School
import pandas as pd

User = get_user_model()

class Command(BaseCommand):
    def handle(self, *args, **options):
        file_path = "data/school_dataset.xlsx"
        
        # 1. SETUP CORE ACCOUNTS (Admin & Developer)
        self.stdout.write("Setting up Admin and Developer accounts...")
        
        # Developer (Superuser)
        dev_user, created = User.objects.get_or_create(
            username="developer",
            defaults={
                "email": "developer@mealsync.dev",
                "is_staff": True,
                "is_superuser": True,
            }
        )
        if created:
            dev_user.set_password("dev123")
            dev_user.save()
            self.stdout.write(self.style.SUCCESS("Created 'developer' superuser"))

        # Government Admin
        gov_admin, created = User.objects.get_or_create(
            username="gov_admin",
            defaults={
                "email": "admin@mealsync.gov",
                "role": "admin",
            }
        )
        if created:
            gov_admin.set_password("admin123")
            gov_admin.save()
            self.stdout.write(self.style.SUCCESS("Created 'gov_admin' account"))

        # 2. FAST LOAD DATA
        df = pd.read_excel(file_path).fillna("") 
        
        # 3. CACHE EXISTING DATA
        existing_school_codes = set(School.objects.values_list('school_code', flat=True))
        existing_usernames = set(User.objects.values_list('username', flat=True))
        
        schools_to_create = []
        users_to_create = []
        
        self.stdout.write("Parsing data...")

        with transaction.atomic():
            for _, row in df.iterrows():
                s_id = str(row.get("School ID", "")).strip()
                if not s_id or s_id in existing_school_codes:
                    continue

                # Prepare School Object
                new_school = School(
                    school_code=s_id,
                    school_name=str(row.get("School Name", "")).strip(),
                    agency_name=str(row.get("Agency Name", "")).strip() or None,
                    district=str(row.get("District", "")).strip() or None,
                    state=str(row.get("State", "")).strip() or None
                )
                schools_to_create.append(new_school)
                existing_school_codes.add(s_id)

            # Bulk Insert Schools
            School.objects.bulk_create(schools_to_create)
            self.stdout.write(f"Bulk created {len(schools_to_create)} schools.")

            # Refresh school objects to link to users
            school_map = {s.school_code: s for s in School.objects.all()}

            for _, row in df.iterrows():
                s_id = str(row.get("School ID", "")).strip()
                if not s_id or s_id in existing_usernames:
                    continue

                # Prepare User Object
                new_user = User(
                    username=s_id,
                    first_name=str(row.get("Supervisor Name", "")).strip(),
                    email=str(row.get("Supervisor Mail", "")).strip() or None,
                    phone=str(row.get("Supervisor Contact", "")).strip() or None,
                    role="supervisor",
                    school=school_map.get(s_id),
                )
                new_user.set_password("Welcome@123")
                users_to_create.append(new_user)
                existing_usernames.add(s_id)

            # Bulk Insert Users
            User.objects.bulk_create(users_to_create)
            
        self.stdout.write(self.style.SUCCESS("Import Complete! All accounts ready."))