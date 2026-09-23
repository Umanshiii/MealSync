import pandas as pd
from django.core.management.base import BaseCommand
from students.models import Student
from schools.models import School

class Command(BaseCommand):
    help = 'Import students from students_dataset.xlsx'

    def handle(self, *args, **options):
        # Path relative to your backend folder
        file_path = 'data/students_dataset.xlsx'
        
        try:
            df = pd.read_excel(file_path)
            self.stdout.write(self.style.SUCCESS(f"Found {len(df)} students. Starting import..."))

            count = 0
            for _, row in df.iterrows():
                # 1. Get the School object using the school_code column in your Excel
                try:
                    school = School.objects.get(school_code=str(row['school_id']))
                except School.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Skipping {row['student_name']}: School code {row['school_id']} not found."))
                    continue

                # 2. Create or Update the Student
                student, created = Student.objects.update_or_create(
                    student_id=row['student_id'],
                    defaults={
                        'student_name': row['student_name'],
                        'student_class': row['student_class'],
                        'section': row['section'],
                        'gender': row['gender'],
                        'date_of_birth': row.get('date_of_birth'),
                        'father_name': row['father_name'],
                        'mother_name': row['mother_name'],
                        'phone': row['phone'],
                        'address': row['address'],
                        'school': school,
                        'created_at': row.get('created_at'),
                        'updated_at': row.get('updated_at'),
                    }
                )
                if created:
                    count += 1

            self.stdout.write(self.style.SUCCESS(f"Successfully imported {count} new students!"))

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"File not found at {file_path}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {e}"))