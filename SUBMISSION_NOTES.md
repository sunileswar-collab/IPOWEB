# Internship Submission - IPO Web Application

## 🎯 Project Summary
This is a **production-ready IPO Web Application** developed as part of the Bluestock Fintech internship program. The application provides a comprehensive REST API and web interface for managing and displaying IPO information.

## ✅ Completed Features

### Backend (Django REST Framework)
- ✅ Complete IPO management system with Company, IPO, and Document models
- ✅ RESTful API with JWT authentication
- ✅ Search, filter, and sorting capabilities
- ✅ File upload functionality for logos and PDFs
- ✅ Django Admin interface for data management
- ✅ Sample data loading command
- ✅ PostgreSQL database integration

### Frontend (React - Optional)
- ✅ Modern React components for IPO display
- ✅ Responsive design with Bootstrap
- ✅ API integration for dynamic data loading
- ✅ Search and filter functionality

### Documentation & Setup
- ✅ Comprehensive README with project overview
- ✅ Installation guide with step-by-step instructions
- ✅ Project structure documentation
- ✅ Postman collection for API testing
- ✅ Environment configuration examples
- ✅ Deployment documentation

## 🚀 Quick Start
1. Install dependencies: `pip install -r requirements.txt`
2. Setup database (see INSTALLATION.md)
3. Run setup: `python setup.py`
4. Create admin user: `python manage.py createsuperuser`
5. Start server: `python manage.py runserver`

## 📊 API Endpoints
- `GET /api/ipo/` - List all IPOs with filtering
- `GET /api/ipo/{id}/` - Get specific IPO details
- `POST /api/auth/login/` - User authentication
- `GET /admin/` - Django admin interface

## 🔧 Technology Stack
- **Backend**: Django 5.0.6, Django REST Framework 3.15.1
- **Database**: PostgreSQL
- **Frontend**: React, Bootstrap 5
- **Authentication**: JWT tokens
- **File Storage**: Django media handling

## 📁 Key Files
- `models.py` - Database schema and relationships
- `serializers.py` - API data serialization
- `views.py` - API endpoints and business logic
- `admin.py` - Admin interface configuration
- `postman_collection.json` - API testing collection

## 🎓 Learning Outcomes
- Full-stack web development with Django and React
- RESTful API design and implementation
- Database modeling and relationships
- Authentication and authorization
- File handling and media management
- Professional project structure and documentation

---
**Developed by**: [Your Name]  
**Internship Program**: Bluestock Fintech  
**Submission Date**: [Current Date]