from django.db import models
from django.conf import settings
from schools.models import School, Student
from django.core.validators import MinValueValidator, MaxValueValidator

class BMIRecord(models.Model):
    """Student BMI record - monthly tracking"""
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

    # Calculated fields
    bmi_value = models.FloatField(editable=False)
    bmi_category = models.CharField(max_length=15, choices=BMI_CATEGORIES, editable=False)

    # Tracking
    month = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    year = models.IntegerField()
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bmi_records'
        unique_together = [['student', 'month', 'year']]
        ordering = ['-year', '-month', 'student__name']
        indexes = [
            models.Index(fields=['school', 'month', 'year']),
            models.Index(fields=['student', 'month', 'year']),
        ]

    def __str__(self):
        return f"{self.student.name} - {self.month}/{self.year} - BMI: {self.bmi_value}"

    def save(self, *args, **kwargs):
        """Auto-calculate BMI before saving"""
        self.calculate_bmi()
        super().save(*args, **kwargs)

    def calculate_bmi(self):
        """Calculate BMI value and category"""
        # BMI = weight_kg / (height_m)^2
        height_m = self.height_cm / 100
        self.bmi_value = round(self.weight_kg / (height_m ** 2), 2)

        # Determine category
        if self.bmi_value < 18.5:
            self.bmi_category = 'underweight'
        elif self.bmi_value < 25:
            self.bmi_category = 'normal'
        elif self.bmi_value < 30:
            self.bmi_category = 'overweight'
        else:
            self.bmi_category = 'obese'

    def has_bmi_drop(self):
        """Check if there's a significant BMI drop from previous month"""
        previous_records = BMIRecord.objects.filter(
            student=self.student,
            year__lte=self.year,
            month__lt=self.month
        ).order_by('-year', '-month').first()

        if previous_records:
            drop = previous_records.bmi_value - self.bmi_value
            return drop > 2  # Significant drop if >2 points
        return False


class BMIComplianceStatus(models.Model):
    """Track BMI compliance status by school per month"""
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
        return f"{self.school.name} - {self.month}/{self.year} - {self.compliance_status}"

    @classmethod
    def update_compliance(cls, school, month, year):
        """Update compliance status for a school"""
        from django.db.models import Count

        total_students = Student.objects.filter(school=school, is_active=True).count()
        students_with_bmi = BMIRecord.objects.filter(
            school=school,
            month=month,
            year=year
        ).values('student').distinct().count()

        pending = total_students - students_with_bmi
        percentage = int((students_with_bmi / total_students * 100)) if total_students > 0 else 0

        # Determine compliance status
        if percentage == 100:
            status = 'compliant'
        elif percentage >= 50:
            status = 'partially_compliant'
        else:
            status = 'non_compliant'

        # Update or create
        obj, created = cls.objects.update_or_create(
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
