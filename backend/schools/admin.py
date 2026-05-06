from django.contrib import admin
from .models import School, Student


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'location', 'district', 'state', 'principal_name', 'created_at']
    list_filter = ['state', 'district']
    search_fields = ['name', 'code', 'location', 'principal_name']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'location', 'district', 'state')
        }),
        ('Contact Information', {
            'fields': ('principal_name', 'contact_email', 'contact_phone')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['name', 'roll_number', 'school', 'class_name', 'section', 'gender', 'is_active']
    list_filter = ['school', 'class_name', 'gender', 'is_active']
    search_fields = ['name', 'roll_number', 'guardian_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Student Information', {
            'fields': ('school', 'name', 'roll_number', 'date_of_birth', 'gender')
        }),
        ('Class Information', {
            'fields': ('class_name', 'section')
        }),
        ('Guardian Information', {
            'fields': ('guardian_name', 'guardian_phone')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )
