from datetime import date

from django.test import TestCase

from comwrap.ai_tools import AIToolError, execute_ai_tool
from comwrap.models import JobCode


class AIToolExecutionTests(TestCase):
    def setUp(self):
        self.jobcode = JobCode.objects.create(
            code="JOB-123",
            description="AI Test Project",
            customerName="Customer X",
            businessUnit="Engineering",
            budgetTime=10,
            budgetCost=1000.00,
            startDate=date(2026, 2, 1),
            endDate=date(2026, 2, 28),
        )

    def test_update_jobcode_dates_updates_project(self):
        result = execute_ai_tool(
            "update_jobcode_dates",
            {
                "code": "JOB-123",
                "startDate": "2026-03-01",
                "endDate": "2026-03-15",
            },
        )

        self.jobcode.refresh_from_db()

        self.assertTrue(result["ok"])
        self.assertEqual(result["tool"], "update_jobcode_dates")
        self.assertEqual(self.jobcode.startDate.isoformat(), "2026-03-01")
        self.assertEqual(self.jobcode.endDate.isoformat(), "2026-03-15")
        self.assertEqual(result["jobcode"]["code"], "JOB-123")
        self.assertEqual(result["changes"]["startDate"]["from"], "2026-02-01")
        self.assertEqual(result["changes"]["endDate"]["to"], "2026-03-15")

    def test_update_jobcode_dates_rejects_invalid_date_order(self):
        with self.assertRaises(AIToolError) as ctx:
            execute_ai_tool(
                "update_jobcode_dates",
                {
                    "code": "JOB-123",
                    "startDate": "2026-04-01",
                    "endDate": "2026-03-01",
                },
            )

        self.assertIn("startDate cannot be after endDate", str(ctx.exception))

    def test_update_jobcode_dates_rejects_missing_jobcode(self):
        with self.assertRaises(AIToolError) as ctx:
            execute_ai_tool(
                "update_jobcode_dates",
                {
                    "code": "MISSING",
                    "startDate": "2026-03-01",
                    "endDate": "2026-03-15",
                },
            )

        self.assertIn("not found", str(ctx.exception))

    def test_update_jobcode_dates_rejects_invalid_date_format(self):
        with self.assertRaises(AIToolError) as ctx:
            execute_ai_tool(
                "update_jobcode_dates",
                {
                    "code": "JOB-123",
                    "startDate": "03/01/2026",
                    "endDate": "2026-03-15",
                },
            )

        self.assertIn("YYYY-MM-DD", str(ctx.exception))
    def test_search_jobcodes_returns_matches(self):
            result = execute_ai_tool(
                "search_jobcodes",
                {"query": "AI Test"}
            )

            self.assertTrue(result["ok"])
            self.assertEqual(result["tool"], "search_jobcodes")
            self.assertGreaterEqual(result["count"], 1)
            self.assertEqual(result["results"][0]["code"], "JOB-123")


    def test_get_jobcode_details_returns_project(self):
        result = execute_ai_tool(
            "get_jobcode_details",
            {"code": "JOB-123"}
        )

        self.assertTrue(result["ok"])
        self.assertEqual(result["tool"], "get_jobcode_details")
        self.assertEqual(result["jobcode"]["code"], "JOB-123")
        self.assertEqual(result["jobcode"]["description"], "AI Test Project")


    def test_get_jobcode_details_rejects_missing_jobcode(self):
        with self.assertRaises(AIToolError) as ctx:
            execute_ai_tool("get_jobcode_details", {"code": "NOPE"})

        self.assertIn("not found", str(ctx.exception))


    def test_search_jobcodes_rejects_empty_query(self):
        with self.assertRaises(AIToolError) as ctx:
            execute_ai_tool("search_jobcodes", {"query": ""})

        self.assertIn("query is required", str(ctx.exception))
