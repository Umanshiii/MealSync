from rest_framework import serializers
from .models import School
from students.models import Student # 1. FIXED IMPORT

class SchoolSerializer(serializers.ModelSerializer):
    total_students = serializers.SerializerMethodField()

    class Meta:
        model = School
        # 2. FIXED: Changed 'name' to 'school_name' and 'code' to 'school_code'
        fields = [
            'id', 'school_name', 'school_code', 'location', 'district', 'state', 
            'agency_id', 'agency_name', 'total_students', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_students(self, obj):
        # FIXED: Using 'student_entries' as defined in your Student model related_name
        return obj.student_entries.filter(is_active=True).count()


class StudentSerializer(serializers.ModelSerializer):
    # 3. FIXED: Changed source to school_name
    school_name = serializers.CharField(source='school.school_name', read_only=True)
    age = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 'school', 'school_name', 'student_name', 'student_id', 'date_of_birth', 'age',
            'gender', 'student_class', 'section', 'father_name', 'mother_name',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_age(self, obj):
        from datetime import date
        today = date.today()
        return today.year - obj.date_of_birth.year - (
            (today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day)
        )


class StudentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing students"""
    class Meta:
        model = Student
        # FIXED: Updated to use student_name and student_id
        fields = ['id', 'student_name', 'student_id', 'student_class', 'section', 'is_active']