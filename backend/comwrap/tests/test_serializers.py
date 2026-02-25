from datetime import date
from django.test import TestCase

from comwrap.models import Employee, Specialism, JobCode
from comwrap.serializers import EmployeeSerializer, JobCodeSerializer


class EmployeeSerializerTests(TestCase):
    def setUp(self):
        self.specialism = Specialism.objects.create(name="Frontend")
        self.employee = Employee.objects.create(name="Alice", excludedFromAI=False)
        self.employee.specialisms.add(self.specialism)

    def test_employee_serializer_returns_expected_fields(self):
        serializer = EmployeeSerializer(self.employee)
        data = serializer.data

        self.assertEqual(set(data.keys()), {"id", "name"})
        self.assertEqual(data["name"], "Alice")


class JobCodeSerializerTests(TestCase):
    def setUp(self):
        self.specialism = Specialism.objects.create(name="Backend")
        self.employee1 = Employee.objects.create(name="Bob", excludedFromAI=False)
        self.employee2 = Employee.objects.create(name="Carol", excludedFromAI=True)
        self.employee1.specialisms.add(self.specialism)
        self.employee2.specialisms.add(self.specialism)

        self.jobcode_data = {
            "code": "JOB-100",
            "description": "Serializer Test Job",
            "customerName": "Customer Z",
            "businessUnit": "Tech",
            "budgetTime": 40,
            "budgetCost": "1500.00",
            "startDate": date(2026, 2, 1),
            "endDate": date(2026, 2, 28),
            "employees": [self.employee1.id, self.employee2.id],
        }

    def test_jobcode_serializer_accepts_valid_data(self):
        serializer = JobCodeSerializer(data=self.jobcode_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_jobcode_serializer_creates_jobcode_with_employees(self):
        serializer = JobCodeSerializer(data=self.jobcode_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        jobcode = serializer.save()

        self.assertEqual(jobcode.code, "JOB-100")
        self.assertEqual(jobcode.employees.count(), 2)
        self.assertSetEqual(
            set(jobcode.employees.values_list("id", flat=True)),
            {self.employee1.id, self.employee2.id},
        )

    def test_jobcode_serializer_rejects_invalid_employee_id(self):
        invalid_data = {**self.jobcode_data, "employees": [999999]}

        serializer = JobCodeSerializer(data=invalid_data)

        self.assertFalse(serializer.is_valid())
        self.assertIn("employees", serializer.errors)

    def test_jobcode_serializer_updates_employees(self):
        jobcode = JobCode.objects.create(
            code="JOB-200",
            description="Existing Job",
            customerName="Customer Y",
            businessUnit="Ops",
            budgetTime=20,
            budgetCost=500.00,
            startDate=date(2026, 3, 1),
            endDate=date(2026, 3, 31),
        )
        jobcode.employees.add(self.employee1)

        update_data = {
            "employees": [self.employee2.id]
        }

        serializer = JobCodeSerializer(jobcode, data=update_data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        updated = serializer.save()

        self.assertSetEqual(
            set(updated.employees.values_list("id", flat=True)),
            {self.employee2.id},
        )
