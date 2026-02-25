import json
from datetime import date

from .models import JobCode, Employee, Forecast


class AIToolError(ValueError):
    """Raised when tool arguments are invalid or the tool cannot run."""

def get_ai_tool_definitions():
    return AI_TOOL_DEFINITIONS

AI_TOOL_DEFINITIONS = [
        {
        "type": "function",
        "name": "search_jobcodes",
        "description": "Search projects/job codes by code, description, or customer name.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search text"}
            },
            "required": ["query"],
            "additionalProperties": False,
        },
    },
    {
        "type": "function",
        "name": "get_jobcode_details",
        "description": "Get full details for a project/job code by exact code.",
        "parameters": {
            "type": "object",
            "properties": {
                "code": {"type": "string", "description": "Exact job code"}
            },
            "required": ["code"],
            "additionalProperties": False,
        },
    },


    {
        "type": "function",
        "name": "update_jobcode_dates",
        "description": (
            "Update a project/job code start and end date. "
            "Use only when the user explicitly asks to change project dates."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "Exact project/job code, e.g. JOB-001",
                },
                "startDate": {
                    "type": "string",
                    "description": "New start date in YYYY-MM-DD format",
                },
                "endDate": {
                    "type": "string",
                    "description": "New end date in YYYY-MM-DD format",
                },
            },
            "required": ["code", "startDate", "endDate"],
            "additionalProperties": False,
        },
        


        },
        {
        "type": "function",
        "name": "search_employees",
        "description": "Search employees by name.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Employee name search text"}
            },
            "required": ["query"],
            "additionalProperties": False,
        },
    },
    {
        "type": "function",
        "name": "get_employee_details",
        "description": "Get employee details by exact employee ID.",
        "parameters": {
            "type": "object",
            "properties": {
                "employeeID": {"type": "integer", "description": "Exact employee ID"}
            },
            "required": ["employeeID"],
            "additionalProperties": False,
        },
    },
    {
        "type": "function",
        "name": "list_forecasts_for_jobcode",
        "description": "List forecasts and allocations for a project/job code.",
        "parameters": {
            "type": "object",
            "properties": {
                "code": {"type": "string", "description": "Exact job code"}
            },
            "required": ["code"],
            "additionalProperties": False,
        },
    },
    {
        "type": "function",
        "name": "update_jobcode_status",
        "description": "Update job status for a job code. Allowed values: O (open), B (blocked), C (closed).",
        "parameters": {
            "type": "object",
            "properties": {
                "code": {"type": "string", "description": "Exact job code"},
                "status": {"type": "string", "description": "New status code: O, B, or C"}
            },
            "required": ["code", "status"],
            "additionalProperties": False,
        },
    },
    {
        "type": "function",
        "name": "assign_employee_to_jobcode",
        "description": "Assign an employee to a project/job code.",
        "parameters": {
            "type": "object",
            "properties": {
                "code": {"type": "string", "description": "Exact job code"},
                "employeeID": {"type": "integer", "description": "Exact employee ID"}
            },
            "required": ["code", "employeeID"],
            "additionalProperties": False,
        },
    },

]


def _parse_tool_arguments(arguments):
    if isinstance(arguments, str):
        try:
            arguments = json.loads(arguments)
        except json.JSONDecodeError as exc:
            raise AIToolError("Tool arguments must be valid JSON.") from exc

    if not isinstance(arguments, dict):
        raise AIToolError("Tool arguments must be a JSON object.")

    return arguments


def _parse_iso_date(value, field_name):
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError) as exc:
        raise AIToolError(f"{field_name} must be a valid date in YYYY-MM-DD format.") from exc


