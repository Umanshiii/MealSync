from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import School, Student
from .serializers import SchoolSerializer, StudentSerializer, StudentListSerializer


class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'location', 'district', 'state']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return School.objects.all()
        elif user.role == 'teacher' and user.school:
            return School.objects.filter(id=user.school.id)
        return School.objects.none()

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get all students for a school"""
        school = self.get_object()
        students = school.students.filter(is_active=True)

        # Apply filters
        class_name = request.query_params.get('class_name', None)
        if class_name:
            students = students.filter(class_name=class_name)

        serializer = StudentListSerializer(students, many=True)
        return Response(serializer.data)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['school', 'class_name', 'section', 'gender', 'is_active']
    search_fields = ['name', 'roll_number', 'guardian_name']
    ordering_fields = ['name', 'roll_number', 'class_name', 'created_at']
    ordering = ['class_name', 'roll_number']

    def get_serializer_class(self):
        if self.action == 'list':
            return StudentListSerializer
        return StudentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Student.objects.all()
        elif user.role == 'teacher' and user.school:
            return Student.objects.filter(school=user.school)
        return Student.objects.none()
