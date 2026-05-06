from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BMIRecordViewSet, BMIComplianceStatusViewSet

router = DefaultRouter()
router.register(r'records', BMIRecordViewSet, basename='bmi-record')
router.register(r'compliance', BMIComplianceStatusViewSet, basename='bmi-compliance')

urlpatterns = [
    path('', include(router.urls)),
]
