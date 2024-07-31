from django.urls import path
from . import views

urlpatterns = [
    path('capture-images/', views.capture_images, name='capture_images'),
    path('compare-face/', views.compare_face, name='compare_face'),
    path('predict-treatment-trends/', views.predict_treatment_trends, name='predict_treatment_trends'),

    # Add more paths for other views as needed
]

