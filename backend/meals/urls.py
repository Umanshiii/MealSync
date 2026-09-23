from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from schools.views import SchoolViewSet
from meals.views import MealRecordViewSet, AttendanceViewSet as MealAttendanceViewSet
from students.views import StudentViewSet, MonthlyBMIReportViewSet, AttendanceViewSet as StudentAttendanceViewSet

router = DefaultRouter()
router.register(r'schools', SchoolViewSet, basename='school')
router.register(r'', MealRecordViewSet, basename='meal')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'bmi-reports', MonthlyBMIReportViewSet, basename='bmi')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)