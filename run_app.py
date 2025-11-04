#!/usr/bin/env python3
"""
Bluestock IPO Application Runner
Complete setup and run script for the IPO Web Application
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error in {description}:")
        print(f"Command: {command}")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("=== Bluestock IPO Web Application ===")
    print("Production-Ready Django REST API with JWT Authentication")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path('manage.py').exists():
        print("❌ Error: manage.py not found. Please run this script from the project root.")
        sys.exit(1)
    
    # Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        print("\n💡 If psycopg2-binary fails, try:")
        print("   pip install psycopg2-binary --only-binary=psycopg2-binary")
        print("   Or install Visual C++ Build Tools")
        return
    
    # Check database connection
    print("\n🔍 Checking database connection...")
    if not run_command("python manage.py check --database default", "Database connection check"):
        print("\n💡 Database setup required. Run:")
        print("   python setup_database.py")
        return
    
    # Make migrations
    if not run_command("python manage.py makemigrations", "Creating migrations"):
        return
    
    # Apply migrations
    if not run_command("python manage.py migrate", "Applying migrations"):
        return
    
    # Create superuser (optional)
    print("\n👤 Create admin user? (y/n): ", end="")
    if input().lower() == 'y':
        run_command("python manage.py createsuperuser", "Creating superuser")
    
    # Load sample data (optional)
    print("\n📊 Load sample IPO data? (y/n): ", end="")
    if input().lower() == 'y':
        run_command("python manage.py load_sample_data", "Loading sample data")
    
    # Start server
    print("\n🚀 Starting development server...")
    print("=" * 50)
    print("🌐 Application will be available at:")
    print("   • API: http://127.0.0.1:8000/api/")
    print("   • Admin: http://127.0.0.1:8000/admin/")
    print("   • Docs: Import postman_collection.json for API testing")
    print("=" * 50)
    
    try:
        subprocess.run("python manage.py runserver", shell=True, check=True)
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped. Thank you for using Bluestock IPO API!")

if __name__ == '__main__':
    main()