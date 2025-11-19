from django.urls import path
from . import views

urlpatterns = [
    #add endpoints here
    path("hello/", views.hello_world, name="hello"),
    path('specialisms/', views.get_specialisms),
    path('employees/', views.get_employees),
    path('jobcodes/', views.get_jobcodes),
    path('forecasts/', views.get_forecasts),
]
