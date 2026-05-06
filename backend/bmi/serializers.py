from rest_framework import serializers
from .models import BMIRecord, BMIComplianceStatus
from schools.serializers import StudentListSerializer


class BMIRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_roll_number = serializers.CharField(source='student.roll_number', read_only=True)
    school_name = serializers.CharField(source='school.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.username', read_only=True)

    class Meta:
        model = BMIRecord
        fields = ['id', 'student', 'student_name', 'student_roll_number', 'school', 'school_name',
                  'height_cm', 'weight_kg', 'bmi_value', 'bmi_category', 'month', 'year',
                  'recorded_by', 'recorded_by_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'bmi_value', 'bmi_category', 'recorded_by', 'created_at', 'updated_at']


class BMIRecordCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating BMI records"""

    class Meta:
        model = BMIRecord
        fields = ['student', 'school', 'height_cm', 'weight_kg', 'month', 'year']

    def validate(self, data):
        """Check for duplicate records"""
        student = data.get('student')
        month = data.get('month')
        year = data.get('year')

        if self.instance is None:  # Creating new record
            if BMIRecord.objects.filter(student=student, month=month, year=year).exists():
                raise serializers.ValidationError(
                    f"BMI record for {student.name} already exists for {month}/{year}"
                )

        return data


class BMIComplianceStatusSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    school_code = serializers.CharField(source='school.code', read_only=True)
    school_location = serializers.CharField(source='school.location', read_only=True)

    class Meta:
        model = BMIComplianceStatus
        fields = ['id', 'school', 'school_name', 'school_code', 'school_location', 'month', 'year',
                  'total_students', 'students_with_bmi', 'pending_bmi', 'completion_percentage',
                  'compliance_status', 'last_update_date', 'created_at']
        read_only_fields = ['id', 'last_update_date', 'created_at']


class StudentBMIStatusSerializer(serializers.Serializer):
    """Serializer for student BMI status in admin dashboard"""
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    roll_number = serializers.CharField()
    class_name = serializers.CharField()
    has_bmi = serializers.BooleanField()
    bmi_value = serializers.FloatField(allow_null=True)
    bmi_category = serializers.CharField(allow_null=True)
    last_update = serializers.DateTimeField(allow_null=True)
    status = serializers.CharField()


class SchoolBMIDetailSerializer(serializers.Serializer):
    """Serializer for detailed school BMI view"""
    school_id = serializers.IntegerField()
    school_name = serializers.CharField()
    month = serializers.IntegerField()
    year = serializers.IntegerField()
    total_students = serializers.IntegerField()
    students_with_bmi = serializers.IntegerField()
    pending_bmi = serializers.IntegerField()
    completion_percentage = serializers.IntegerField()
    compliance_status = serializers.CharField()
    student_records = StudentBMIStatusSerializer(many=True)
    monthly_trend = serializers.ListField()
