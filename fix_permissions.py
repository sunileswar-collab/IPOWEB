import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import getpass

admin_password = getpass.getpass('Enter PostgreSQL admin password: ')

try:
    conn = psycopg2.connect(
        host='localhost', 
        port='5432', 
        user='postgres', 
        password=admin_password, 
        database='bluestock_ipo'
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    cursor.execute('GRANT ALL ON SCHEMA public TO bluestock_user;')
    cursor.execute('GRANT CREATE ON SCHEMA public TO bluestock_user;')
    cursor.execute('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bluestock_user;')
    cursor.execute('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bluestock_user;')
    
    print('✓ Permissions fixed!')
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f'Error: {e}')