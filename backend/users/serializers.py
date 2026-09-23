from django.contrib.auth import password_validation
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source="school.school_name", read_only=True)
    school_code = serializers.CharField(source="school.school_code", read_only=True)
    location = serializers.SerializerMethodField() 

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "school_name","school_code", 'location', "password_change_required", "is_superuser" ]

    def get_location(self, obj):
        if obj.school and obj.school.district and obj.school.state:
            return f"{obj.school.district}, {obj.school.state}"
        elif obj.school:
            # Fallback if one of the fields is missing
            return obj.school.district or obj.school.state or "Location not set"
        return "---"

class UserCreateSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source="school.school_name", read_only=True)
    school_code = serializers.CharField(source="school.school_code", read_only=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone",
            "school",
            "school_name",
            "school_code",
            "password",
            "password_change_required",
            "is_superuser",
        ]
        read_only_fields = ["id", "school_name", "school_code", "is_superuser"]

    def validate_password(self, value):
        password_validation.validate_password(value, self.instance)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"}
    )


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"}
    )
    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        style={"input_type": "password"}
    )

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match"}
            )

        password_validation.validate_password(
            data["new_password"],
            self.context.get("request").user if self.context.get("request") else None
        )

        return data