from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Employee, Specialism, JobCode, ForecastEntry

@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello from Django!"})

@api_view(['GET'])
def get_specialisms(request):
    specialisms = Specialism.objects.all().values()
    return Response(list(specialisms))

@api_view(['GET'])
def get_employees(request):
    employees = Employee.objects.all()
    attributes = []
    for e in employees:
        attributes.append({
            "employeeID": e.id,
            "name": e.name,
            "excludedFromAI": e.excludedFromAI,
            "specialisms": list(e.specialisms.values_list("name", flat=True))
        })
    return Response(attributes)

@api_view(['GET'])
def get_jobcodes(request):
    jobcodes = JobCode.objects.all().values()
    return Response(list(jobcodes))

@api_view(['GET'])
def get_forecasts(request):
    forecasts = ForecastEntry.objects.select_related('employee', 'jobCode')
    data = []
    for f in forecasts:
        data.append({
            "forecastID": f.forecastID,
            "employee": f.employee.name,
            "jobCode": f.jobCode.code,
            "customer": f.jobCode.customerName,
        })
    return Response(data)