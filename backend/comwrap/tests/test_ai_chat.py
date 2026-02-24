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
        mock_create.return_value = Mock(output_text="Hello back")

        payload = {
            "messages": [
                {"role": "user", "content": "Hi"}
            ]
        }
        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["reply"], "Hello back")
        mock_create.assert_called_once()
