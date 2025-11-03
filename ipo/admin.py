from django.contrib import admin
from .models import IPO

@admin.register(IPO)
class IPOAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'status', 'open_date', 'close_date', 'issue_size']
    list_filter = ['status', 'open_date', 'issue_type']
    search_fields = ['company_name']
    fields = ['company_name', 'logo', 'price_band', 'open_date', 'close_date', 
             'issue_size', 'issue_type', 'listing_date', 'status', 'ipo_price', 
             'listing_price', 'current_market_price', 'rhp_pdf', 'drhp_pdf']