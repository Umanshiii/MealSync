from rest_framework import viewsets, permissions
from .models import Student, MonthlyBMIReport, Attendance
from .serializers import ( StudentSerializer, MonthlyBMIReportSerializer, AttendanceSerializer)


class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or getattr(user, 'role', None) == 'admin':
            return Student.objects.select_related('school').prefetch_related(
                'bmi_reports',
                'attendance_records'
            )

        if getattr(user, 'role', None) == 'supervisor' and user.school:
            return Student.objects.filter(
                school=user.school
            ).select_related('school').prefetch_related(
                'bmi_reports',
                'attendance_records'
            )

        return Student.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        if getattr(user, 'role', None) == 'supervisor' and user.school:
            serializer.save(school=user.school)
        else:
            serializer.save()


class MonthlyBMIReportViewSet(viewsets.ModelViewSet):
    serializer_class = MonthlyBMIReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or getattr(user, 'role', None) == 'admin':
            return MonthlyBMIReport.objects.select_related('student', 'student__school')

        if getattr(user, 'role', None) == 'supervisor' and user.school:
            return MonthlyBMIReport.objects.filter(
                student__school=user.school
            ).select_related('student', 'student__school')

        return MonthlyBMIReport.objects.none()


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or getattr(user, 'role', None) == 'admin':
            return Attendance.objects.select_related('student', 'student__school')

        if getattr(user, 'role', None) == 'supervisor' and user.school:
            return Attendance.objects.filter(
                student__school=user.school
            ).select_related('student', 'student__school')

        return Attendance.objects.none()
    
    def perform_create(self, serializer):
        student = serializer.validated_data.get('student')
        user = self.request.user
        
        # Security check: Ensure the student belongs to the supervisor's school
        if getattr(user, 'role', None) == 'supervisor' and student.school != user.school:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You cannot log attendance for students in other schools.")
            
        serializer.save()