from django.contrib import admin
from .models import School

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    # Only using fields that actually exist in your School model
    list_display = ['school_name', 'school_code', 'district', 'state', 'agency_name', 'created_at']
    list_filter = ['state', 'district']
    search_fields = ['school_name', 'school_code', 'agency_name']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('school_name', 'school_code', 'district', 'state')
        }),
        ('Agency Information', {
            'fields': ('agency_id', 'agency_name')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )