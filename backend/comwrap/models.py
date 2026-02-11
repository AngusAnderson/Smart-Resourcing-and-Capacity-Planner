from django.db import models
from django.utils.text import slugify

# Create your models here.
class ResourceBusinessUnit(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.name:
            self.name = "cwpuk_cwpuk"  # Default value for resource business unit
        super().save(*args, **kwargs)


class ReplyEntity(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.name:
            self.name = "Comwrap UK"  # Default value for reply entity
        super().save(*args, **kwargs)


class Specialism(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


def get_default_resource_bu():
    """Get or create the default ResourceBusinessUnit"""
    resource_bu, _ = ResourceBusinessUnit.objects.get_or_create(name="cwpuk_cwpuk")
    return resource_bu.id


class Employee(models.Model):
    name = models.CharField(max_length=30, unique=True)
    specialisms = models.ManyToManyField(Specialism, related_name='employees')
    resourceBU = models.ForeignKey(ResourceBusinessUnit, on_delete=models.CASCADE, default=get_default_resource_bu)  # New field for resource business unit, defaults to cwpuk_cwpuk. 
    excludedFromAI = models.BooleanField()
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        specialisms = ", ".join(s.name for s in self.specialisms.all())
        return f"{self.name} - {specialisms}"


def get_default_reply_entity():
    """Get or create the default ReplyEntity"""
    reply_entity, _ = ReplyEntity.objects.get_or_create(name="Comwrap UK")
    return reply_entity.id

    
class JobCode(models.Model):
    JOB_ORIGIN_CHOICES = {
    "A" : "A - Order or eq.",
    "B" : "B - Formal Effort",
    "C" : "C - Other effort",
    "D" : "D - Forecast COGE",
    }
    STATUS_CHOICES = {
    "O" : "O - Open",
    "B" : "B - Blocked", #indicates on hold projects
    "C" : "C - Closed",
    }

    code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    customerName = models.CharField(max_length=100)
    replyEntity = models.ForeignKey(ReplyEntity, on_delete=models.CASCADE, default=get_default_reply_entity)  # New field for reply entity, defaults to Comwrap UK.
    businessUnit = models.CharField(max_length=100)
    jobOrigin = models.CharField(
        max_length=1, 
        choices=[(k, v) for k, v in JOB_ORIGIN_CHOICES.items()],
        default='A',  # Default to "Order or eq."
        ) #choice of job origin from JOB_ORIGIN_CHOICES mapping
    budgetTime = models.IntegerField()  # in hours
    budgetCost = models.DecimalField(max_digits=10, decimal_places=2)  # in currency units,or maybe make as string??
    startDate = models.DateField()
    endDate = models.DateField()
    employees = models.ManyToManyField(Employee, related_name='jobCodes')
    status = models.CharField(
        max_length=1,
        choices=[(k, v) for k, v in STATUS_CHOICES.items()],
        null=True,
        blank=True,
    )  # choice of job status from STATUS_CHOICES mapping, nullable 
    
    def save(self, *args, **kwargs):
        # Auto-set status to null if description contains "OTHER JOB S-ORD" or "NO FORECAST" on description
        if self.description and ("NO FORECAST" in self.description.upper() or "OTHER JOB S-ORD" in self.description.upper()):
            self.status = None
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.code}: {self.description}"
    
# class ForecastEntry(models.Model):
#     forecastID = models.CharField(max_length=20, unique=True)
#     employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
#     jobCode = models.ForeignKey(JobCode, on_delete=models.CASCADE)
#     date = models.DateField()
#     hoursAllocated = models.DecimalField(max_digits=5, decimal_places=1)
    
#     def __str__(self):
#         return f"{self.employee.name} - {self.jobCode.code} on {self.date}: {self.hoursAllocated} hours"


# New models to support many-to-many allocations between forecasts and employees.
class Forecast(models.Model):
    forecastID = models.CharField(max_length=20, unique=True)
    jobCode = models.ForeignKey(JobCode, on_delete=models.CASCADE)
    date = models.DateField()

    def __str__(self):
        return f"{self.jobCode.code} - {self.forecastID} on {self.date}"


class ForecastAllocation(models.Model):
    forecast = models.ForeignKey(Forecast, on_delete=models.CASCADE, related_name='allocations')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='allocations')
    hoursAllocated = models.DecimalField(max_digits=5, decimal_places=1)

    class Meta:
        unique_together = (('forecast', 'employee'),)

    def __str__(self):
        return f"{self.employee.name} - {self.forecast.forecastID}: {self.hoursAllocated} hours"