def update_jobcode_dates(arguments):
    """
    Update JobCode.startDate and JobCode.endDate.
    Accepts dict or JSON string arguments.
    """
    data = _parse_tool_arguments(arguments)

    code = data.get("code")
    if not code:
        raise AIToolError("code is required.")

    start_date = _parse_iso_date(data.get("startDate"), "startDate")
    end_date = _parse_iso_date(data.get("endDate"), "endDate")

    if start_date > end_date:
        raise AIToolError("startDate cannot be after endDate.")

    try:
        jobcode = JobCode.objects.get(code=code)
    except JobCode.DoesNotExist as exc:
        raise AIToolError(f"JobCode '{code}' not found.") from exc

    old_start = jobcode.startDate
    old_end = jobcode.endDate

    jobcode.startDate = start_date
    jobcode.endDate = end_date
    jobcode.save(update_fields=["startDate", "endDate"])

    return {
        "ok": True,
        "tool": "update_jobcode_dates",
        "jobcode": {
            "code": jobcode.code,
            "description": jobcode.description,
            "startDate": jobcode.startDate.isoformat(),
            "endDate": jobcode.endDate.isoformat(),
        },
        "changes": {
            "startDate": {"from": old_start.isoformat(), "to": start_date.isoformat()},
            "endDate": {"from": old_end.isoformat(), "to": end_date.isoformat()},
        },
    }





def execute_ai_tool(name, arguments):
    executor = TOOL_EXECUTORS.get(name)
    if executor is None:
        raise AIToolError(f"Unknown tool '{name}'.")
    return executor(arguments)

def search_jobcodes(arguments):
    data = _parse_tool_arguments(arguments)
    query = (data.get("query") or "").strip()

    if not query:
        raise AIToolError("query is required.")

    matches = JobCode.objects.filter(
        code__icontains=query
    ) | JobCode.objects.filter(
        description__icontains=query
    ) | JobCode.objects.filter(
        customerName__icontains=query
    )

    results = []
    for jobcode in matches.distinct()[:10]:
        results.append({
            "code": jobcode.code,
            "description": jobcode.description,
            "customerName": jobcode.customerName,
            "startDate": jobcode.startDate.isoformat(),
            "endDate": jobcode.endDate.isoformat(),
        })

    return {
        "ok": True,
        "tool": "search_jobcodes",
        "count": len(results),
        "results": results,
    }
def get_jobcode_details(arguments):
    data = _parse_tool_arguments(arguments)
    code = (data.get("code") or "").strip()

    if not code:
        raise AIToolError("code is required.")

    try:
        jobcode = JobCode.objects.get(code=code)
    except JobCode.DoesNotExist as exc:
        raise AIToolError(f"JobCode '{code}' not found.") from exc

    return {
        "ok": True,
        "tool": "get_jobcode_details",
        "jobcode": {
            "code": jobcode.code,
            "description": jobcode.description,
            "customerName": jobcode.customerName,
            "businessUnit": jobcode.businessUnit,
            "startDate": jobcode.startDate.isoformat(),
            "endDate": jobcode.endDate.isoformat(),
            "budgetTime": jobcode.budgetTime,
            "budgetCost": float(jobcode.budgetCost),
            "status": jobcode.status,
            "employees": list(jobcode.employees.values("id", "name")),
        },
    }
def search_employees(arguments):
    data = _parse_tool_arguments(arguments)
    query = (data.get("query") or "").strip()

    if not query:
        raise AIToolError("query is required.")

    employees = Employee.objects.filter(name__icontains=query).prefetch_related("specialisms", "jobCodes").distinct()[:10]

    results = []
    for employee in employees:
        results.append({
            "employeeID": employee.id,
            "name": employee.name,
            "excludedFromAI": employee.excludedFromAI,
            "specialisms": list(employee.specialisms.values_list("name", flat=True)),
            "jobCodes": list(employee.jobCodes.values_list("code", flat=True)),
        })

    return {
        "ok": True,
        "tool": "search_employees",
        "count": len(results),
        "results": results,
    }


def get_employee_details(arguments):
    data = _parse_tool_arguments(arguments)
    employee_id = data.get("employeeID")

    if employee_id is None:
        raise AIToolError("employeeID is required.")

    try:
        employee = Employee.objects.prefetch_related("specialisms", "jobCodes").get(id=employee_id)
    except Employee.DoesNotExist as exc:
        raise AIToolError(f"Employee with ID {employee_id} not found.") from exc

    return {
        "ok": True,
        "tool": "get_employee_details",
        "employee": {
            "employeeID": employee.id,
            "name": employee.name,
            "excludedFromAI": employee.excludedFromAI,
            "resourceBU": employee.resourceBU.name,
            "specialisms": list(employee.specialisms.values_list("name", flat=True)),
            "jobCodes": list(employee.jobCodes.values_list("code", flat=True)),
        },
    }


