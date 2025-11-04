# Installation Guide

## Prerequisites
- Python 3.12+
- PostgreSQL 12+
- pip (Python package manager)

## Quick Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Database Setup
Create PostgreSQL database and user:
```sql
CREATE DATABASE bluestock_ipo;
CREATE USER bluestock_user WITH PASSWORD 'bluestock123';
GRANT ALL PRIVILEGES ON DATABASE bluestock_ipo TO bluestock_user;
```

### 3. Environment Configuration
Update `.env` file with your database credentials if needed.

### 4. Run Setup Script
```bash
python setup.py
```

### 5. Create Admin User
```bash
python manage.py createsuperuser
```

### 6. Start Application
```bash
python manage.py runserver
```

## Access Points
- **API**: http://127.0.0.1:8000/api/
- **Admin Panel**: http://127.0.0.1:8000/admin/
- **API Documentation**: Import `postman_collection.json` into Postman

## Troubleshooting
- Ensure PostgreSQL service is running
- Check database credentials in `.env` file
- Verify all dependencies are installed correctly