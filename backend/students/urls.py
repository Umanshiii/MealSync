from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, MonthlyBMIReportViewSet, AttendanceViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet, basename='student')
router.register(r'bmi-reports', MonthlyBMIReportViewSet, basename='bmi-report')
router.register(r'attendance', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path('', include(router.urls)),
]