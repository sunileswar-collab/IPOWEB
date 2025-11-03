IPO Web Application

### 📄 Project Overview
Bluestock Fintech assigned its software development interns the task of creating a **production-level IPO Web Application** and **REST API**.  
The system displays **IPO-related information** such as company details, price bands, issue size, dates, listing gains, and more.  
It also provides **downloadable RHP and DRHP PDFs**, along with **search, filter, and sorting** functionalities.

---

## 🎯 Objective

To design and develop a **complete IPO Management System** with:
- A **public interface** for viewing IPOs (upcoming, ongoing, listed)
- An **admin panel** for managing IPOs and related documents
- A **REST API** for accessing IPO data across Bluestock platforms

---

## ⚙️ Tech Stack

| Component | Technology Used |
|------------|----------------|
| **Backend** | Python 3.12.3, Django 5.0.6, Django REST Framework 3.15.1 |
| **Frontend** | HTML, CSS, JavaScript, Bootstrap 5 |
| **Database** | PostgreSQL |
| **Storage** | Media files for logos and PDF uploads |
| **Tools** | VS Code, Postman, Git, GitHub |

---

## 🏗️ Project Features

### 🌐 Public Interface
- Homepage listing **Upcoming, Ongoing, and Listed IPOs**
- Individual **IPO Detail Pages**
- **Downloadable RHP and DRHP PDFs**
- **Search and Filter** options

### 🔐 Admin Panel
- Secure **Admin Login**
- **Create / Update / Delete** IPO entries
- Manage **company logos and PDF uploads**

### 🧩 REST API
| Endpoint | Description |
|-----------|-------------|
| `/api/ipo/` | Get list of all IPOs |
| `/api/ipo/<id>/` | Get details of a specific IPO |
| **Supports:** Search, Filter, Sorting |

---

## 🧱 Database Design

### **Entities**
- **Company** – Stores company info and logo
- **IPO** – Contains IPO details linked to a company
- **Documents** – Holds uploaded RHP and DRHP files

### **Relationships**
- One company → Many IPOs  
- One IPO → Many documents

---

## 🧩 Setup Instructions

### **1️⃣ Environment Setup**
``bash
pip install django==5.0.6 djangorestframework==3.15.1 psycopg2-binary pillow python-decouple
2️⃣ Create PostgreSQL Database
sql
Copy code
CREATE DATABASE bluestock_ipo;
CREATE USER bluestock_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE bluestock_ipo TO bluestock_user;
3️⃣ Start Django Project
bash
Copy code
django-admin startproject bluestock_ipo
cd bluestock_ipo
python manage.py startapp ipo
4️⃣ Run Server
bash
Copy code
python manage.py runserver
Access at: http://127.0.0.1:8000/

🧠 Recommended Practices
Use .env file with python-decouple for DB credentials.

Follow PEP8 coding standards.

Use Django Admin for quick data management.

Test APIs using Postman.

Add proper error handling and validations.

📦 Folder Structure
pgsql
Copy code
bluestock_ipo/
│
├── bluestock_ipo/
│   ├── settings.py
│   ├── urls.py
│
├── ipo/
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── admin.py
│   └── templates/
│       └── ipo/
│           ├── index.html
│           └── ipo_detail.html
│
├── manage.py
├── requirements.txt
└── README.md
