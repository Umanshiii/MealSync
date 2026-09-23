from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models


class User(AbstractUser):

    USER_ROLES = [
        ('admin', 'Government Admin'),
        ('supervisor', 'School Supervisor'),
    ]

    role = models.CharField(max_length=15, choices=USER_ROLES, default='supervisor')
    phone = models.CharField(max_length=15, blank=True, null=True)
    school = models.OneToOneField('schools.School', on_delete=models.SET_NULL, null=True, blank=True, related_name='supervisor_profile')
    password_change_required = models.BooleanField(default=False, help_text='Require password change on next login')


    class Meta:
        db_table = 'users'

    def clean(self):
        if self.role == 'admin' and self.school is not None:
            raise ValidationError("Government admin should not be assigned to a school.")
        if self.role == 'supervisor' and self.school is None:
            raise ValidationError("Supervisor must be assigned to a school.")

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"