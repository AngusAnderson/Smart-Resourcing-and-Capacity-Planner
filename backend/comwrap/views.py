from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils.text import slugify
from .ai_service import run_ai_chat
from rest_framework import status

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

    pending_action = request.session.get("ai_pending_action")

    result = run_ai_chat(messages, client=client, pending_action=pending_action)

    if result.pop("clearPendingAction", False):
        request.session.pop("ai_pending_action", None)

    if "pendingAction" in result:
        request.session["ai_pending_action"] = result.pop("pendingAction")
        request.session.modified = True

    return Response(result)



@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello from Django!"})

@api_view(['GET'])
def get_specialisms(request):
    specialisms = Specialism.objects.all().values()
    return Response(list(specialisms))

@api_view(['GET', 'POST', 'DELETE', 'PATCH']) 
def get_employees(request, slug=None):

    if request.method == 'GET':
        if slug is not None:
            try:
                employee = Employee.objects.get(slug=slug)
            except Employee.DoesNotExist:
                return Response({"error": "Employee not found"}, status=404)

            data = {
                "employeeID": employee.id,
                "name": employee.name,
                "resourceBU": employee.resourceBU.name,
                "excludedFromAI": employee.excludedFromAI,
                "specialisms": list(employee.specialisms.values_list("name", flat=True)),
                "jobCodes": list(employee.jobCodes.values_list("code", flat=True))
            }
            return Response(data)

        employees = Employee.objects.all()
        attributes = []
        for e in employees:
            attributes.append({
                "employeeID": e.id,
                "name": e.name,
                "resourceBU": e.resourceBU.name,
                "excludedFromAI": e.excludedFromAI,
                "specialisms": list(e.specialisms.values_list("name", flat=True)),
                "jobCodes": list(e.jobCodes.values_list("code", flat=True))
            })
        return Response(attributes)


    elif request.method == 'POST':
        name = request.data.get("name")
        specialisms = request.data.get("specialisms", [])
        excludedFromAI = request.data.get("excludedFromAI", False)

        if not name:
            return Response({"error": "Name is required"}, status=400)

        try:
            employee = Employee.objects.create(
                name=name,
                excludedFromAI=excludedFromAI
            )

            specialism_objects = Specialism.objects.filter(name__in=specialisms)
            employee.specialisms.set(specialism_objects)

            return Response({
                "message": "Employee created successfully",
                "employeeID": employee.id,
                "name": employee.name,
                "excludedFromAI": employee.excludedFromAI,
                "specialisms": list(employee.specialisms.values_list("name", flat=True))
            }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


    elif request.method == 'PATCH':
        if slug is None:
            return Response({"error": "Slug is required"}, status=400)

        try:
            employee = Employee.objects.get(slug=slug)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=404)

        data = request.data or {}

        name = data.get("name")
        excluded_from_ai = data.get("excludedFromAI")
        specialisms = data.get("specialisms")

        if name is not None:
            employee.name = name
            employee.slug = slugify(name)

        if excluded_from_ai is not None:
            employee.excludedFromAI = excluded_from_ai

        employee.save()

        if specialisms is not None:
            if isinstance(specialisms, list):
                specialism_objs = Specialism.objects.filter(name__in=specialisms)
                employee.specialisms.set(specialism_objs)
            else:
                return Response({"error": "specialisms must be a list"}, status=400)

        employee.refresh_from_db()

        return Response({
            "employeeID": employee.id,
            "name": employee.name,
            "resourceBU": employee.resourceBU.name,
            "excludedFromAI": employee.excludedFromAI,
            "specialisms": list(employee.specialisms.values_list("name", flat=True)),
            "jobCodes": list(employee.jobCodes.values_list("code", flat=True))
        })


    elif request.method == 'DELETE':
        if slug is None:
            return Response({"error": "Slug is required"}, status=400)

        try:
            employee = Employee.objects.get(slug=slug)
            employee.delete()
            return Response({"message": "Employee deleted successfully"})
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=404)


@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def get_jobcodes(request, code=None):
    if request.method == 'POST' and code is None:
        """Create a new jobcode"""
        try:
            data = request.data
            
            # Handle employees separately
            employees = data.pop('employees', [])
            
            # Create the jobcode
            jobcode = JobCode.objects.create(**data)
            
            # Add employees if provided
            if employees:
                jobcode.employees.set(employees)
            
            # Return the created jobcode data
            response_data = {
                "code": jobcode.code,
                "description": jobcode.description,
                "customerName": jobcode.customerName,
                "businessUnit": jobcode.businessUnit,
                "jobOrigin": jobcode.jobOrigin,
                "budgetTime": jobcode.budgetTime,
                "budgetCost": float(jobcode.budgetCost),
                "startDate": jobcode.startDate,
                "endDate": jobcode.endDate,
                "employees": list(jobcode.employees.values("id", "name")),
                "status": jobcode.status,
            }
            return Response(response_data, status=201)
        except Exception as err:
            return Response({"error": str(err)}, status=400)
    
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
            "jobOrigin": jobcode.jobOrigin,
            "budgetTime": jobcode.budgetTime,
            "budgetCost": float(jobcode.budgetCost),
            "startDate": jobcode.startDate,
            "endDate": jobcode.endDate,
            "employees": employees,
            "status": jobcode.status,
        }
        return Response(data)
    
    elif request.method == 'DELETE' and code is not None:
        try:
            jobcode = JobCode.objects.get(code=code)
        except JobCode.DoesNotExist:
            return Response({"error": "Jobcode not found"}, status=status.HTTP_404_NOT_FOUND)

        
        jobcode.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

        
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
        jobcodes = JobCode.objects.all()
        serializer = JobCodeSerializer(jobcodes, many=True)
        return Response(serializer.data)

