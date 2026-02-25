from types import SimpleNamespace
from unittest.mock import Mock, patch
from rest_framework.test import APITestCase
from django.urls import reverse


class AIChatTests(APITestCase):
    def setUp(self):
        self.url = reverse("ai-chat")

    def test_ai_chat_requires_messages(self):
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.data)

    @patch("comwrap.views.client.responses.create")
    def test_ai_chat_returns_reply_for_valid_messages(self, mock_create):
        mock_create.return_value = Mock(output_text="Hello back", output=[])


        payload = {
            "messages": [
                {"role": "user", "content": "Hi"}
            ]
        }
        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["reply"], "Hello back")
        self.assertEqual(response.data["dataChanged"], False)

        mock_create.assert_called_once()

    
    @patch("comwrap.views.client.responses.create")
    def test_ai_chat_write_tool_requires_confirmation_and_stores_pending_action(self, mock_create):
        first_response = Mock(
            id="resp_1",
            output_text="",
            output=[
                SimpleNamespace(
                    type="function_call",
                    name="update_jobcode_dates",
                    arguments='{"code":"C341-CWPUK-28-7-4","startDate":"2026-03-01","endDate":"2026-03-31"}',
                    call_id="call_1",
                )
            ],
        )
        mock_create.return_value = first_response

        payload = {"messages": [{"role": "user", "content": "Change project dates"}]}
        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["dataChanged"], False)
        self.assertEqual(response.data["requiresConfirmation"], True)
        self.assertIn("confirm", response.data["reply"].lower())

        session = self.client.session
        self.assertIn("ai_pending_action", session)
        self.assertEqual(session["ai_pending_action"]["tool"], "update_jobcode_dates")

        
        mock_create.assert_called_once()

    @patch("comwrap.ai_service.execute_ai_tool")
    @patch("comwrap.views.client.responses.create")
    def test_ai_chat_confirm_executes_pending_action_and_clears_session(self, mock_create, mock_execute_tool):
        
        session = self.client.session
        session["ai_pending_action"] = {
            "tool": "update_jobcode_dates",
            "arguments": '{"code":"C341-CWPUK-28-7-4","startDate":"2026-03-01","endDate":"2026-03-31"}',
        }
        session.save()

        mock_execute_tool.return_value = {
            "ok": True,
            "tool": "update_jobcode_dates",
        }

        payload = {"messages": [{"role": "user", "content": "confirm"}]}
        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["dataChanged"], True)
        self.assertIn("done", response.data["reply"].lower())

        session = self.client.session
        self.assertNotIn("ai_pending_action", session)

        
        mock_create.assert_not_called()
        mock_execute_tool.assert_called_once()


        
