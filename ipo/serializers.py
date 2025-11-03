from rest_framework import serializers
from .models import IPO

class IPOSerializer(serializers.ModelSerializer):
    listing_gain = serializers.ReadOnlyField()
    current_return = serializers.ReadOnlyField()
    
    class Meta:
        model = IPO
        fields = ['id', 'company_name', 'logo', 'price_band', 'open_date', 'close_date', 
                 'issue_size', 'issue_type', 'listing_date', 'status', 'ipo_price', 
                 'listing_price', 'current_market_price', 'listing_gain', 'current_return',
                 'rhp_pdf', 'drhp_pdf']