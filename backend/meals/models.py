from django.db import models
from django.conf import settings
from schools.models import School
from students.models import Student

class MealRecord(models.Model):
    """Daily meal record with photo"""
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='meal_records')
    date = models.DateField()
    meal_photo = models.ImageField(upload_to='meals/%Y/%m/%d/')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    nutrition_score = models.IntegerField(null=True, blank=True, help_text='Auto-calculated nutrition score (0-100)')
    nutrition_status = models.CharField(
        max_length=10,
        choices=[('safe', 'Safe'), ('unsafe', 'Unsafe')],
        null=True,
        blank=True
    )
    protein_content = models.FloatField(null=True, blank=True, help_text='Estimated protein in grams')
    carb_content = models.FloatField(null=True, blank=True, help_text='Estimated carbs in grams')
    fat_content = models.FloatField(null=True, blank=True, help_text='Estimated fat in grams')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'meal_records'
        unique_together = [['school', 'date']]
        ordering = ['-date']

    def __str__(self):
        return f"{self.school.school_name} - {self.date}"

    def calculate_nutrition_score(self):
        """Auto-calculate nutrition score based on meal photo analysis"""
        # Placeholder for ML model integration
        # For now, return a random score between 60-95
        import random
        self.nutrition_score = random.randint(60, 95)
        self.nutrition_status = 'safe' if self.nutrition_score >= 75 else 'unsafe'

        # Mock nutritional values
        self.protein_content = random.uniform(40, 65)
        self.carb_content = random.uniform(70, 90)
        self.fat_content = random.uniform(15, 30)
        self.save()
