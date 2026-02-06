from django.test import TestCase
from django.utils import timezone
from datetime import date, timedelta
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Inspection

class InspectionModelTest(TestCase):
    def test_create_inspection(self):
        """Test successful inspection creation with valid data"""
        inspection = Inspection.objects.create(
            vehicle_plate="ABC-1234",
            inspection_date=date.today() + timedelta(days=1),
            status="scheduled",
            notes="Regular inspection"
        )
        self.assertEqual(inspection.vehicle_plate, "ABC-1234")
        self.assertEqual(inspection.status, "scheduled")
        
    def test_past_date_validation(self):
        """Test that inspections with past dates are rejected"""
        from django.core.exceptions import ValidationError
        
        inspection = Inspection(
            vehicle_plate="XYZ-7890",
            inspection_date=date.today() - timedelta(days=1),
            status="scheduled"
        )
        
        with self.assertRaises(ValidationError) as context:
            inspection.full_clean()
        
        self.assertIn('inspection_date', context.exception.message_dict)

class InspectionAPITest(APITestCase):
    def test_create_valid_inspection(self):
        """Test successful inspection creation via API with valid data"""
        url = '/api/inspections/'
        tomorrow = date.today() + timedelta(days=1)
        data = {
            'vehicle_plate': 'DEF-5678',
            'inspection_date': tomorrow.isoformat(),
            'status': 'scheduled',
            'notes': 'Test inspection'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Inspection.objects.count(), 1)
        self.assertEqual(Inspection.objects.get().vehicle_plate, 'DEF-5678')
    
    def test_reject_past_date_inspection(self):
        """Test that API rejects inspections with past dates"""
        url = '/api/inspections/'
        yesterday = date.today() - timedelta(days=1)
        data = {
            'vehicle_plate': 'GHI-9012',
            'inspection_date': yesterday.isoformat(),
            'status': 'scheduled'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('inspection_date', response.data)
        self.assertEqual(Inspection.objects.count(), 0)