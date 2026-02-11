from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import (
    Employee,
    Specialism,
    JobCode,
    Forecast,
    ForecastAllocation,
)
from .serializers import JobCodeSerializer
from openai import OpenAI

client = OpenAI()



@api_view(['POST'])
def ai_chat(request):
    messages = (request.data or {}).get("messages", [])
    if not messages:
        return Response({"error": "Messages are required"}, status=400)

    response = client.responses.create(
        model="gpt-5",
        input=messages,
    )

    return Response({"reply": response.output_text})

@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello from Django!"})

@api_view(['GET'])
def get_specialisms(request):
    specialisms = Specialism.objects.all().values()
    return Response(list(specialisms))

@api_view(['GET'])
def get_employees(request, slug=None):

    if slug is not None:
        try:
            employee = Employee.objects.get(slug=slug)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=404)
        
        data = {
            "employeeID": employee.id,
            "name": employee.name,
            "excludedFromAI": employee.excludedFromAI,
            "specialisms": list(employee.specialisms.values_list("name", flat=True))
        }
        return Response(data)

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

@api_view(['GET', 'PUT', 'PATCH'])
def get_jobcodes(request, code=None):
    if request.method == 'GET' and code is not None:
        try:
            jobcode = JobCode.objects.get(code=code)
        except JobCode.DoesNotExist:
            return Response({"error": "Jobcode not found"}, status=404)
        
        employees = []
        try:
            employees = list(jobcode.employees.values("id", "name"))
        except AttributeError:
            pass
        
        data = {
            "code": jobcode.code,
            "description": jobcode.description,
            "customerName": jobcode.customerName,
            "businessUnit": jobcode.businessUnit,
            "budgetTime": jobcode.budgetTime,
            "budgetCost": float(jobcode.budgetCost),
            "startDate": jobcode.startDate,
            "endDate": jobcode.endDate,
            "employees": employees
        }
        return Response(data)
        
    elif request.method in ['PUT', 'PATCH']:
        try:
            jobcode = JobCode.objects.get(code=code)
        except JobCode.DoesNotExist:
            return Response({"error": "Jobcode not found"}, status=404)
        
        data = request.data
        
        # Handle many-to-many employees separately
        employees = data.pop('employees', None)
        
        # Update regular fields
        for field, value in data.items():
            setattr(jobcode, field, value)
        jobcode.save()
        
        # Update employees if provided
        if employees is not None:
            if isinstance(employees, list):
                jobcode.employees.set(employees)
            jobcode.refresh_from_db()
        
        # Return the updated jobcode data
        response_data = {
            "code": jobcode.code,
            "description": jobcode.description,
            "customerName": jobcode.customerName,
            "businessUnit": jobcode.businessUnit,
            "budgetTime": jobcode.budgetTime,
            "budgetCost": float(jobcode.budgetCost),
            "startDate": jobcode.startDate,
            "endDate": jobcode.endDate,
            "employees": list(jobcode.employees.values("id", "name"))
        }
        return Response(response_data)
    if code is None:
        jobcodes = JobCode.objects.all().values()
        return Response(list(jobcodes))

@api_view(['GET'])
def get_forecasts(request, forecastID=None):
    # If an employee_id query param is provided, return allocations for that employee
    employee_id = request.GET.get('employee_id')

    if forecastID is None:
        if employee_id is not None:
            allocations = (
                ForecastAllocation.objects.select_related('forecast__jobCode', 'employee')
                .filter(employee__id=employee_id)
            )
            data = []
            for a in allocations:
                data.append({
                    "forecastID": a.forecast.forecastID,
                    "jobCode": a.forecast.jobCode.code,
                    "customer": a.forecast.jobCode.customerName,
                    "date": a.forecast.date,
                    "hoursAllocated": float(a.hoursAllocated),
                    "employeeID": a.employee.id,
                    "employeeName": a.employee.name,
                })
            return Response(data)

        # No filter: return all forecasts with their allocations
        forecasts = Forecast.objects.select_related('jobCode').all()
        data = []
        for f in forecasts:
            allocs = []
            for a in f.allocations.select_related('employee').all():
                allocs.append({
                    "employeeID": a.employee.id,
                    "employeeName": a.employee.name,
                    "hoursAllocated": float(a.hoursAllocated),
                })
            data.append({
                "forecastID": f.forecastID,
                "jobCode": f.jobCode.code,
                "customer": f.jobCode.customerName,
                "date": f.date,
                "allocations": allocs,
            })
        return Response(data)

    # Single forecast by forecastID
    try:
        f = Forecast.objects.select_related('jobCode').get(forecastID=forecastID)
    except Forecast.DoesNotExist:
        return Response({"error": "Forecast not found"}, status=404)

    allocations = []
    for a in f.allocations.select_related('employee').all():
        allocations.append({
            "employeeID": a.employee.id,
            "employeeName": a.employee.name,
            "hoursAllocated": float(a.hoursAllocated),
        })

    data = {
        "forecastID": f.forecastID,
        "jobCode": f.jobCode.code,
        "description": f.jobCode.description,
        "date": f.date,
        "allocations": allocations,
    }
    return Response(data)

@api_view(['GET', 'PATCH'])
def edit_jobcode(request, code):
    try:
        jobcode = JobCode.objects.get(code=code)
    except JobCode.DoesNotExist:
        return Response({"error": "Jobcode not found"}, status=404)
    
    if request.method == 'GET':
        serializer = JobCodeSerializer(jobcode)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = JobCodeSerializer(jobcode, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)