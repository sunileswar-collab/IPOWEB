#!/usr/bin/env python
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluestock_ipo.settings')
    django.setup()
    
    print("Setting up IPO Web Application with PostgreSQL...")
    
    # Run migrations
    print("Creating database tables...")
    execute_from_command_line(['manage.py', 'makemigrations'])
    execute_from_command_line(['manage.py', 'migrate'])
    
    # Load sample data
    print("Loading sample data...")
    execute_from_command_line(['manage.py', 'load_sample_data'])
    
    print("Setup complete! Run 'python manage.py runserver' to start the application.")