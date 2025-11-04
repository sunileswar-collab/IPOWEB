import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import getpass

def setup_postgresql():
    print("=== Bluestock IPO PostgreSQL Setup ===")
    
    # Database parameters
    db_name = 'bluestock_ipo'
    db_user = 'bluestock_user'
    db_password = 'bluestock123'
    
    # Get admin password
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
        print(f"Creating database '{db_name}'...")
        cursor.execute(f"CREATE DATABASE {db_name};")
        print(f"✓ Database '{db_name}' created successfully!")
        
        # Create user
        print(f"Creating user '{db_user}'...")
        cursor.execute(f"CREATE USER {db_user} WITH PASSWORD '{db_password}';")
        print(f"✓ User '{db_user}' created successfully!")
        
        # Grant privileges
        print("Granting privileges...")
        cursor.execute(f"GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user};")
        cursor.execute(f"ALTER USER {db_user} CREATEDB;")
        
        # Connect to the new database to grant schema permissions
        cursor.close()
        conn.close()
        
        # Connect to the new database
        conn = psycopg2.connect(
            host='localhost',
            port='5432',
            user='postgres',
            password=admin_password,
            database=db_name
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Grant schema permissions
        cursor.execute(f"GRANT ALL ON SCHEMA public TO {db_user};")
        cursor.execute(f"GRANT CREATE ON SCHEMA public TO {db_user};")
        cursor.execute(f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO {db_user};")
        cursor.execute(f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO {db_user};")
        print(f"✓ Schema privileges granted to '{db_user}'!")
        
        cursor.close()
        conn.close()
        
        print("\n🎉 PostgreSQL setup completed!")
        print("\nNext steps:")
        print("1. Run: python manage.py makemigrations")
        print("2. Run: python manage.py migrate")
        print("3. Run: python manage.py load_sample_data")
        
    except psycopg2.Error as e:
        if "already exists" in str(e):
            print(f"⚠️  Database or user already exists: {e}")
        else:
            print(f"❌ Error: {e}")
        
if __name__ == '__main__':
    setup_postgresql()