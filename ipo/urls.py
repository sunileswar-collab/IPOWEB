from django.urls import path
from .views import IPOListView, IPODetailView
from .authentication import register, login, profile

urlpatterns = [
    path('auth/register/', register, name='register'),
    path('auth/login/', login, name='login'),
    path('auth/profile/', profile, name='profile'),
    path('ipo/', IPOListView.as_view(), name='ipo-list'),
    path('ipo/<int:pk>/', IPODetailView.as_view(), name='ipo-detail'),
]