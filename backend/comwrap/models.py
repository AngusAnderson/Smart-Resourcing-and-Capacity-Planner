from django.db import models
from django.utils.text import slugify

# Create your models here.
class Specialism(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Employee(models.Model):
    name = models.CharField(max_length=30, unique=True)
    specialisms = models.ManyToManyField(Specialism, related_name='employees') 
    #TODO would manager be a specialism aswell?
    excludedFromAI = models.BooleanField()
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.specialisms.all()}"
    
class JobCode(models.Model):
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    customerName = models.CharField(max_length=100)
    businessUnit = models.CharField(max_length=100)
    budgetTime = models.IntegerField()  # in hours
    budgetCost = models.DecimalField(max_digits=10, decimal_places=2)  # in currency units,or maybe make as string??
    startDate = models.DateField()
    endDate = models.DateField()

    def __str__(self):
        return f"{self.code}: {self.description}"
    
class ForecastEntry(models.Model):
    forecastID = models.CharField(max_length=20, unique=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    jobCode = models.ForeignKey(JobCode, on_delete=models.CASCADE)
    date = models.DateField()
    hoursAllocated = models.DecimalField(max_digits=5, decimal_places=1)
    
    def __str__(self):
        return f"{self.employee.name} - {self.jobCode.code} on {self.date}: {self.hoursAllocated} hours"