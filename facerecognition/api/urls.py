from django.urls import path
from . import views

urlpatterns = [
    path('capture-images/', views.capture_images, name='capture_images'),
    path('compare-face/', views.compare_face, name='compare_face'),

    # Add more paths for other views as needed
]

