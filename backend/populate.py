import os
import django
from datetime import date

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "api.settings")
django.setup()

from comwrap.models import Employee, Specialism, JobCode, ForecastEntry

SPECIALISMS = [
    "Frontend Developer",
    "Backend Developer",
    "Edge Delivery Services",
]

EMPLOYEES = [
    {"name": "Nathan Hutchison", "excluded": False, "specialisms": ["Frontend Developer", "Backend Developer", "Edge Delivery Services"]},
    {"name": "John Doe", "excluded": False, "specialisms": ["Frontend Developer", "Backend Developer"]},
    {"name": "Jane Smith", "excluded": True, "specialisms": ["Frontend Developer", "Edge Delivery Services"]},
]

JOBCODES = [
    {
        "code": "C341-CWPUK-28-7-4",
        "description": "Comwrap Website Project",
        "customer": "Comwrap Reply",
        "unit": "Content",
        "start": date(2025, 10, 1),
        "end": date(2026, 2, 4),
        "budget_time": 200,
        "budget_cost": 50000,
    },
    {
        "code": "RPL-IT-15-3-1",
        "description": "Internal Automation Improvement",
        "customer": "Reply Italy",
        "unit": "IT Services",
        "start": date(2025, 11, 15),
        "end": date(2026, 1, 10),
        "budget_time": 120,
        "budget_cost": 30000,
    },
]

FORECASTS = [
    {
        "forecastID": "F001",
        "employee": "Nathan Hutchison",
        "jobcode": "C341-CWPUK-28-7-4",
        "date": date(2025, 11, 20),
        "hours": 7.5,
    },
    {
        "forecastID": "F002",
        "employee": "Jane Smith",
        "jobcode": "C341-CWPUK-28-7-4",
        "date": date(2025, 12, 1),
        "hours": 5.0,
    },
    {
        "forecastID": "F003",
        "employee": "John Doe",
        "jobcode": "RPL-IT-15-3-1",
        "date": date(2025, 12, 5),
        "hours": 4.0,
    },
]

def create_employees(specialism_map):
    employees = {}
    for e in EMPLOYEES:
        employee, _ = Employee.objects.get_or_create(name=e["name"], excludedFromAI=e["excluded"])
        employee.specialisms.set([specialism_map[s] for s in e["specialisms"]])
        employee.save()
        employees[e["name"]] = employee
    return employees

def create_specialisms():
    specs = {}
    for s in SPECIALISMS:
        spec, _ = Specialism.objects.get_or_create(name=s)
        specs[s] = spec
    return specs

def create_jobcodes():
    jobcodes = {}
    for j in JOBCODES:
        jobcode, _ = JobCode.objects.get_or_create(
            code=j["code"],
            description=j["description"],
            customerName=j["customer"],
            businessUnit=j["unit"],
            startDate=j["start"],
            endDate=j["end"],
            budgetTime=j["budget_time"],
            budgetCost=j["budget_cost"]
        )
        jobcodes[j["code"]] = jobcode
    return jobcodes

def create_forecasts(employee_map, jobcode_map):
    for f in FORECASTS:
        ForecastEntry.objects.get_or_create(
            forecastID=f["forecastID"],
            employee=employee_map[f["employee"]],
            jobCode=jobcode_map[f["jobcode"]],
            date=f["date"],
            hoursAllocated=f["hours"]
        )

def populate():
    print("Clearing data...")
    ForecastEntry.objects.all().delete()
    JobCode.objects.all().delete()
    Employee.objects.all().delete()
    Specialism.objects.all().delete()

    print("Creating specialisms...")
    specialisms = create_specialisms()

    print("Creating employees...")
    employees = create_employees(specialisms)

    print("Creating jobcodes...")
    jobcodes = create_jobcodes()

    print("Creating forecasts...")
    create_forecasts(employees, jobcodes)

    print("Database populated successfully!")

if __name__ == "__main__":
    populate()
