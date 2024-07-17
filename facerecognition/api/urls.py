from django.urls import path
from . import views

urlpatterns = [
    path('capture_images/', views.capture_images, name='capture_images'),
    # Add more paths for other views as needed
]

