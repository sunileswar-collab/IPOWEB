from django.core.management.base import BaseCommand
from ipo.models import IPO
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Load sample IPO data'

    def handle(self, *args, **options):
        sample_data = [
            {
                'company_name': 'TechCorp Ltd',
                'price_band': '₹100-120',
                'open_date': date.today() + timedelta(days=5),
                'close_date': date.today() + timedelta(days=8),
                'issue_size': '₹500 Cr',
                'issue_type': 'Book Building',
                'status': 'upcoming',
                'ipo_price': 110.0,
            },
            {
                'company_name': 'GreenEnergy Solutions',
                'price_band': '₹80-95',
                'open_date': date.today() - timedelta(days=2),
                'close_date': date.today() + timedelta(days=1),
                'issue_size': '₹300 Cr',
                'issue_type': 'Book Building',
                'status': 'ongoing',
                'ipo_price': 87.0,
            },
            {
                'company_name': 'FinanceHub Inc',
                'price_band': '₹150-180',
                'open_date': date.today() - timedelta(days=20),
                'close_date': date.today() - timedelta(days=17),
                'listing_date': date.today() - timedelta(days=10),
                'issue_size': '₹750 Cr',
                'issue_type': 'Book Building',
                'status': 'listed',
                'ipo_price': 165.0,
                'listing_price': 198.0,
                'current_market_price': 210.0,
            }
        ]

        for data in sample_data:
            IPO.objects.get_or_create(
                company_name=data['company_name'],
                defaults=data
            )
        
        self.stdout.write(self.style.SUCCESS('Sample data loaded successfully!'))