from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime

from .models import School
from students.models import Student
from .serializers import SchoolSerializer, StudentSerializer, StudentListSerializer

class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    # Fixed: Changed fields to look at model's school_name/school_code fields
    search_fields = ['school_name', 'school_code', 'district', 'state']
    ordering_fields = ['school_name', 'school_code', 'created_at']
    ordering = ['school_name']

    def get_queryset(self):
        user = self.request.user
        # Checking user role for data isolation
        if user.role == 'admin':
            return School.objects.all()
        elif user.role == 'supervisor' and user.school:
            return School.objects.filter(id=user.school.id)
        return School.objects.none()

    @action(detail=False, methods=['get'], url_path='get_context')
    def get_context(self, request):
        """
        Dynamically fetches school info and the student registry for the 
        logged-in supervisor's dashboard.
        """
        user = request.user
    
        if not user.school:
            return Response(
                {"detail": "No school associated with this supervisor account."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        school = user.school
        # Filter students linked to this specific school boundary context
        students = Student.objects.filter(school=school, is_active=True)

        return Response({
            "school_info": {
                "name": school.school_name,
                "code": school.school_code,
                "location": school.district + ", " + school.state
            },
            "students": StudentListSerializer(students, many=True).data
        })

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get all students for a specific school ID"""
        school = self.get_object()
        # Fixed: Changed school.students to school.student_entries to match your model related_name
        students = school.student_entries.filter(is_active=True)
        
        # Apply class-based filtering if provided in query params
        class_name = request.query_params.get('class_name', None)
        if class_name:
            students = students.filter(student_class=class_name)

        serializer = StudentListSerializer(students, many=True)
        return Response(serializer.data)

    # =========================================================================
    # ADDED ACTION FOR BACKEND INTEGRATION OF THE "ADD STUDENT" DASHBOARD BUTTON
    # =========================================================================
    @action(detail=False, methods=['post'], url_path='add_student')
    def add_student(self, request):
        """
        POST /api/schools/add_student/
        Custom action to quickly append a student node to the logged-in supervisor's school.
        """
        user = request.user
        
        if getattr(user, 'role', None) != 'supervisor' or not user.school:
            return Response(
                {"detail": "Authentication Error: Context must belong to an assigned school supervisor."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        school = user.school
        student_name = request.data.get('student_name')
        student_id = request.data.get('student_id')

        if not student_name or not student_id:
            return Response(
                {"detail": "Bad Request: Missing student_name or student_id payload parameters."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Create student profile row matching your model field definitions constraints
            student = Student.objects.create(
                school=school,
                student_name=student_name,
                student_id=student_id,
                gender='other',  # Default fallbacks to bypass non-nullable model limits seamlessly
                date_of_birth=datetime.now().date(),
                student_class='Primary'
            )
            
            serializer = StudentListSerializer(student)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception:
            return Response(
                {"detail": "Conflict Error: A student candidate with this tracking ID already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    # Fixed: Linked to actual model fields (student_class instead of class_name, etc.)
    filterset_fields = ['school', 'student_class', 'section', 'gender', 'is_active']
    search_fields = ['student_name', 'student_id']
    ordering_fields = ['student_name', 'student_id', 'student_class', 'created_at']
    ordering = ['student_class', 'student_id']

    def get_serializer_class(self):
        if self.action == 'list':
            return StudentListSerializer
        return StudentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Student.objects.all()
        elif user.role == 'supervisor' and user.school:
            return Student.objects.filter(school=user.school)
        return Student.objects.none()