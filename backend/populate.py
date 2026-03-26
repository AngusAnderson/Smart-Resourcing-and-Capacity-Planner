import os
import django
from datetime import date

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "api.settings")
django.setup()

from comwrap.models import (
    Employee,
    Specialism,
    JobCode,
    Forecast,
    ForecastAllocation,
    ResourceBusinessUnit,
    ReplyEntity,
)

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
    {"name": "Alice Johnson", "excluded": False, "specialisms": ["Backend Developer"]},
    {"name": "Bob Dylan", "excluded": False, "specialisms": ["Frontend Developer", "Edge Delivery Services"]},
    {"name": "Clara Martinez", "excluded": False, "specialisms": ["Backend Developer", "Edge Delivery Services"]},
    {"name": "David Lee", "excluded": False, "specialisms": ["Frontend Developer"]},
    {"name": "Emma Brown", "excluded": False, "specialisms": ["Backend Developer", "Frontend Developer"]},
    {"name": "Finn Grahams", "excluded": True, "specialisms": ["Edge Delivery Services"]},
    {"name": "Grace Patel", "excluded": False, "specialisms": ["Frontend Developer", "Backend Developer", "Edge Delivery Services"]},
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
    {
        "code": "CWP-UX-26-1-1",
        "description": "UX Redesign Initiative",
        "customer": "Comwrap Reply",
        "unit": "Design",
        "start": date(2026, 1, 12),
        "end": date(2026, 4, 30),
        "budget_time": 160,
        "budget_cost": 40000,
        "job_origin": "A",
        "status": "O",
    },
    {
        "code": "RPL-MIG-26-2-1",
        "description": "Cloud Migration Phase 2",
        "customer": "Reply Group",
        "unit": "Infrastructure",
        "start": date(2026, 2, 1),
        "end": date(2026, 6, 30),
        "budget_time": 250,
        "budget_cost": 75000,
        "job_origin": "A",
        "status": "O",
    },
    {
        "code": "CWP-INT-26-3-1",
        "description": "CMS Integration Project",
        "customer": "Retail Client GmbH",
        "unit": "Content",
        "start": date(2026, 3, 1),
        "end": date(2026, 7, 31),
        "budget_time": 180,
        "budget_cost": 55000,
        "job_origin": "B",
        "status": "O",
    },
    {
        "code": "RPL-ANA-26-4-1",
        "description": "Analytics Dashboard Build",
        "customer": "Reply UK",
        "unit": "Data",
        "start": date(2026, 4, 1),
        "end": date(2026, 9, 30),
        "budget_time": 300,
        "budget_cost": 90000,
        "job_origin": "A",
        "status": "O",
    },
]

