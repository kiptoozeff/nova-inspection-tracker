from rest_framework import serializers
from .models import Inspection
from datetime import date

class InspectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inspection
        fields = ['id', 'vehicle_plate', 'inspection_date', 'status', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_inspection_date(self, value):
        # Business Rule 1: Reject past inspection dates
        if value < date.today():
            raise serializers.ValidationError("Inspection date cannot be in the past")
        return value
    
    def validate_status(self, value):
        # Business Rule 2: Ensure valid status
        valid_statuses = ['scheduled', 'passed', 'failed']
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Status must be one of: {', '.join(valid_statuses)}"
            )
        return value
    
    def validate(self, data):
        # Additional validation if needed
        return data