from rest_framework import serializers
from .models import MealRecord, Attendance
from schools.serializers import StudentListSerializer


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_roll_number = serializers.CharField(source='student.roll_number', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'meal_record', 'student', 'student_name', 'student_roll_number',
                  'is_present', 'marked_by', 'marked_at']
        read_only_fields = ['id', 'marked_by', 'marked_at']


class MealRecordSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    attendances = AttendanceSerializer(many=True, read_only=True)
    total_students = serializers.SerializerMethodField()
    present_count = serializers.SerializerMethodField()

    class Meta:
        model = MealRecord
        fields = ['id', 'school', 'school_name', 'date', 'meal_photo', 'uploaded_by',
                  'uploaded_by_name', 'nutrition_score', 'nutrition_status', 'protein_content',
                  'carb_content', 'fat_content', 'notes', 'attendances', 'total_students',
                  'present_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'uploaded_by', 'nutrition_score', 'nutrition_status',
                            'protein_content', 'carb_content', 'fat_content', 'created_at', 'updated_at']

    def get_total_students(self, obj):
        return obj.attendances.count()

    def get_present_count(self, obj):
        return obj.attendances.filter(is_present=True).count()


class MealRecordCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating meal records"""

    class Meta:
        model = MealRecord
        fields = ['school', 'date', 'meal_photo', 'notes']

    def create(self, validated_data):
        meal_record = MealRecord.objects.create(**validated_data)
        # Calculate nutrition score after creation
        meal_record.calculate_nutrition_score()
        return meal_record


class BulkAttendanceSerializer(serializers.Serializer):
    """Serializer for bulk attendance marking"""
    meal_record = serializers.IntegerField()
    attendance_data = serializers.ListField(
        child=serializers.DictField(child=serializers.BooleanField())
    )

    def validate_attendance_data(self, value):
        """Validate that each item has student_id and is_present"""
        for item in value:
            if 'student_id' not in item or 'is_present' not in item:
                raise serializers.ValidationError("Each attendance record must have student_id and is_present")
        return value
