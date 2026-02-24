from datetime import date
from django.test import TestCase
from django.db import IntegrityError

from comwrap.models import (Employee,Specialism,JobCode,Forecast,ForecastAllocation,)



class SpecialismModelTests(TestCase):
    def test_specialism_str_returns_name(self):
        specialism = Specialism.objects.create(name="Frontend Developer")
        self.assertEqual(str(specialism), "Frontend Developer")

    def test_specialism_name_must_be_unique(self):
        Specialism.objects.create(name="Backend Developer")
        with self.assertRaises(IntegrityError):
            Specialism.objects.create(name="Backend Developer")


class EmployeeModelTests(TestCase):
    def test_employee_slug_is_generated_from_name(self):
        employee = Employee.objects.create(
            name="John Doe",
            excludedFromAI=False,
        )
        self.assertEqual(employee.slug, "john-doe")

    def test_employee_slug_is_preserved_if_set(self):
        employee = Employee.objects.create(
            name="Jane Doe",
            excludedFromAI=False,
            slug="custom-slug",
        )
        self.assertEqual(employee.slug, "custom-slug")

    def test_employee_str_includes_name_and_specialisms(self):
        s1 = Specialism.objects.create(name="Frontend Developer")
        s2 = Specialism.objects.create(name="Backend Developer")

        employee = Employee.objects.create(
            name="Alex Smith",
            excludedFromAI=False,
        )
        employee.specialisms.add(s1, s2)

        result = str(employee)
        self.assertIn("Alex Smith", result)
        self.assertIn("Frontend Developer", result)
        self.assertIn("Backend Developer", result)

    def test_employee_name_must_be_unique(self):
        Employee.objects.create(name="Unique Name", excludedFromAI=False)
        with self.assertRaises(IntegrityError):
            Employee.objects.create(name="Unique Name", excludedFromAI=True)


class JobCodeModelTests(TestCase):
    def test_jobcode_str_format(self):
        jobcode = JobCode.objects.create(
            code="ABC-123",
            description="Test Project",
            customerName="Customer Ltd",
            businessUnit="Engineering",
            budgetTime=100,
            budgetCost=1000.00,
            startDate=date(2026, 1, 1),
            endDate=date(2026, 1, 31),
        )
        self.assertEqual(str(jobcode), "ABC-123: Test Project")

    def test_jobcode_code_must_be_unique(self):
        JobCode.objects.create(
            code="UNIQUE-1",
            description="First",
            customerName="Customer A",
            businessUnit="Unit A",
            budgetTime=10,
            budgetCost=100.00,
            startDate=date(2026, 1, 1),
            endDate=date(2026, 1, 2),
        )

        with self.assertRaises(IntegrityError):
            JobCode.objects.create(
                code="UNIQUE-1",
                description="Second",
                customerName="Customer B",
                businessUnit="Unit B",
                budgetTime=20,
                budgetCost=200.00,
                startDate=date(2026, 2, 1),
                endDate=date(2026, 2, 2),
            )


class ForecastModelTests(TestCase):
    def setUp(self):
        self.specialism = Specialism.objects.create(name="QA")
        self.employee = Employee.objects.create(name="Chris", excludedFromAI=False)
        self.employee.specialisms.add(self.specialism)

        self.jobcode = JobCode.objects.create(
            code="JOB-001",
            description="Forecast Test Job",
            customerName="Customer X",
            businessUnit="Operations",
            budgetTime=80,
            budgetCost=5000.00,
            startDate=date(2026, 1, 1),
            endDate=date(2026, 1, 31),
        )

    def test_forecast_str_format(self):
        forecast = Forecast.objects.create(
            forecastID="F-001",
            jobCode=self.jobcode,
            date=date(2026, 1, 15),
            description="Test forecast",
        )

        result = str(forecast)
        self.assertIn("JOB-001", result)
        self.assertIn("F-001", result)
        self.assertIn("2026-01-15", result)

    def test_forecast_id_must_be_unique(self):
        Forecast.objects.create(
            forecastID="F-UNIQUE",
            jobCode=self.jobcode,
            date=date(2026, 1, 10),
        )

        with self.assertRaises(IntegrityError):
            Forecast.objects.create(
                forecastID="F-UNIQUE",
                jobCode=self.jobcode,
                date=date(2026, 1, 11),
            )


class ForecastAllocationModelTests(TestCase):
    def setUp(self):
        self.specialism = Specialism.objects.create(name="QA")
        self.employee = Employee.objects.create(name="Chris", excludedFromAI=False)
        self.employee.specialisms.add(self.specialism)

        self.jobcode = JobCode.objects.create(
            code="JOB-002",
            description="Allocation Test Job",
            customerName="Customer Y",
            businessUnit="Operations",
            budgetTime=80,
            budgetCost=5000.00,
            startDate=date(2026, 1, 1),
            endDate=date(2026, 1, 31),
        )

        self.forecast = Forecast.objects.create(
            forecastID="F-100",
            jobCode=self.jobcode,
            date=date(2026, 1, 20),
        )

    def test_forecast_allocation_str_format(self):
        allocation = ForecastAllocation.objects.create(
            forecast=self.forecast,
            employee=self.employee,
            daysAllocated=2.5,
        )

        result = str(allocation)
        self.assertIn("Chris", result)
        self.assertIn("F-100", result)
        self.assertIn("2.5", result)

    def test_forecast_allocation_unique_per_forecast_employee(self):
        ForecastAllocation.objects.create(
            forecast=self.forecast,
            employee=self.employee,
            daysAllocated=1.0,
        )

        with self.assertRaises(IntegrityError):
            ForecastAllocation.objects.create(
                forecast=self.forecast,
                employee=self.employee,
                daysAllocated=3.0,
            )
