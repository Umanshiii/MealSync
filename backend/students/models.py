from django.db import models
from schools.models import School


class Student(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    school = models.ForeignKey( School, on_delete=models.CASCADE, related_name='student_entries' )
    student_name = models.CharField(max_length=150)
    student_id = models.CharField(max_length=50)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField()
    student_class = models.CharField(max_length=20)
    section = models.CharField(max_length=10, blank=True, null=True)
    father_name = models.CharField(max_length=150, blank=True, null=True)
    mother_name = models.CharField(max_length=150, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students-records'
        ordering = ['student_name']
        unique_together = ['school', 'student_id']

    def __str__(self):
        return f"{self.student_name} - {self.school.student_name}"


class MonthlyBMIReport(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='bmi_reports'
    )
    month = models.PositiveIntegerField()
    year = models.PositiveIntegerField()
    height_cm = models.DecimalField(max_digits=5, decimal_places=2)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2)
    bmi = models.DecimalField(max_digits=5, decimal_places=2)
    remarks = models.TextField(blank=True, null=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'monthly_bmi_reports'
        ordering = ['-year', '-month']
        unique_together = ['student', 'month', 'year']

    def __str__(self):
        return f"{self.student.student_name} - BMI {self.month}/{self.year}"


class Attendance(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    month = models.PositiveIntegerField()
    year = models.PositiveIntegerField()
    total_school_days = models.PositiveIntegerField()
    days_present = models.PositiveIntegerField()
    days_absent = models.PositiveIntegerField()
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    remarks = models.TextField(blank=True, null=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attendance'
        ordering = ['-year', '-month']
        unique_together = ['student', 'month', 'year']

    def __str__(self):
        return f"{self.student.student_name} - Attendance {self.month}/{self.year}"