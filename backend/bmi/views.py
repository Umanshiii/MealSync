from rest_framework import viewsets, status, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from datetime import datetime
from .models import BMIRecord, BMIComplianceStatus
from .serializers import (
    BMIRecordSerializer, BMIRecordCreateSerializer,
    BMIComplianceStatusSerializer, StudentBMIStatusSerializer,
    SchoolBMIDetailSerializer
)
from schools.models import School
from students.models import Student


class BMIRecordViewSet(viewsets.ModelViewSet):
    queryset = BMIRecord.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['school', 'student', 'month', 'year', 'bmi_category']
    ordering_fields = ['year', 'month', 'created_at', 'bmi_value']
    ordering = ['-year', '-month']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return BMIRecordCreateSerializer
        return BMIRecordSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return BMIRecord.objects.all()
        elif user.role == 'supervisor' and user.school:
            return BMIRecord.objects.filter(school=user.school)
        return BMIRecord.objects.none()

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

        # Update compliance status
        bmi_record = serializer.instance
        BMIComplianceStatus.update_compliance(
            school=bmi_record.school,
            month=bmi_record.month,
            year=bmi_record.year
        )

    def perform_update(self, serializer):
        serializer.save()

        # Update compliance status
        bmi_record = serializer.instance
        BMIComplianceStatus.update_compliance(
            school=bmi_record.school,
            month=bmi_record.month,
            year=bmi_record.year
        )

    @action(detail=False, methods=['get'])
    def student_history(self, request):
        """Get BMI history for a specific student"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {'detail': 'student_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        records = self.get_queryset().filter(student_id=student_id).order_by('-year', '-month')
        serializer = self.get_serializer(records, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def school_summary(self, request):
        """Get BMI summary for a school in a specific month/year"""
        school_id = request.query_params.get('school_id')
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        if not all([school_id, month, year]):
            return Response(
                {'detail': 'school_id, month, and year parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            school = School.objects.get(id=school_id)
        except School.DoesNotExist:
            return Response(
                {'detail': 'School not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get all active students
        total_students = Student.objects.filter(school=school, is_active=True).count()

        # Get students with BMI records
        records = BMIRecord.objects.filter(
            school=school,
            month=int(month),
            year=int(year)
        )

        students_with_bmi = records.values('student').distinct().count()

        # Category breakdown
        category_breakdown = records.values('bmi_category').annotate(count=Count('id'))

        # Health alerts
        underweight_students = records.filter(bmi_category='underweight')
        students_with_drops = [r for r in records if r.has_bmi_drop()]

        return Response({
            'school_id': school.id,
            'school_name': school.name,
            'month': month,
            'year': year,
            'total_students': total_students,
            'students_with_bmi': students_with_bmi,
            'pending_bmi': total_students - students_with_bmi,
            'completion_percentage': int((students_with_bmi / total_students * 100)) if total_students > 0 else 0,
            'category_breakdown': list(category_breakdown),
            'health_alerts': {
                'underweight_count': underweight_students.count(),
                'bmi_drops_count': len(students_with_drops)
            }
        })


class BMIComplianceStatusViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BMIComplianceStatus.objects.all()
    serializer_class = BMIComplianceStatusSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['school', 'month', 'year', 'compliance_status']
    ordering_fields = ['year', 'month', 'completion_percentage']
    ordering = ['-year', '-month']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return BMIComplianceStatus.objects.all()
        elif user.role == 'supervisor' and user.school:
            return BMIComplianceStatus.objects.filter(school=user.school)
        return BMIComplianceStatus.objects.none()

    @action(detail=False, methods=['post'])
    def refresh_compliance(self, request):
        """Manually refresh compliance status for a school/month/year"""
        school_id = request.data.get('school_id')
        month = request.data.get('month')
        year = request.data.get('year')

        if not all([school_id, month, year]):
            return Response(
                {'detail': 'school_id, month, and year are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            school = School.objects.get(id=school_id)
        except School.DoesNotExist:
            return Response(
                {'detail': 'School not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        compliance = BMIComplianceStatus.update_compliance(school, int(month), int(year))
        serializer = self.get_serializer(compliance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """Get dashboard summary for admin"""
        month = request.query_params.get('month', datetime.now().month)
        year = request.query_params.get('year', datetime.now().year)

        compliance_records = self.get_queryset().filter(month=int(month), year=int(year))

        total_schools = compliance_records.count()
        compliant_schools = compliance_records.filter(compliance_status='compliant').count()
        partially_compliant = compliance_records.filter(compliance_status='partially_compliant').count()
        non_compliant = compliance_records.filter(compliance_status='non_compliant').count()

        total_students = sum(r.total_students for r in compliance_records)
        total_pending = sum(r.pending_bmi for r in compliance_records)

        return Response({
            'month': month,
            'year': year,
            'total_schools': total_schools,
            'compliant_schools': compliant_schools,
            'partially_compliant_schools': partially_compliant,
            'non_compliant_schools': non_compliant,
            'schools_requiring_action': partially_compliant + non_compliant,
            'total_students': total_students,
            'total_pending': total_pending,
        })

    @action(detail=False, methods=['get'])
    def school_detail(self, request):
        """Get detailed BMI view for a specific school"""
        school_id = request.query_params.get('school_id')
        month = request.query_params.get('month', datetime.now().month)
        year = request.query_params.get('year', datetime.now().year)

        if not school_id:
            return Response(
                {'detail': 'school_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            school = School.objects.get(id=school_id)
        except School.DoesNotExist:
            return Response(
                {'detail': 'School not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get all active students
        students = Student.objects.filter(school=school, is_active=True)

        # Get BMI records for current month
        bmi_records = BMIRecord.objects.filter(
            school=school,
            month=int(month),
            year=int(year)
        )

        # Build student records
        student_records = []
        for student in students:
            bmi_record = bmi_records.filter(student=student).first()

            student_records.append({
                'student_id': student.id,
                'student_name': student.name,
                'roll_number': student.roll_number,
                'class_name': student.class_name,
                'has_bmi': bmi_record is not None,
                'bmi_value': bmi_record.bmi_value if bmi_record else None,
                'bmi_category': bmi_record.bmi_category if bmi_record else None,
                'last_update': bmi_record.updated_at if bmi_record else None,
                'status': 'Updated' if bmi_record else 'Pending'
            })

        # Get compliance status
        try:
            compliance = BMIComplianceStatus.objects.get(
                school=school,
                month=int(month),
                year=int(year)
            )
        except BMIComplianceStatus.DoesNotExist:
            compliance = BMIComplianceStatus.update_compliance(school, int(month), int(year))

        # Get monthly trend (last 6 months)
        monthly_trend = []
        current_month = int(month)
        current_year = int(year)

        for i in range(6):
            trend_compliance = BMIComplianceStatus.objects.filter(
                school=school,
                month=current_month,
                year=current_year
            ).first()

            monthly_trend.insert(0, {
                'month': current_month,
                'year': current_year,
                'completion': trend_compliance.completion_percentage if trend_compliance else 0
            })

            current_month -= 1
            if current_month < 1:
                current_month = 12
                current_year -= 1

        return Response({
            'school_id': school.id,
            'school_name': school.name,
            'month': month,
            'year': year,
            'total_students': compliance.total_students,
            'students_with_bmi': compliance.students_with_bmi,
            'pending_bmi': compliance.pending_bmi,
            'completion_percentage': compliance.completion_percentage,
            'compliance_status': compliance.compliance_status,
            'student_records': student_records,
            'monthly_trend': monthly_trend
        })
