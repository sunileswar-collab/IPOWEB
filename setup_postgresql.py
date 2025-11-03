import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from decouple import config

def setup_postgresql():
    # Database connection parameters
    db_name = config('DB_NAME')
    db_user = config('DB_USER')
    db_password = config('DB_PASSWORD')
    db_host = config('DB_HOST', default='localhost')
    db_port = config('DB_PORT', default='5432')
    
    try:
        # Connect to PostgreSQL server
        admin_user = config('POSTGRES_ADMIN_USER', default='postgres')
        admin_password = config('POSTGRES_ADMIN_PASSWORD', default=None)
        
        if not admin_password:
            admin_password = input("Enter PostgreSQL admin password: ")
            
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            user=admin_user,
            password=admin_password
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Create database
        cursor.execute(f"CREATE DATABASE {db_name};")
        print(f"Database '{db_name}' created successfully!")
        
        # Create user
        cursor.execute(f"CREATE USER {db_user} WITH PASSWORD '{db_password}';")
        print(f"User '{db_user}' created successfully!")
        
        # Grant privileges
        cursor.execute(f"GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user};")
        print(f"Privileges granted to '{db_user}'!")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"Error: {e}")
        
if __name__ == '__main__':
    setup_postgresql()