FORECASTS = [
    {
        "forecastID": "F001",
        "employee": "Nathan Hutchison",
        "jobcode": "C341-CWPUK-28-7-4",
        "date": date(2025, 11, 20),
        "days": 7.5,
    },
    {
        "forecastID": "F002",
        "employee": "Jane Smith",
        "jobcode": "C341-CWPUK-28-7-4",
        "date": date(2025, 12, 1),
        "days": 5.0,
    },
    {
        "forecastID": "F003",
        "employee": "John Doe",
        "jobcode": "RPL-IT-15-3-1",
        "date": date(2025, 12, 5),
        "days": 4.0,
    },
    {
        "forecastID": "F004",
        "employee": "Alice Johnson",
        "jobcode": "C341-CWPUK-28-7-4",
        "date": date(2025, 12, 10),
        "days": 6.0,
    },
    {
        "forecastID": "F005",
        "employee": "Bob Dylan",
        "jobcode": "RPL-IT-15-3-1",
        "date": date(2025, 12, 15),
        "days": 3.5,
    },
    {
        "forecastID": "F006",
        "employee": "Clara Martinez",
        "jobcode": "C341-CWPUK-28-7-4",
        "date": date(2026, 1, 5),
        "days": 8.0,
    },
    {
        "forecastID": "F007",
        "employee": "David Lee",
        "jobcode": "RPL-IT-15-3-1",
        "date": date(2025, 12, 20),
        "days": 5.5,
    },
    {
        "forecastID": "F008",
        "employee": "Emma Brown",
        "jobcode": "C341-CWPUK-28-7-4",
        "date": date(2026, 1, 12),
        "days": 4.5,
    },
    {
        "forecastID": "F009",
        "employee": "Grace Patel",
        "jobcode": "C341-CWPUK-28-7-4",
        "date": date(2026, 1, 19),
        "days": 7.0,
    },
    {
        "forecastID": "F010",
        "employee": "Nathan Hutchison",
        "jobcode": "RPL-IT-15-3-1",
        "date": date(2025, 12, 8),
        "days": 3.0,
    },
    {
        "forecastID": "F011",
        "employee": "Grace Patel",
        "jobcode": "RPL-IT-15-3-1",
        "date": date(2025, 12, 22),
        "days": 5.0,
    },
    {
        "forecastID": "F012",
        "employee": "Emma Brown",
        "jobcode": "RPL-IT-15-3-1",
        "date": date(2026, 1, 7),
        "days": 6.5,
    },
    {
        "forecastID": "F013",
        "employee": "David Lee",
        "jobcode": "CWP-UX-26-1-1",
        "date": date(2026, 1, 19),
        "days": 5.0,
    },
    {
        "forecastID": "F014",
        "employee": "Alice Johnson",
        "jobcode": "CWP-UX-26-1-1",
        "date": date(2026, 2, 2),
        "days": 7.0,
    },
    {
        "forecastID": "F015",
        "employee": "Nathan Hutchison",
        "jobcode": "CWP-UX-26-1-1",
        "date": date(2026, 2, 16),
        "days": 6.0,
    },
    {
        "forecastID": "F016",
        "employee": "Clara Martinez",
        "jobcode": "RPL-MIG-26-2-1",
        "date": date(2026, 2, 9),
        "days": 8.0,
    },
    {
        "forecastID": "F017",
        "employee": "John Doe",
        "jobcode": "RPL-MIG-26-2-1",
        "date": date(2026, 3, 2),
        "days": 5.5,
    },
    {
        "forecastID": "F018",
        "employee": "Grace Patel",
        "jobcode": "RPL-MIG-26-2-1",
        "date": date(2026, 3, 16),
        "days": 4.0,
    },
    {
        "forecastID": "F019",
        "employee": "Bob Dylan",
        "jobcode": "CWP-INT-26-3-1",
        "date": date(2026, 3, 9),
        "days": 6.5,
    },
    {
        "forecastID": "F020",
        "employee": "Emma Brown",
        "jobcode": "CWP-INT-26-3-1",
        "date": date(2026, 4, 6),
        "days": 7.5,
    },
    {
        "forecastID": "F021",
        "employee": "David Lee",
        "jobcode": "CWP-INT-26-3-1",
        "date": date(2026, 4, 20),
        "days": 5.0,
    },
    {
        "forecastID": "F022",
        "employee": "Alice Johnson",
        "jobcode": "RPL-ANA-26-4-1",
        "date": date(2026, 4, 13),
        "days": 8.0,
    },
    {
        "forecastID": "F023",
        "employee": "Nathan Hutchison",
        "jobcode": "RPL-ANA-26-4-1",
        "date": date(2026, 5, 4),
        "days": 6.0,
    },
    {
        "forecastID": "F024",
        "employee": "Clara Martinez",
        "jobcode": "RPL-ANA-26-4-1",
        "date": date(2026, 5, 18),
        "days": 7.0,
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
        forecast_obj, _ = Forecast.objects.get_or_create(
            forecastID=f["forecastID"],
            defaults={
                "jobCode": jobcode_map[f["jobcode"]],
                "date": f["date"],
            },
        )
        ForecastAllocation.objects.get_or_create(
            forecast=forecast_obj,
            employee=employee_map[f["employee"]],
            defaults={"daysAllocated": f["days"]},
        )

def populate():
    print("Clearing data...")
    ForecastAllocation.objects.all().delete()
    Forecast.objects.all().delete()
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
