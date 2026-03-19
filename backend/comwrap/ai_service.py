import json

from .ai_tools import AI_TOOL_DEFINITIONS, AIToolError, execute_ai_tool
WRITE_TOOL_NAMES = {
    "update_jobcode_dates",
    "update_jobcode_status",
    "assign_employee_to_jobcode",
}

CONFIRMATION_REQUIRED_TOOLS = {
    "update_jobcode_dates",
    "update_jobcode_status",
    "assign_employee_to_jobcode",
}
SYSTEM_INSTRUCTIONS = """
You are an assistant for a manager scheduling app.

Rules:
- Only use the provided tools to read or change data.
- If a request requires a capability with no tool (example: timesheets), say it is not supported yet.
- Never pretend to fetch, load, display, or retrieve data unless a tool actually returned it.
- Do not narrate fake progress (e.g. "loading...", "retrieving...", "finalizing...").
- If information is missing or ambiguous, ask a short clarifying question.
- Be concise, but for detail requests include all important fields returned by the tool.
- When returning project or employee details, include the key fields explicitly (code/name, description, customer, status, start date, end date, assigned employees if available).
- When listing forecasts, include date, forecast ID, and employee allocations.
- For questions about who works on a project, use list_employees_for_jobcode with the exact project code.
- Function call arguments must be strict JSON matching the tool schema. Do not use prose or code fences.


"""
def _read(obj, key, default=None):
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def _latest_user_text(messages):
    for msg in reversed(messages or []):
        if msg.get("role") == "user":
            return (msg.get("content") or "").strip().lower()
    return ""

def _make_confirmation_message(call_name, call_arguments):
    return f"I can perform '{call_name}'. Type 'confirm' to proceed or 'cancel' to abort."

def _get_function_calls(response):
    output = _read(response, "output", None)
    if not isinstance(output, (list, tuple)):
        return []

    return [item for item in output if _read(item, "type") == "function_call"]


def _looks_like_filler(text):
    if not text:
        return False
    t = text.lower()
    markers = ["the end", "done", "final", "stopping", "goodbye"]
    hits = sum(t.count(m) for m in markers)
    return len(t) > 1200 and hits > 15

def _extract_reply_text(response):
    text = _read(response, "output_text", None)
    if isinstance(text, str) and text.strip():
        return text.strip()

    output = _read(response, "output", []) or []
    if not isinstance(output, (list, tuple)):
        output = [output]

    parts = []
    for item in output:
        item_type = _read(item, "type")

        
        if item_type in {"output_text", "text"}:
            direct = _read(item, "text", "") or _read(item, "value", "")
            if isinstance(direct, dict):
                direct = direct.get("value") or direct.get("text") or ""
            elif not isinstance(direct, str):
                direct = _read(direct, "value", "") or _read(direct, "text", "")
            if direct:
                parts.append(direct)
            continue

        
        if item_type not in {"message", "output_message"}:
            continue

        content_items = _read(item, "content", []) or []
        if not isinstance(content_items, (list, tuple)):
            content_items = [content_items]

        for content in content_items:
            ctype = _read(content, "type")
            if ctype not in {"output_text", "text"}:
                continue

            value = _read(content, "text", None)
            if value is None:
                value = _read(content, "value", "")

            if isinstance(value, dict):
                value = value.get("value") or value.get("text") or ""
            elif not isinstance(value, str):
                value = _read(value, "value", "") or _read(value, "text", "")

            if value:
                parts.append(value)

    return "\n".join(p.strip() for p in parts if isinstance(p, str) and p.strip()).strip()

def _format_tool_result_fallback(results):
    if not results:
        return ""
    for result in results:
        if not isinstance(result, dict):
            continue

        tool = result.get("tool")
    result = results[0]
    

    

    if tool == "get_jobcode_details" and result.get("ok"):
        job = result.get("jobcode", {})
        employees = job.get("employees", [])
        employee_names = ", ".join(e.get("name", "") for e in employees if e.get("name")) or "None"

        return (
            f"Project details for {job.get('code', 'unknown')}:\n"
            f"- Description: {job.get('description', '')}\n"
            f"- Customer: {job.get('customerName', '')}\n"
            f"- Business unit: {job.get('businessUnit', '')}\n"
            f"- Status: {job.get('status', '')}\n"
            f"- Start date: {job.get('startDate', '')}\n"
            f"- End date: {job.get('endDate', '')}\n"
            f"- Employees: {employee_names}"
        )

    if tool == "list_employees_for_jobcode" and result.get("ok"):
        job = result.get("jobcode", {})
        employees = result.get("employees", [])
        if not employees:
            return f"No employees are assigned to {job.get('code', 'this project')}."

        lines = [f"Employees assigned to {job.get('code', 'project')}:"]

        for e in employees:
            lines.append(f"- {e.get('name', 'Unknown')} (ID: {e.get('id', 'N/A')})")
        return "\n".join(lines)

    if tool == "search_jobcodes" and result.get("ok"):
        matches = result.get("results", [])
        if not matches:
            return "No matching projects were found."
        lines = ["Matching projects:"]
        for m in matches[:10]:
            lines.append(f"- {m.get('code', '')}: {m.get('description', '')}")
        return "\n".join(lines)

    return ""


