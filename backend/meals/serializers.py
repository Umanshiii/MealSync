from rest_framework import serializers
from .models import MealRecord
from students.models import Attendance, Student

class AttendanceSerializer(serializers.ModelSerializer):
    # Fixed: Mapping 'source' to match the actual fields inside students/models.py
    student_name = serializers.CharField(source='student.student_name', read_only=True)
    student_uid = serializers.CharField(source='student.student_id', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'student', 'student_name', 'student_uid',
            'month', 'year', 'total_school_days', 'days_present', 
            'days_absent', 'attendance_percentage', 'remarks', 'recorded_at'
        ]
        read_only_fields = ['id', 'recorded_at']


class MealRecordSerializer(serializers.ModelSerializer):
    # Fixed: Pointing to school_name instead of name to avoid database lookup crashes
    school_name = serializers.CharField(source='school.school_name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    
    total_students = serializers.SerializerMethodField()
    present_count = serializers.SerializerMethodField()

    class Meta:
        model = MealRecord
        fields = [
            'id', 'school', 'school_name', 'date', 'meal_photo', 'uploaded_by',
            'uploaded_by_name', 'nutrition_score', 'nutrition_status', 'protein_content',
            'carb_content', 'fat_content', 'notes', 'total_students',
            'present_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uploaded_by', 'nutrition_score', 'nutrition_status',
            'protein_content', 'carb_content', 'fat_content', 'created_at', 'updated_at'
        ]

    def get_total_students(self, obj):
        # Dynamically calculate total school strength for that specific date context
        return Student.objects.filter(school=obj.school, is_active=True).count()

    def get_present_count(self, obj):
        # Calculate how many kids were logged present for this specific date record's month/year
        return Attendance.objects.filter(
            student__school=obj.school,
            month=obj.date.month,
            year=obj.date.year,
            days_present=1
        ).count()


class MealRecordCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating meal records cleanly inside viewsets performs"""
    class Meta:
        model = MealRecord
        fields = ['school', 'date', 'meal_photo', 'notes']

    def create(self, validated_data):
        meal_record = MealRecord.objects.create(**validated_data)
        # Automatically trigger calculation pipeline rules upon instantiation
        meal_record.calculate_nutrition_score()
        return meal_record


class BulkAttendanceSerializer(serializers.Serializer):
    """Serializer for bulk attendance array marking"""
    meal_record = serializers.IntegerField()
    # Fixed: Removed the strict Boolean child type restriction so student_id can pass safely as an integer/string
    attendance_data = serializers.ListField(
        child=serializers.DictField()
    )

    def validate_attendance_data(self, value):
        """Validate that each layout item dictionary contains correct keys"""
        for item in value:
            if 'student_id' not in item or 'is_present' not in item:
                raise serializers.ValidationError(
                    "Each bulk record dictionary row block must contain 'student_id' and 'is_present'."
                )
        return value