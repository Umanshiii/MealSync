from django.contrib import admin
from .models import MealRecord

@admin.register(MealRecord)
class MealRecordAdmin(admin.ModelAdmin):
    list_display = ['school', 'date', 'nutrition_score', 'nutrition_status', 'uploaded_by', 'created_at']
    list_filter = ['school', 'nutrition_status', 'date']
    search_fields = ['school__name', 'notes']
    readonly_fields = ['nutrition_score', 'nutrition_status', 'protein_content', 'carb_content', 'fat_content', 'created_at', 'updated_at']
    date_hierarchy = 'date'

    fieldsets = (
        ('Basic Information', {
            'fields': ('school', 'date', 'meal_photo', 'uploaded_by')
        }),
        ('Nutrition Analysis', {
            'fields': ('nutrition_score', 'nutrition_status', 'protein_content', 'carb_content', 'fat_content')
        }),
        ('Additional Information', {
            'fields': ('notes', 'created_at', 'updated_at')
        }),
    )