def run_ai_chat(messages, *, client, pending_action=None):
    """
    Chat entry point with tool-calling support.
    Returns the same shape expected by the frontend: {"reply": "..."}.
    """
    data_changed = False
    latest_user = _latest_user_text(messages)
    if "timesheet" in latest_user or "timesheets" in latest_user:
        return {
            "reply": "I can't access timesheets yet.. I can currently help with projects, employees, forecasts, project dates, status changes, and employee assignment.",
            "dataChanged": False,
        }
    


    if pending_action:
            if latest_user == "cancel":
                return {
                    "reply": "Cancelled the pending action.",
                    "dataChanged": False,
                    "clearPendingAction": True,
                }

            if latest_user == "confirm":
                tool_name = pending_action["tool"]
                tool_args = pending_action["arguments"]
                try:
                    result = execute_ai_tool(tool_name, tool_args)
                    if tool_name in WRITE_TOOL_NAMES and result.get("ok"):
                        data_changed = True
                    reply = "Done. The requested change has been applied." if result.get("ok") else result.get("error", "Action failed.")
                except AIToolError as exc:
                    reply = str(exc)
                except Exception:
                    reply = "Internal tool error"

                return {
                    "reply": reply,
                    "dataChanged": data_changed,
                    "clearPendingAction": True,
                }

            return {
                "reply": "You have a pending action. Type 'confirm' to run it or 'cancel' to discard it.",
                "dataChanged": False,
                "requiresConfirmation": True,
            }

    response = client.responses.create(
        model="gpt-5",
        input=messages,
        tools=AI_TOOL_DEFINITIONS,
        instructions=SYSTEM_INSTRUCTIONS,
        max_output_tokens=900,
        reasoning={"effort": "low"},
    )


    
    last_tool_results = []

    for _ in range(3):
        function_calls = _get_function_calls(response)
        if not function_calls:
            
            if hasattr(response, "model_dump"):
                print("DEBUG response dump:", response.model_dump())

            reply = _extract_reply_text(response)
            if not reply:
                reply = _format_tool_result_fallback(last_tool_results)


            if _looks_like_filler(reply):
                reply = "I could not complete that request with the tools currently available. Please rephrase, or ask for a supported action (projects, employees, forecasts, dates, status, assignment)."
            if not reply:
                reply = "I couldn't produce a readable answer for that request. Please try rephrasing or use the exact project code."
            
            return {"reply": reply, "dataChanged": data_changed}
        
           



        tool_outputs = []
        for call in function_calls:
            # call_name = _read(call, "name")
            pending_args = _read(call, "arguments")
            if isinstance(pending_args, str):
                try:
                    pending_args = json.loads(pending_args)
                except json.JSONDecodeError:
                    return {
                        "reply": "I understood the request, but I generated invalid tool parameters. Please try again (for example: 'Assign employee 2 to project C341-CWPUK-28-7-4').",
                        "dataChanged": False,
                    }
                
            if call.name in CONFIRMATION_REQUIRED_TOOLS:
                return {
                    "reply": _make_confirmation_message(call.name, pending_args),
                    "dataChanged": False,
                    "requiresConfirmation": True,
                    "pendingAction": {
                        "tool": call.name,
                        "arguments": pending_args,
                    },
                }

            try:
                result = execute_ai_tool(call.name, pending_args)
                last_tool_results.append(result)

                if call.name in WRITE_TOOL_NAMES and result.get("ok"):
                    data_changed = True

            except AIToolError as exc:
                result = {"ok": False, "error": str(exc), "tool": call.name}
            except Exception:
                result = {"ok": False, "error": "Internal tool error", "tool": call.name}

            tool_outputs.append({
                "type": "function_call_output",
                "call_id": call.call_id,
                "output": json.dumps(result),
            })
        
        response = client.responses.create(
            model="gpt-5",
            previous_response_id=response.id,
            input=tool_outputs,
            instructions=SYSTEM_INSTRUCTIONS,
            max_output_tokens=900,
            reasoning={"effort": "low"},
        )


    return {
    "reply": "I could not complete that request automatically. Please try again.",
    "dataChanged": data_changed,
}

