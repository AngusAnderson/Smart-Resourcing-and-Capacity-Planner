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

"""

def _latest_user_text(messages):
    for msg in reversed(messages or []):
        if msg.get("role") == "user":
            return (msg.get("content") or "").strip().lower()
    return ""

def _make_confirmation_message(call_name, call_arguments):
    return f"I can perform '{call_name}'. Type 'confirm' to proceed or 'cancel' to abort."

def _get_function_calls(response):
    output = getattr(response, "output", None)
    if not isinstance(output, list):
        return []
    return [item for item in output if getattr(item, "type", None) == "function_call"]

def _looks_like_filler(text):
    if not text:
        return False
    t = text.lower()
    markers = ["the end", "done", "final", "stopping", "goodbye"]
    hits = sum(t.count(m) for m in markers)
    return len(t) > 1200 and hits > 15

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
        max_output_tokens=300,
    )


    

    for _ in range(3):
        function_calls = _get_function_calls(response)
        if not function_calls:
            reply = response.output_text or ""
            if _looks_like_filler(reply):
                reply = "I could not complete that request with the tools currently available. Please rephrase, or ask for a supported action (projects, employees, forecasts, dates, status, assignment)."
            return {"reply": reply, "dataChanged": data_changed}



        tool_outputs = []
        for call in function_calls:
            pending_args = call.arguments
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
            max_output_tokens=300,
        )


    return {
    "reply": "I could not complete that request automatically. Please try again.",
    "dataChanged": data_changed,
}

