from django.urls import path
from .views import IPOListView, IPODetailView

urlpatterns = [
    path('ipo/', IPOListView.as_view(), name='ipo-list'),
    path('ipo/<int:pk>/', IPODetailView.as_view(), name='ipo-detail'),
]