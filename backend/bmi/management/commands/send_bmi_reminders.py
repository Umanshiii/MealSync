from django.core.management.base import BaseCommand
from datetime import datetime, date
import calendar
from schools.models import School
from bmi.models import BMIComplianceStatus

class Command(BaseCommand):
    help = "Check for pending BMI reports and send reminders"

    def handle(self, *args, **kwargs):
        today = date.today()
        # Find the last day of the current month
        last_day = calendar.monthrange(today.year, today.month)[1]
        
        # Check if we are 3 days away from the end of the month
        if last_day - today.day <= 3:
            schools = School.objects.all()
            for school in schools:
                # Check if compliance is 100%
                status = BMIComplianceStatus.objects.filter(
                    school=school, month=today.month, year=today.year
                ).first()

                if not status or status.completion_percentage < 100:
                    self.stdout.write(self.style.WARNING(
                        f"REMINDER: School {school.school_name} has not finished BMI reports!"
                    ))
                    # Here you would trigger an email or a dashboard notification