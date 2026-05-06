from django.db import models

class School(models.Model):
    """School model"""
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    location = models.CharField(max_length=255)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    principal_name = models.CharField(max_length=255, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'schools'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class Student(models.Model):
    """Student model"""
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='students')
    name = models.CharField(max_length=255)
    roll_number = models.CharField(max_length=50)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')])
    class_name = models.CharField(max_length=20)
    section = models.CharField(max_length=10, blank=True, null=True)
    guardian_name = models.CharField(max_length=255)
    guardian_phone = models.CharField(max_length=15)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'
        unique_together = [['school', 'roll_number']]
        ordering = ['class_name', 'roll_number']

    def __str__(self):
        return f"{self.name} ({self.roll_number}) - {self.school.name}"
