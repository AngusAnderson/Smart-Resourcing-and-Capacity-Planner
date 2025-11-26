from django.contrib import admin
from .models import Employee, Specialism, JobCode, ForecastEntry
# Register your models here.

admin.site.register(Employee)
admin.site.register(Specialism)
admin.site.register(JobCode)
admin.site.register(ForecastEntry)