@api_view(['GET', 'PATCH', 'DELETE'])
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
                    "description": a.forecast.description,
                    "date": a.forecast.date,
                    "daysAllocated": float(a.daysAllocated),
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
                    "daysAllocated": float(a.daysAllocated),
                })
            data.append({
                "forecastID": f.forecastID,
                "jobCode": f.jobCode.code,
                "description": f.description,
                "date": f.date,
                "allocations": allocs,
            })
        return Response(data)

    # Single forecast by forecastID
    # Support PATCH to update forecast and allocation
    if forecastID is not None and request.method == 'PATCH':
        try:
            f = Forecast.objects.select_related('jobCode').get(forecastID=forecastID)
        except Forecast.DoesNotExist:
            return Response({"error": "Forecast not found"}, status=404)

        data = request.data or {}
        job_code = data.get('jobCode')
        date = data.get('date')
        description = data.get('description')
        employee_id = data.get('employeeID')
        days_allocated = data.get('daysAllocated')

        # Update jobCode if provided
        if job_code:
            try:
                jc = JobCode.objects.get(code=job_code)
                f.jobCode = jc
            except JobCode.DoesNotExist:
                return Response({"error": f"JobCode '{job_code}' not found"}, status=404)

        # Update date/description if provided
        if date:
            f.date = date
        if description is not None:
            f.description = description

        f.save()

        # Update allocation for a specific employee if provided
        if employee_id is not None and days_allocated is not None:
            try:
                emp = Employee.objects.get(id=employee_id)
            except Employee.DoesNotExist:
                return Response({"error": f"Employee with ID {employee_id} not found"}, status=404)

            allocation, _ = ForecastAllocation.objects.update_or_create(
                forecast=f,
                employee=emp,
                defaults={"daysAllocated": days_allocated},
            )

            return Response({
                "forecastID": f.forecastID,
                "jobCode": f.jobCode.code,
                "description": f.description,
                "date": f.date,
                "daysAllocated": float(allocation.daysAllocated),
                "employeeID": emp.id,
                "employeeName": emp.name,
            })

        # If no allocation update, return full forecast with allocations
        allocs = []
        for a in f.allocations.select_related('employee').all():
            allocs.append({
                "employeeID": a.employee.id,
                "employeeName": a.employee.name,
                "daysAllocated": float(a.daysAllocated),
            })

        return Response({
            "forecastID": f.forecastID,
            "jobCode": f.jobCode.code,
            "description": f.description,
            "date": f.date,
            "allocations": allocs,
        })

    # GET single forecast
    try:
        f = Forecast.objects.select_related('jobCode').get(forecastID=forecastID)
    except Forecast.DoesNotExist:
        return Response({"error": "Forecast not found"}, status=404)

    allocations = []
    for a in f.allocations.select_related('employee').all():
        allocations.append({
            "employeeID": a.employee.id,
            "employeeName": a.employee.name,
            "daysAllocated": float(a.daysAllocated),
        })

    data = {
        "forecastID": f.forecastID,
        "jobCode": f.jobCode.code,
        "description": f.description,
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


@api_view(['POST'])
def create_forecast(request):
    """
    Create a new forecast and allocation for an employee.
    Expected JSON:
    {
        "forecastID": "unique-id",
        "jobCode": "JOB_CODE",
        "date": "YYYY-MM-DD",
        "description": "optional description",
        "employeeID": 1,
        "daysAllocated": 5.0
    }
    """
    try:
        forecast_id = request.data.get('forecastID')
        job_code = request.data.get('jobCode')
        date = request.data.get('date')
        description = request.data.get('description', '')
        employee_id = request.data.get('employeeID')
        days_allocated = request.data.get('daysAllocated')
        
        # Validation
        if not all([forecast_id, job_code, date, employee_id, days_allocated]):
            return Response({"error": "Missing required fields"}, status=400)
        
        # Get or validate JobCode
        try:
            jobcode = JobCode.objects.get(code=job_code)
        except JobCode.DoesNotExist:
            return Response({"error": f"JobCode '{job_code}' not found"}, status=404)
        
        # Get or validate Employee
        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return Response({"error": f"Employee with ID {employee_id} not found"}, status=404)
        
        # Create or get Forecast
        forecast, created = Forecast.objects.get_or_create(
            forecastID=forecast_id,
            defaults={
                'jobCode': jobcode,
                'date': date,
                'description': description
            }
        )
        
        # If forecast already exists, update it
        if not created:
            forecast.jobCode = jobcode
            forecast.date = date
            forecast.description = description
            forecast.save()
        
        # Create or update ForecastAllocation
        allocation, alloc_created = ForecastAllocation.objects.update_or_create(
            forecast=forecast,
            employee=employee,
            defaults={'daysAllocated': days_allocated}
        )
        
        return Response({
            "forecastID": forecast.forecastID,
            "jobCode": forecast.jobCode.code,
            "customer": forecast.jobCode.customerName,
            "date": forecast.date,
            "description": forecast.description,
            "daysAllocated": float(allocation.daysAllocated),
            "employeeID": employee.id,
            "employeeName": employee.name,
        }, status=201)
        
    except Exception as e:
        return Response({"error": str(e)}, status=400)