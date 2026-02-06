from django.db import models
from django.core.exceptions import ValidationError
from datetime import date

class Inspection(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('passed', 'Passed'),
        ('failed', 'Failed'),
    ]
    
    vehicle_plate = models.CharField(max_length=20)
    inspection_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def clean(self):
        # Business Rule 1: Reject past inspection dates
        if self.inspection_date < date.today():
            raise ValidationError({
                'inspection_date': 'Inspection date cannot be in the past'
            })
        
        # Business Rule 2: Ensure valid status
        if self.status not in dict(self.STATUS_CHOICES).keys():
            raise ValidationError({
                'status': f'Status must be one of: {", ".join(dict(self.STATUS_CHOICES).keys())}'
            })
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.vehicle_plate} - {self.inspection_date} ({self.status})"