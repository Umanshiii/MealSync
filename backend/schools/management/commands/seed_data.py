from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from schools.models import School, Student
from meals.models import MealRecord, Attendance
from bmi.models import BMIRecord, BMIComplianceStatus
from datetime import date, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed database with demo data for MealSync'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting data seeding...')

        # Create admin user
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@mealsync.gov',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('Created admin user'))

        # Create schools
        schools_data = [
            {
                'name': 'Delhi Public School',
                'code': 'DPS001',
                'location': 'Sector 45, Gurgaon',
                'district': 'Gurgaon',
                'state': 'Haryana',
                'principal_name': 'Dr. Rajesh Kumar',
                'contact_email': 'principal@dps001.edu',
                'contact_phone': '9876543210'
            },
            {
                'name': 'Government High School',
                'code': 'GHS002',
                'location': 'Village Road, Faridabad',
                'district': 'Faridabad',
                'state': 'Haryana',
                'principal_name': 'Mrs. Anita Sharma',
                'contact_email': 'principal@ghs002.edu',
                'contact_phone': '9876543211'
            },
            {
                'name': 'Kendriya Vidyalaya',
                'code': 'KV003',
                'location': 'Cantonment Area, Delhi',
                'district': 'South Delhi',
                'state': 'Delhi',
                'principal_name': 'Mr. Suresh Patel',
                'contact_email': 'principal@kv003.edu',
                'contact_phone': '9876543212'
            },
            {
                'name': 'Modern Public School',
                'code': 'MPS004',
                'location': 'Sector 12, Noida',
                'district': 'Gautam Buddha Nagar',
                'state': 'Uttar Pradesh',
                'principal_name': 'Dr. Priya Singh',
                'contact_email': 'principal@mps004.edu',
                'contact_phone': '9876543213'
            },
        ]

        schools = []
        for school_data in schools_data:
            school, created = School.objects.get_or_create(
                code=school_data['code'],
                defaults=school_data
            )
            schools.append(school)
            if created:
                self.stdout.write(f'Created school: {school.name}')

        # Create teacher users for each school
        for school in schools:
            teacher, created = User.objects.get_or_create(
                username=f'teacher_{school.code.lower()}',
                defaults={
                    'email': f'teacher@{school.code.lower()}.edu',
                    'first_name': 'Teacher',
                    'last_name': school.code,
                    'role': 'teacher',
                    'school': school
                }
            )
            if created:
                teacher.set_password('teacher123')
                teacher.save()
                self.stdout.write(f'Created teacher for {school.name}')

        # Create students
        first_names = ['Amit', 'Priya', 'Rahul', 'Sneha', 'Vikas', 'Pooja', 'Ravi', 'Anjali', 'Sachin', 'Neha']
        last_names = ['Kumar', 'Sharma', 'Singh', 'Patel', 'Gupta', 'Verma', 'Reddy', 'Rao', 'Joshi', 'Mehta']
        classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
        sections = ['A', 'B', 'C']

        for school in schools:
            for i in range(30):  # 30 students per school
                student, created = Student.objects.get_or_create(
                    school=school,
                    roll_number=f'{random.randint(1000, 9999)}',
                    defaults={
                        'name': f'{random.choice(first_names)} {random.choice(last_names)}',
                        'date_of_birth': date.today() - timedelta(days=random.randint(2555, 5475)),  # 7-15 years
                        'gender': random.choice(['male', 'female']),
                        'class_name': random.choice(classes),
                        'section': random.choice(sections),
                        'guardian_name': f'{random.choice(first_names)} {random.choice(last_names)}',
                        'guardian_phone': f'98765{random.randint(10000, 99999)}',
                        'is_active': True
                    }
                )
                if created:
                    # Create BMI record for current month
                    current_month = date.today().month
                    current_year = date.today().year

                    # Random decision: 70% have BMI, 30% don't
                    if random.random() < 0.7:
                        height_cm = random.uniform(120, 170)
                        weight_kg = random.uniform(25, 65)

                        BMIRecord.objects.create(
                            student=student,
                            school=school,
                            height_cm=height_cm,
                            weight_kg=weight_kg,
                            month=current_month,
                            year=current_year,
                            recorded_by=admin
                        )

            self.stdout.write(f'Created students for {school.name}')

            # Update compliance status
            BMIComplianceStatus.update_compliance(
                school=school,
                month=date.today().month,
                year=date.today().year
            )

        self.stdout.write(self.style.SUCCESS('✅ Data seeding completed successfully!'))
        self.stdout.write('')
        self.stdout.write('Demo Credentials:')
        self.stdout.write('  Admin: username=admin, password=admin123')
        self.stdout.write('  Teachers: username=teacher_[school_code], password=teacher123')
        self.stdout.write('    Examples: teacher_dps001, teacher_ghs002, teacher_kv003, teacher_mps004')
