from rest_framework import serializers
from .models import Student, MonthlyBMIReport, Attendance

class MonthlyBMIReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyBMIReport
        fields = ['id', 'student', 'month', 'year', 'height_cm', 'weight_kg', 'bmi', 'remarks', 'recorded_at']
        read_only_fields = ['id', 'recorded_at']

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['id', 'student', 'month', 'year', 'total_school_days', 'days_present', 'days_absent', 'attendance_percentage', 'remarks', 'recorded_at']
        read_only_fields = ['id', 'recorded_at']

class StudentSerializer(serializers.ModelSerializer):
    school_code = serializers.CharField(source='school.school_code', read_only=True)
    school_name = serializers.CharField(source='school.school_name', read_only=True)
    bmi_reports = MonthlyBMIReportSerializer(many=True, read_only=True)
    attendance_records = AttendanceSerializer(many=True, read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'school', 'school_code', 'school_name', 'student_name', 'student_id', 
            'gender', 'date_of_birth', 'student_class', 'section', 
            'father_name', 'mother_name', 'phone', 'address', 
            'is_active', 'created_at', 'updated_at', 
            'bmi_reports', 'attendance_records'
        ]
        read_only_fields = [
            'id', 'school', 'school_code', 'school_name', 'created_at', 
            'updated_at', 'bmi_reports', 'attendance_records'
        ]
        
class StudentListSerializer(serializers.ModelSerializer):
    """
    Exposes only the atomic primitives required by the supervisor dashboard 
    attendance registry table, keeping initial payload sizes minimal.
    """
    class Meta:
        model = Student
        fields = ['id', 'student_name', 'student_id']
        read_only_fields = ['id', 'student_name', 'student_id']