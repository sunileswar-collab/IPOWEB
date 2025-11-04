#!/usr/bin/env python
"""
Bluestock IPO Web Application Setup
Internship Project - Production Ready Django REST API
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_application():
    """Setup the IPO Web Application"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluestock_ipo.settings')
    django.setup()
    
    print("🚀 Setting up Bluestock IPO Web Application...")
    
    try:
        # Create migrations
        print("📋 Creating database migrations...")
        execute_from_command_line(['manage.py', 'makemigrations'])
        
        # Apply migrations
        print("🗄️ Applying database migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        # Load sample data
        print("📊 Loading sample IPO data...")
        execute_from_command_line(['manage.py', 'load_sample_data'])
        
        print("\n✅ Setup completed successfully!")
        print("\n🌐 Next steps:")
        print("   1. Create admin user: python manage.py createsuperuser")
        print("   2. Start server: python manage.py runserver")
        print("   3. Access API: http://127.0.0.1:8000/api/")
        print("   4. Access Admin: http://127.0.0.1:8000/admin/")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    setup_application()