from django.contrib import admin
from .models import Employee, Specialism, JobCode, Forecast, ForecastAllocation, ResourceBusinessUnit, ReplyEntity, User
# Register your models here.

admin.site.register(Employee)
admin.site.register(Specialism)
admin.site.register(JobCode)
admin.site.register(Forecast)
admin.site.register(ForecastAllocation)
admin.site.register(ResourceBusinessUnit)
admin.site.register(ReplyEntity)
admin.site.register(User)
