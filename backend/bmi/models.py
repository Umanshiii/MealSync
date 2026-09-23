from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from schools.models import School
from students.models import Student

class BMIRecord(models.Model):
    """Monthly BMI tracking for students"""
    BMI_CATEGORIES = [
        ('underweight', 'Underweight'),
        ('normal', 'Normal'),
        ('overweight', 'Overweight'),
        ('obese', 'Obese'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='bmi_records')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='bmi_records')

    # Measurements
    height_cm = models.FloatField(validators=[MinValueValidator(50), MaxValueValidator(250)])
    weight_kg = models.FloatField(validators=[MinValueValidator(10), MaxValueValidator(200)])

    # Calculated fields (set to editable=False as they are auto-calculated)
    bmi_value = models.FloatField(editable=False)
    bmi_category = models.CharField(max_length=15, choices=BMI_CATEGORIES, editable=False)

    # Timeframe
    month = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    year = models.IntegerField()
    
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bmi_records'
        unique_together = [['student', 'month', 'year']]
        ordering = ['-year', '-month', 'student__student_name']
        indexes = [
            models.Index(fields=['school', 'month', 'year']),
            models.Index(fields=['student', 'month', 'year']),
        ]

    def __str__(self):
        return f"{self.student.student_name} - {self.month}/{self.year} - {self.bmi_category}"

    def save(self, *args, **kwargs):
        """Auto-calculate BMI and update school compliance before saving"""
        self.calculate_bmi()
        super().save(*args, **kwargs)
        # Update the overall school compliance status automatically
        BMIComplianceStatus.update_compliance(self.school, self.month, self.year)

    def calculate_bmi(self):
        """Calculate BMI value and category logic"""
        height_m = self.height_cm / 100
        self.bmi_value = round(self.weight_kg / (height_m ** 2), 2)

        if self.bmi_value < 18.5:
            self.bmi_category = 'underweight'
        elif self.bmi_value < 25:
            self.bmi_category = 'normal'
        elif self.bmi_value < 30:
            self.bmi_category = 'overweight'
        else:
            self.bmi_category = 'obese'


class BMIComplianceStatus(models.Model):
    """Aggregated compliance tracking for Admin Dashboard"""
    COMPLIANCE_STATUS = [
        ('compliant', 'Compliant'),
        ('partially_compliant', 'Partially Compliant'),
        ('non_compliant', 'Non-Compliant'),
    ]

    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='bmi_compliance')
    month = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    year = models.IntegerField()

    total_students = models.IntegerField()
    students_with_bmi = models.IntegerField()
    pending_bmi = models.IntegerField()
    completion_percentage = models.IntegerField()
    compliance_status = models.CharField(max_length=25, choices=COMPLIANCE_STATUS)

    last_update_date = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bmi_compliance_status'
        unique_together = [['school', 'month', 'year']]
        ordering = ['-year', '-month']

    def __str__(self):
        return f"{self.school.school_name} - {self.month}/{self.year}: {self.completion_percentage}%"

    @classmethod
    def update_compliance(cls, school, month, year):
        """Logic to calculate how many students have submitted BMI vs total students"""
        total_students = Student.objects.filter(school=school, is_active=True).count()
        
        # Count unique students who have a record for this specific month/year
        students_with_bmi = BMIRecord.objects.filter(
            school=school,
            month=month,
            year=year
        ).values('student').distinct().count()

        pending = total_students - students_with_bmi
        percentage = int((students_with_bmi / total_students * 100)) if total_students > 0 else 0

        if percentage == 100:
            status = 'compliant'
        elif percentage >= 50:
            status = 'partially_compliant'
        else:
            status = 'non_compliant'

        obj, _ = cls.objects.update_or_create(
            school=school,
            month=month,
            year=year,
            defaults={
                'total_students': total_students,
                'students_with_bmi': students_with_bmi,
                'pending_bmi': pending,
                'completion_percentage': percentage,
                'compliance_status': status,
            }
        )
        return obj