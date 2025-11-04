# 🚀 Bluestock IPO Web Application - Deployment Guide

## 📋 Prerequisites

### System Requirements
- **Python**: 3.8+ (Recommended: 3.12.3)
- **PostgreSQL**: 12+ (Recommended: Latest)
- **OS**: Windows/Linux/macOS

### Required Software
1. **PostgreSQL Database Server**
   - Download: https://www.postgresql.org/download/
   - Install with default settings
   - Remember the postgres user password

2. **Python Environment**
   - Virtual environment recommended
   - pip package manager

## 🛠️ Installation Steps

### 1. Clone/Download Project
```bash
git clone <repository-url>
cd IPOWEB
```

### 2. Create Virtual Environment (Recommended)
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

**If psycopg2-binary fails:**
- Install Visual C++ Build Tools: https://visualstudio.microsoft.com/visual-cpp-build-tools/
- Or use: `pip install psycopg2-binary --only-binary=psycopg2-binary`

### 4. Database Setup
```bash
# Run database setup script
python setup_database.py

# Or manually create database:
# psql -U postgres
# CREATE DATABASE bluestock_ipo;
# CREATE USER bluestock_user WITH PASSWORD 'bluestock123';
# GRANT ALL PRIVILEGES ON DATABASE bluestock_ipo TO bluestock_user;
```

### 5. Configure Environment
Update `.env` file with your database credentials:
```env
DB_NAME=bluestock_ipo
DB_USER=bluestock_user
DB_PASSWORD=bluestock123
DB_HOST=localhost
DB_PORT=5432
```

### 6. Run Application
```bash
# Quick start (automated)
python run_app.py

# Or manual steps:
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/profile/` - User profile
- `POST /api/token/refresh/` - Refresh JWT token

### IPO Management
- `GET /api/ipo/` - List all IPOs (with filters)
- `POST /api/ipo/` - Create IPO (auth required)
- `GET /api/ipo/{id}/` - Get IPO details
- `PUT /api/ipo/{id}/` - Update IPO (auth required)
- `DELETE /api/ipo/{id}/` - Delete IPO (auth required)

### Query Parameters
- `?status=upcoming|ongoing|listed` - Filter by status
- `?search=company_name` - Search companies
- `?ordering=-open_date` - Sort results
- `?page=1&page_size=10` - Pagination

## 🧪 Testing

### Postman Collection
Import `postman_collection.json` for complete API testing:
1. Open Postman
2. Import → Upload Files → Select `postman_collection.json`
3. Set base_url variable to `http://127.0.0.1:8000`
4. Run authentication tests first to get JWT tokens

### Manual Testing
```bash
# Test API availability
curl http://127.0.0.1:8000/api/ipo/

# Register user
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","email":"test@example.com"}'
```

## 🔒 Security Features

- **JWT Authentication** with access/refresh tokens
- **Permission-based access** (read-only for anonymous users)
- **CORS configuration** for frontend integration
- **Input validation** and error handling
- **Secure password hashing**

## 📊 Admin Panel

Access Django admin at: `http://127.0.0.1:8000/admin/`
- Create superuser: `python manage.py createsuperuser`
- Manage IPOs, users, and data through web interface

## 🚀 Production Deployment

### Environment Variables
```env
DEBUG=False
SECRET_KEY=your-production-secret-key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
```

### Database
- Use managed PostgreSQL service (AWS RDS, Google Cloud SQL)
- Configure connection pooling
- Set up regular backups

### Web Server
- Use Gunicorn + Nginx for production
- Configure SSL certificates
- Set up static file serving

## 📝 Project Structure

```
IPOWEB/
├── bluestock_ipo/          # Django project settings
├── ipo/                    # Main application
│   ├── models.py          # Database models
│   ├── views.py           # API views
│   ├── serializers.py     # DRF serializers
│   └── authentication.py  # JWT auth views
├── requirements.txt        # Python dependencies
├── postman_collection.json # API testing collection
├── setup_database.py      # Database setup script
├── run_app.py             # Application runner
└── .env                   # Environment configuration
```

## 🆘 Troubleshooting

### Common Issues

1. **psycopg2 installation fails**
   - Install Visual C++ Build Tools
   - Use pre-compiled binary: `pip install psycopg2-binary --only-binary=psycopg2-binary`

2. **Database connection error**
   - Check PostgreSQL service is running
   - Verify credentials in `.env` file
   - Run `python setup_database.py`

3. **Migration errors**
   - Delete migration files (keep `__init__.py`)
   - Run `python manage.py makemigrations`
   - Run `python manage.py migrate`

4. **JWT token issues**
   - Check token expiration (60 minutes)
   - Use refresh token endpoint
   - Verify Authorization header format: `Bearer <token>`

## 📞 Support

For technical issues:
1. Check error logs in console
2. Verify all dependencies are installed
3. Ensure PostgreSQL is running
4. Test with Postman collection

---

**Bluestock Fintech IPO Web Application**  
*Production-Ready Django REST API with JWT Authentication*