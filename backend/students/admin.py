from django.contrib import admin
from .models import Student, MonthlyBMIReport, Attendance

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = [
        'student_name', 'student_id', 'school',
        'student_class', 'section', 'gender', 'is_active'
    ]
    list_filter = ['school', 'student_class', 'section', 'gender', 'is_active']
    search_fields = ['student_name', 'student_id', 'school__school_name']
    ordering = ['student_name']

@admin.register(MonthlyBMIReport)
class MonthlyBMIReportAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'month', 'year', 'height_cm',
        'weight_kg', 'bmi', 'recorded_at'
    ]
    list_filter = ['year', 'month', 'student__school']

    search_fields = ['student__student_name', 'student__student_id', 'student__school__school_name']
    ordering = ['-year', '-month']

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = [
        'student', 'month', 'year',
        'total_school_days', 'days_present',
        'days_absent', 'attendance_percentage'
    ]
    list_filter = ['year', 'month', 'student__school']
    search_fields = ['student__student_name', 'student__student_id', 'student__school__school_name']
    ordering = ['-year', '-month']
