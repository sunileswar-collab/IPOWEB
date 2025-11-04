from rest_framework import generics, filters, permissions
from django.shortcuts import render
from django.http import JsonResponse
from .models import IPO
from .serializers import IPOSerializer

class IPOListView(generics.ListCreateAPIView):
    queryset = IPO.objects.all()
    serializer_class = IPOSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['company_name', 'status']
    ordering_fields = ['open_date', 'close_date', 'listing_date']
    ordering = ['-open_date']
    permission_classes = [permissions.AllowAny]

class IPODetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = IPO.objects.all()
    serializer_class = IPOSerializer
    permission_classes = [permissions.AllowAny]

def home_view(request):
    upcoming_ipos = IPO.objects.filter(status='upcoming')
    ongoing_ipos = IPO.objects.filter(status='ongoing')
    listed_ipos = IPO.objects.filter(status='listed')
    return render(request, 'ipo/index.html', {
        'upcoming_ipos': upcoming_ipos,
        'ongoing_ipos': ongoing_ipos,
        'listed_ipos': listed_ipos
    })

def ipo_detail_view(request, pk):
    ipo = IPO.objects.get(pk=pk)
    return render(request, 'ipo/ipo_detail.html', {'ipo': ipo})