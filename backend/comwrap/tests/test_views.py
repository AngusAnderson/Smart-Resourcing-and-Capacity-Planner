from datetime import date
from rest_framework.test import APITestCase

from comwrap.models import Specialism, Employee, JobCode, Forecast, ForecastAllocation


class BaseViewTestData(APITestCase):
    def setUp(self):
        self.specialism = Specialism.objects.create(name="Backend")

        self.employee = Employee.objects.create(
            name="Alice",
            excludedFromAI=False,
        )
        self.employee.specialisms.add(self.specialism)

        self.jobcode = JobCode.objects.create(
            code="JOB-001",
            description="Test Job",
            customerName="Customer X",
            businessUnit="Engineering",
            budgetTime=10,
            budgetCost=1000.00,
            startDate=date(2026, 2, 1),
            endDate=date(2026, 2, 28),
        )
        self.jobcode.employees.add(self.employee)

        self.forecast = Forecast.objects.create(
            forecastID="F-001",
            jobCode=self.jobcode,
            date=date(2026, 2, 10),
            description="Forecast item",
        )

        self.allocation = ForecastAllocation.objects.create(
            forecast=self.forecast,
            employee=self.employee,
            daysAllocated=2.5,
        )


class BasicViewsTests(BaseViewTestData):
    def test_hello_world_returns_message(self):
        response = self.client.get("/api/hello/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["message"], "Hello from Django!")

    def test_get_specialisms_returns_list(self):
        response = self.client.get("/api/specialisms/")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)
        self.assertEqual(response.data[0]["name"], "Backend")

    def test_get_employees_list_returns_employee(self):
        response = self.client.get("/api/employees/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Alice")
        self.assertIn("specialisms", response.data[0])
        self.assertIn("allocatedDaysPerMonth", response.data[0])

    def test_get_employee_by_slug_returns_employee(self):
        response = self.client.get(f"/api/employees/{self.employee.slug}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Alice")

    def test_patch_employee_allocated_days_per_month_persists(self):
        payload = {"allocatedDaysPerMonth": {"2026-03": 10.5, "2026-04": 8}}

        response = self.client.patch(
            f"/api/employees/{self.employee.slug}/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["allocatedDaysPerMonth"], payload["allocatedDaysPerMonth"])

        self.employee.refresh_from_db()
        self.assertEqual(self.employee.allocatedDaysPerMonth, payload["allocatedDaysPerMonth"])

    def test_get_employee_by_slug_returns_404_when_missing(self):
        response = self.client.get("/api/employees/not-found/")
        self.assertEqual(response.status_code, 404)
