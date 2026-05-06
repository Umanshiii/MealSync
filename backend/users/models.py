from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Custom user model"""
    USER_ROLES = [
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
    ]

    role = models.CharField(max_length=10, choices=USER_ROLES)
    phone = models.CharField(max_length=15, blank=True, null=True)
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, null=True, blank=True, related_name='users')

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
