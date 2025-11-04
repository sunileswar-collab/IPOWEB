# Project Structure

```
bluestock_ipo/
├── bluestock_ipo/          # Django project configuration
│   ├── __init__.py
│   ├── settings.py         # Project settings
│   ├── urls.py            # Main URL configuration
│   └── wsgi.py            # WSGI configuration
│
├── ipo/                   # Main application
│   ├── management/        # Custom Django commands
│   │   └── commands/
│   │       └── load_sample_data.py
│   ├── migrations/        # Database migrations
│   ├── static/           # Static files (CSS, JS)
│   ├── templates/        # HTML templates
│   │   └── ipo/
│   ├── admin.py          # Django admin configuration
│   ├── apps.py           # App configuration
│   ├── authentication.py # Custom authentication
│   ├── models.py         # Database models
│   ├── serializers.py    # DRF serializers
│   ├── urls.py           # App URL patterns
│   └── views.py          # API views
│
├── frontend/             # React frontend (optional)
│   ├── public/
│   ├── src/
│   └── package.json
│
├── media/                # User uploaded files
│   └── logos/
│
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── DEPLOYMENT.md        # Deployment instructions
├── INSTALLATION.md      # Installation guide
├── manage.py            # Django management script
├── postman_collection.json # API testing collection
├── README.md            # Project documentation
├── requirements.txt     # Python dependencies
└── setup.py             # Project setup script
```

## Key Components

### Backend (Django + DRF)
- **Models**: Company, IPO, Document entities
- **API**: RESTful endpoints with filtering and search
- **Authentication**: JWT-based authentication
- **Admin**: Django admin interface for data management

### Frontend (React - Optional)
- **Components**: Reusable UI components
- **Pages**: Home, IPO List, IPO Detail pages
- **Services**: API integration layer

### Database
- **PostgreSQL**: Production-ready database
- **Migrations**: Version-controlled schema changes
- **Sample Data**: Pre-loaded IPO information