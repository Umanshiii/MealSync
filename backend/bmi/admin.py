from django.contrib import admin
from .models import BMIRecord, BMIComplianceStatus


@admin.register(BMIRecord)
class BMIRecordAdmin(admin.ModelAdmin):
    list_display = ['student', 'school', 'month', 'year', 'bmi_value', 'bmi_category', 'created_at']
    list_filter = ['school', 'bmi_category', 'month', 'year']
    search_fields = ['student__name', 'student__roll_number', 'school__name']
    readonly_fields = ['bmi_value', 'bmi_category', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Student Information', {
            'fields': ('student', 'school')
        }),
        ('Measurements', {
            'fields': ('height_cm', 'weight_kg')
        }),
        ('Calculated Fields', {
            'fields': ('bmi_value', 'bmi_category')
        }),
        ('Tracking', {
            'fields': ('month', 'year', 'recorded_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(BMIComplianceStatus)
class BMIComplianceStatusAdmin(admin.ModelAdmin):
    list_display = ['school', 'month', 'year', 'completion_percentage', 'compliance_status', 'last_update_date']
    list_filter = ['compliance_status', 'month', 'year']
    search_fields = ['school__name', 'school__code']
    readonly_fields = ['last_update_date', 'created_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('School & Period', {
            'fields': ('school', 'month', 'year')
        }),
        ('Compliance Metrics', {
            'fields': ('total_students', 'students_with_bmi', 'pending_bmi', 'completion_percentage', 'compliance_status')
        }),
        ('Timestamps', {
            'fields': ('last_update_date', 'created_at')
        }),
    )
