from django.urls import path
from . import views

urlpatterns = [
    path("hello/", views.hello_world, name="hello"),
    path("specialisms/", views.get_specialisms, name="specialisms"), 
    path("employees/", views.get_employees, name="employees"),
    path("employees/<slug:slug>/", views.get_employees),
    path("jobcodes/", views.get_jobcodes, name="job-codes"),
    path("jobcodes/<str:code>/", views.get_jobcodes),
    path("jobcodes/<str:code>/edit/", views.edit_jobcode),
    path("forecasts/", views.get_forecasts, name="forecasts"),
    path("forecasts/create/", views.create_forecast, name="create-forecast"),
    path("forecasts/<str:forecastID>/", views.get_forecasts),
    path("ai/chat/", views.ai_chat, name="ai-chat"),
    path("export/forecast-allocations.xlsx", views.export_forecast, name="export-forecast-allocations"),
    path('login/', views.login_view, name='login'),
]
