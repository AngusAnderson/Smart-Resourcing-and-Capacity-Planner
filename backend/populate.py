import os
import django
from datetime import date

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "api.settings")
django.setup()

from comwrap.models import Employee, Specialism, JobCode, ForecastEntry, ResourceBusinessUnit, ReplyEntity

RESOURCE_BUSINESS_UNIT = ["cwpuk_cwpuk"]
REPLY_ENTITY = ["Comwrap UK"]

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
        "job_origin": "A",
        "status": "O",
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
        "job_origin": "B",
        "status": "O",
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

def create_resource_business_unit():
    for bu_name in RESOURCE_BUSINESS_UNIT:
        resource_bu, _ = ResourceBusinessUnit.objects.get_or_create(name=bu_name)
    return resource_bu

def create_reply_entity():
    for entity_name in REPLY_ENTITY:
        reply_entity, _ = ReplyEntity.objects.get_or_create(name=entity_name)
    return reply_entity

def create_employees(specialism_map, resource_bu):
    employees = {}
    for e in EMPLOYEES:
        employee, _ = Employee.objects.get_or_create(
            name=e["name"],
            defaults={"excludedFromAI": e["excluded"], "resourceBU": resource_bu}
        )
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

def create_jobcodes(reply_entity):
    jobcodes = {}
    for j in JOBCODES:
        jobcode, _ = JobCode.objects.get_or_create(
            code=j["code"],
            defaults={
                "description": j["description"],
                "customerName": j["customer"],
                "businessUnit": j["unit"],
                "startDate": j["start"],
                "endDate": j["end"],
                "budgetTime": j["budget_time"],
                "budgetCost": j["budget_cost"],
                "replyEntity": reply_entity,
                "jobOrigin": j["job_origin"],
                "status": j["status"],
            }
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

    print("Creating ResourceBusinessUnit and ReplyEntity...")
    resource_bu, _ = ResourceBusinessUnit.objects.get_or_create(name=RESOURCE_BUSINESS_UNIT[0])
    reply_entity, _ = ReplyEntity.objects.get_or_create(name=REPLY_ENTITY[0])

    print("Creating specialisms...")
    specialisms = create_specialisms()

    print("Creating employees...")
    employees = create_employees(specialisms, resource_bu)

    print("Creating jobcodes...")
    jobcodes = create_jobcodes(reply_entity)

    print("Creating forecasts...")
    create_forecasts(employees, jobcodes)

    print("Database populated successfully!")

if __name__ == "__main__":
    populate()
