from django.db import models

class School(models.Model):
    # Mapping to "School ID" and "School Name" in Excel
    school_code = models.CharField(max_length=50, unique=True) 
    school_name = models.CharField(max_length=255)
    
    # Mapping to Agency columns in Excel
    agency_id = models.CharField(max_length=50, blank=True, null=True)
    agency_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Location data
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    
    # Meta tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'schools'
        ordering = ['school_name']

    def __str__(self):
        return f"{self.school_name} ({self.school_code})"