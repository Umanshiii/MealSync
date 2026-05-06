from rest_framework import viewsets, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from .models import MealRecord, Attendance
from .serializers import (
    MealRecordSerializer, MealRecordCreateSerializer,
    AttendanceSerializer, BulkAttendanceSerializer
)
from schools.models import Student


class MealRecordViewSet(viewsets.ModelViewSet):
    queryset = MealRecord.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['school', 'date']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return MealRecordCreateSerializer
        return MealRecordSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return MealRecord.objects.all()
        elif user.role == 'teacher' and user.school:
            return MealRecord.objects.filter(school=user.school)
        return MealRecord.objects.none()

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=True, methods=['post'])
    def recalculate_nutrition(self, request, pk=None):
        """Recalculate nutrition score for a meal record"""
        meal_record = self.get_object()
        meal_record.calculate_nutrition_score()
        serializer = self.get_serializer(meal_record)
        return Response(serializer.data)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['meal_record', 'student', 'is_present']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Attendance.objects.all()
        elif user.role == 'teacher' and user.school:
            return Attendance.objects.filter(meal_record__school=user.school)
        return Attendance.objects.none()

    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        """Bulk mark attendance for multiple students"""
        serializer = BulkAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        meal_record_id = serializer.validated_data['meal_record']
        attendance_data = serializer.validated_data['attendance_data']

        try:
            meal_record = MealRecord.objects.get(id=meal_record_id)
        except MealRecord.DoesNotExist:
            return Response(
                {'detail': 'Meal record not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check permissions
        if request.user.role == 'teacher' and meal_record.school != request.user.school:
            return Response(
                {'detail': 'You do not have permission to mark attendance for this school'},
                status=status.HTTP_403_FORBIDDEN
            )

        created_records = []

        with transaction.atomic():
            for item in attendance_data:
                student_id = item['student_id']
                is_present = item['is_present']

                try:
                    student = Student.objects.get(id=student_id)
                except Student.DoesNotExist:
                    continue

                attendance, created = Attendance.objects.update_or_create(
                    meal_record=meal_record,
                    student=student,
                    defaults={
                        'is_present': is_present,
                        'marked_by': request.user
                    }
                )
                created_records.append(attendance)

        result_serializer = AttendanceSerializer(created_records, many=True)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
