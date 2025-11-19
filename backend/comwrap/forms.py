from django import forms
from .models import Specialism, Employee, JobCode, ForecastEntry

class SpecialismForm(forms.ModelForm):

    class Meta:
        model = Specialism
        fields = ['name']
        
class EmployeeForm(forms.ModelForm):

    class Meta:
        model = Employee
        fields = ['name', 'specialisms', 'excludedFromAI']
        widgets = {'specialisms': forms.CheckboxSelectMultiple()}

class JobCodeForm(forms.ModelForm):

    class Meta:
        model = JobCode
        fields = [
            'code', 
            'description', 
            'customerName', 
            'businessUnit', 
            'budgetTime', 
            'budgetCost', 
            'startDate', 
            'endDate'
            ]
        widgets = {
            'startDate': forms.DateInput(attrs= {'type': 'date'}),
            'endDate': forms.DateInput(attrs= {'type': 'date'})
            }

class ForecastEntryForm(forms.ModelForm):

    class Meta:
        model = ForecastEntry
        fields = [
            'forecastID', 
            'employee', 
            'jobCode',
            'date',
            'hoursAllocated'
            ]
        widgets = {
            'date': forms.DateInput(attrs= {'type': 'date'})
        }