def list_forecasts_for_jobcode(arguments):
    data = _parse_tool_arguments(arguments)
    code = (data.get("code") or "").strip()

    if not code:
        raise AIToolError("code is required.")

    try:
        jobcode = JobCode.objects.get(code=code)
    except JobCode.DoesNotExist as exc:
        raise AIToolError(f"JobCode '{code}' not found.") from exc

    forecasts = Forecast.objects.filter(jobCode=jobcode).prefetch_related("allocations__employee").order_by("date")

    results = []
    for forecast in forecasts:
        results.append({
            "forecastID": forecast.forecastID,
            "date": forecast.date.isoformat(),
            "description": forecast.description or "",
            "allocations": [
                {
                    "employeeID": alloc.employee.id,
                    "employeeName": alloc.employee.name,
                    "daysAllocated": float(alloc.daysAllocated),
                }
                for alloc in forecast.allocations.all()
            ],
        })

    return {
        "ok": True,
        "tool": "list_forecasts_for_jobcode",
        "jobcode": {"code": jobcode.code, "description": jobcode.description},
        "count": len(results),
        "forecasts": results,
    }


def update_jobcode_status(arguments):
    data = _parse_tool_arguments(arguments)
    code = (data.get("code") or "").strip()
    status = (data.get("status") or "").strip().upper()

    if not code:
        raise AIToolError("code is required.")
    if status not in {"O", "B", "C"}:
        raise AIToolError("status must be one of: O, B, C.")

    try:
        jobcode = JobCode.objects.get(code=code)
    except JobCode.DoesNotExist as exc:
        raise AIToolError(f"JobCode '{code}' not found.") from exc

    old_status = jobcode.status
    jobcode.status = status
    jobcode.save(update_fields=["status"])

    return {
        "ok": True,
        "tool": "update_jobcode_status",
        "jobcode": {
            "code": jobcode.code,
            "description": jobcode.description,
            "status": jobcode.status,
        },
        "changes": {
            "status": {"from": old_status, "to": status}
        },
    }


def assign_employee_to_jobcode(arguments):
    data = _parse_tool_arguments(arguments)
    code = (data.get("code") or "").strip()
    employee_id = data.get("employeeID")

    if not code:
        raise AIToolError("code is required.")
    if employee_id is None:
        raise AIToolError("employeeID is required.")

    try:
        jobcode = JobCode.objects.get(code=code)
    except JobCode.DoesNotExist as exc:
        raise AIToolError(f"JobCode '{code}' not found.") from exc

    try:
        employee = Employee.objects.get(id=employee_id)
    except Employee.DoesNotExist as exc:
        raise AIToolError(f"Employee with ID {employee_id} not found.") from exc

    already_assigned = jobcode.employees.filter(id=employee.id).exists()
    jobcode.employees.add(employee)
    jobcode.refresh_from_db()

    return {
        "ok": True,
        "tool": "assign_employee_to_jobcode",
        "alreadyAssigned": already_assigned,
        "jobcode": {
            "code": jobcode.code,
            "description": jobcode.description,
            "employees": list(jobcode.employees.values("id", "name")),
        },
        "employee": {
            "employeeID": employee.id,
            "name": employee.name,
        },
    }

TOOL_EXECUTORS = {
    "search_jobcodes": search_jobcodes,
    "get_jobcode_details": get_jobcode_details,
    "update_jobcode_dates": update_jobcode_dates,
    "search_employees": search_employees,
    "get_employee_details": get_employee_details,
    "list_forecasts_for_jobcode": list_forecasts_for_jobcode,
    "update_jobcode_status": update_jobcode_status,
    "assign_employee_to_jobcode": assign_employee_to_jobcode,
}



