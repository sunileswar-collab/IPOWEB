#!/usr/bin/env python3
"""
Database Setup Script for Bluestock IPO Application
Run this script to create PostgreSQL database and user
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import getpass
import sys

def setup_database():
    print("=== Bluestock IPO Database Setup ===")
    
    # Get PostgreSQL admin credentials
    admin_password = getpass.getpass("Enter PostgreSQL admin (postgres) password: ")
    
    try:
        # Connect to PostgreSQL server
        conn = psycopg2.connect(
            host='localhost',
            port='5432',
            user='postgres',
            password=admin_password
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Create database
        print("Creating database 'bluestock_ipo'...")
        cursor.execute("CREATE DATABASE bluestock_ipo;")
        print("✓ Database created successfully!")
        
        # Create user
        print("Creating user 'bluestock_user'...")
        cursor.execute("CREATE USER bluestock_user WITH PASSWORD 'bluestock123';")
        print("✓ User created successfully!")
        
        # Grant privileges
        print("Granting privileges...")
        cursor.execute("GRANT ALL PRIVILEGES ON DATABASE bluestock_ipo TO bluestock_user;")
        cursor.execute("ALTER USER bluestock_user CREATEDB;")
        print("✓ Privileges granted successfully!")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 Database setup completed successfully!")
        print("\nNext steps:")
        print("1. Run: python manage.py makemigrations")
        print("2. Run: python manage.py migrate")
        print("3. Run: python manage.py createsuperuser")
        print("4. Run: python manage.py runserver")
        
    except psycopg2.Error as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n❌ Setup cancelled by user")
        sys.exit(1)

if __name__ == '__main__':
    setup_database()