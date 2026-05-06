from rest_framework import serializers
from .models import School, Student


class SchoolSerializer(serializers.ModelSerializer):
    total_students = serializers.SerializerMethodField()

    class Meta:
        model = School
        fields = ['id', 'name', 'code', 'location', 'district', 'state', 'principal_name',
                  'contact_email', 'contact_phone', 'total_students', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_students(self, obj):
        return obj.students.filter(is_active=True).count()


class StudentSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    age = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'school', 'school_name', 'name', 'roll_number', 'date_of_birth', 'age',
                  'gender', 'class_name', 'section', 'guardian_name', 'guardian_phone',
                  'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_age(self, obj):
        from datetime import date
        today = date.today()
        return today.year - obj.date_of_birth.year - ((today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day))


class StudentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing students"""

    class Meta:
        model = Student
        fields = ['id', 'name', 'roll_number', 'class_name', 'section', 'is_active']
