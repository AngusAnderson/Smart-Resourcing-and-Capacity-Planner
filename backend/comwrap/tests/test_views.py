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

class JobCodeTests(BaseViewTestData):
    """Test suite for JobCode create, read, update, delete operations"""

    def test_create_jobcode_with_valid_data(self):
        """Test creating a new jobcode with valid data"""
        jobcode_data = {
            "code": "JOB-002",
            "description": "New Project",
            "customerName": "Customer Y",
            "businessUnit": "Finance",
            "jobOrigin": "B",
            "budgetTime": 20,
            "budgetCost": 2500.00,
            "startDate": date(2026, 3, 1),
            "endDate": date(2026, 3, 31),
        }
        
        response = self.client.post("/api/jobcodes/", jobcode_data, format="json")
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["code"], "JOB-002")
        self.assertEqual(response.data["description"], "New Project")
        self.assertEqual(response.data["customerName"], "Customer Y")
        self.assertEqual(response.data["budgetTime"], 20)
        
        self.assertTrue(JobCode.objects.filter(code="JOB-002").exists())

    def test_create_jobcode_with_employees(self):
        """Test creating a jobcode with employees assigned"""
        employee2 = Employee.objects.create(name="Bob", excludedFromAI=False)
        
        jobcode_data = {
            "code": "JOB-003",
            "description": "Team Project",
            "customerName": "Customer Z",
            "businessUnit": "Engineering",
            "jobOrigin": "A",
            "budgetTime": 15,
            "budgetCost": 1500.00,
            "startDate": date(2026, 3, 1),
            "endDate": date(2026, 3, 31),
            "employees": [self.employee.id, employee2.id],
        }
        
        response = self.client.post("/api/jobcodes/", jobcode_data, format="json")
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(response.data["employees"]), 2)
        
        jobcode = JobCode.objects.get(code="JOB-003")
        self.assertEqual(jobcode.employees.count(), 2)

    def test_create_jobcode_missing_required_field(self):
        """Test creating a jobcode without required fields fails"""
        jobcode_data = {
            "code": "JOB-004",
            "description": "Incomplete Project",
        }
        
        response = self.client.post("/api/jobcodes/", jobcode_data, format="json")
        
        self.assertNotEqual(response.status_code, 201)

    def test_create_duplicate_jobcode_code(self):
        """Test creating a jobcode with duplicate code fails"""
        jobcode_data = {
            "code": "JOB-001", 
            "description": "Duplicate",
            "customerName": "Customer",
            "businessUnit": "Engineering",
            "budgetTime": 10,
            "budgetCost": 1000.00,
            "startDate": date(2026, 3, 1),
            "endDate": date(2026, 3, 31),
        }
        
        response = self.client.post("/api/jobcodes/", jobcode_data, format="json")
        
        self.assertEqual(response.status_code, 400)
        
    def test_read_jobcode_by_code(self):
        """Test retrieving a jobcode by its code"""
        response = self.client.get("/api/jobcodes/JOB-001/")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["code"], "JOB-001")
        self.assertEqual(response.data["description"], "Test Job")
        self.assertEqual(response.data["customerName"], "Customer X")
        self.assertEqual(len(response.data["employees"]), 1)

    def test_read_jobcode_not_found(self):
        """Test retrieving a non-existent jobcode returns 404"""
        response = self.client.get("/api/jobcodes/INVALID-CODE/")
        
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "Jobcode not found")

    def test_read_jobcode_includes_all_fields(self):
        """Test that retrieved jobcode includes all expected fields"""
        response = self.client.get("/api/jobcodes/JOB-001/")
        
        self.assertEqual(response.status_code, 200)
        expected_fields = {
            "code", "description", "customerName", "businessUnit", 
            "jobOrigin", "budgetTime", "budgetCost", "startDate", 
            "endDate", "employees", "status"
        }
        for field in expected_fields:
            self.assertIn(field, response.data)

    def test_update_jobcode_description(self):
        """Test updating a jobcode's description"""
        update_data = {"description": "Updated description"}
        
        response = self.client.patch("/api/jobcodes/JOB-001/", update_data, format="json")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["description"], "Updated description")
        
        jobcode = JobCode.objects.get(code="JOB-001")
        self.assertEqual(jobcode.description, "Updated description")

    def test_update_jobcode_multiple_fields(self):
        """Test updating multiple fields of a jobcode"""
        update_data = {
            "description": "New description",
            "customerName": "New Customer",
            "budgetTime": 30,
            "budgetCost": "5000.00",
        }
        
        response = self.client.patch("/api/jobcodes/JOB-001/", update_data, format="json")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["description"], "New description")
        self.assertEqual(response.data["customerName"], "New Customer")
        self.assertEqual(response.data["budgetTime"], 30)
        self.assertEqual(float(response.data["budgetCost"]), 5000.00)

    def test_update_jobcode_employees(self):
        """Test updating the employees assigned to a jobcode"""
        employee2 = Employee.objects.create(name="Charlie", excludedFromAI=False)
        employee3 = Employee.objects.create(name="Diana", excludedFromAI=False)
        
        update_data = {
            "employees": [employee2.id, employee3.id],
        }
        
        response = self.client.patch("/api/jobcodes/JOB-001/", update_data, format="json")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["employees"]), 2)
      
        jobcode = JobCode.objects.get(code="JOB-001")
        employee_ids = list(jobcode.employees.values_list("id", flat=True))
        self.assertIn(employee2.id, employee_ids)
        self.assertIn(employee3.id, employee_ids)

    def test_update_jobcode_status(self):
        """Test updating a jobcode's status"""
        update_data = {"status": "B"}

        response = self.client.patch("/api/jobcodes/JOB-001/", update_data, format="json")

        self.assertEqual(response.status_code, 200)

        jobcode = JobCode.objects.get(code="JOB-001")
        self.assertEqual(jobcode.status, "B")

    def test_update_nonexistent_jobcode(self):
        """Test updating a non-existent jobcode returns 404"""
        update_data = {"description": "Updated"}
        
        response = self.client.patch("/api/jobcodes/INVALID/", update_data, format="json")
        
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "Jobcode not found")

    def test_update_jobcode_with_put(self):
        """Test using PUT method to update a jobcode"""
        update_data = {
            "code": "JOB-001",
            "description": "PUT updated",
            "customerName": "Customer X",
            "businessUnit": "Engineering",
            "budgetTime": 10,
            "budgetCost": 1000.00,
            "startDate": date(2026, 2, 1),
            "endDate": date(2026, 2, 28),
        }
        
        response = self.client.put("/api/jobcodes/JOB-001/", update_data, format="json")
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["description"], "PUT updated")

    def test_delete_jobcode(self):
        """Test deleting a jobcode"""
        self.assertTrue(JobCode.objects.filter(code="JOB-001").exists())
        
        response = self.client.delete("/api/jobcodes/JOB-001/")
        
        self.assertEqual(response.status_code, 204)
        
        self.assertFalse(JobCode.objects.filter(code="JOB-001").exists())

    def test_delete_nonexistent_jobcode(self):
        """Test deleting a non-existent jobcode returns 404"""
        response = self.client.delete("/api/jobcodes/INVALID-CODE/")
        
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["error"], "Jobcode not found")

    def test_delete_jobcode_removes_employee_associations(self):
        """Test that deleting a jobcode removes employee associations"""
        employee_id = self.employee.id
        
        self.assertTrue(self.jobcode.employees.filter(id=employee_id).exists())
        
        response = self.client.delete("/api/jobcodes/JOB-001/")
        
        self.assertEqual(response.status_code, 204)
        
        self.assertFalse(JobCode.objects.filter(code="JOB-001").exists())
        
        self.assertTrue(Employee.objects.filter(id=employee_id).exists())