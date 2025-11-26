from django.urls import path
from . import views

urlpatterns = [
    #wip depending on what frontend needs
    path("hello/", views.hello_world, name="hello"),
    path("specialisms/", views.get_specialisms, name="specialisms"), 
    path("employees/", views.get_employees, name="employees"),
    path("employees/<slug:slug>/", views.get_employees),
    path("jobcodes/", views.get_jobcodes, name="job-codes"),
    path("jobcodes/<str:code>/", views.get_jobcodes),
    path("forecasts/", views.get_forecasts, name="forecasts"),
    path("forecasts/<str:forecastID>/", views.get_forecasts),
]
