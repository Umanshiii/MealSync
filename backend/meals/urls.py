from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MealRecordViewSet, AttendanceViewSet

router = DefaultRouter()
router.register(r'records', MealRecordViewSet, basename='meal-record')
router.register(r'attendance', AttendanceViewSet, basename='attendance')

urlpatterns = [
    path('', include(router.urls)),
]
