import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/EmployeeList.css";

function EmployeeList(){
    const [employees, setEmployees] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        specialisms: [],
        excludedFromAi: false,
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await api.get("/employees");
            setEmployees(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching employees:", err);
            setError("Failed to fetch employees.");
            setLoading(false);
        } finally{
            setLoading(false);
        }
    };

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        try{
            await api.post("/employees", {
                name: formData.name,
                specialisms: formData.specialisms,
                excludedFromAi: formData.excludedFromAi,
            });
            setFormData({
                name: "",
                specialisms: [],
                excludedFromAi: false,
            });
            setShowCreateForm(false);
            fetchEmployees();
        } catch (err) {
            console.error("Error creating employee:", err);
            setError("Failed to create employee.");
        }
    }; 

    const handleDeleteEmployee = async (employeeID) => {
        if (!window.confirm("Are you sure you want to delete this employee?")) {
            return;
        }
        try {
            await api.delete(`/employees/${employeeID}`);
            fetchEmployees();
        } catch (err) {
            console.error("Error deleting employee:", err);
            setError("Failed to delete employee.");
        }
    };

    const handleViewEmployee = (slug) => {
        navigate(`/employee/${slug}`);
    };

    <button
        className="btn-secondary"
        onClick={() => handleViewEmployee(employee.employeeID, employeee.slug)}
    >
        View Employee
    </button>

    if (loading) {
        return <div className="employee-list"><p>Loading employees...</p></div>;
    }

    if (error) {
        return <div className="employee-list"><p className="error">{error}</p></div>;
    }

    return (
        <div className="employee-list-page">
            <div className="list-header">
                <h1>Employees</h1>
                <button
                    className="btn-primary"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                {showCreateForm ? "Cancel" : "Add Employee"}
                </button>
            </div>

      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <div className="create-form-container">
          <form onSubmit={handleCreateEmployee} className="employee-form">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Excluded From AI</label>
              <input
                type="checkbox"
                checked={formData.excludedFromAI}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    excludedFromAI: e.target.checked,
                  })
                }
              />
            </div>

            <button type="submit" className="btn-primary">
              Create Employee
            </button>
          </form>
        </div>
      )}

      {employees.length === 0 ? (
        <div className="empty-state">No employees found</div>
      ) : (
        <div className="employees-grid">
          {employees.map((employee) => (
            <div key={employee.employeeID} className="employee-card">
              <div className="card-content">
                <h2>{employee.name}</h2>
                <p className="specialisms">
                  {employee.specialisms.join(", ")}
                </p>
                <p className="ai-status">
                  Excluded from AI: {employee.excludedFromAI ? "Yes" : "No"}
                </p>
              </div>
              <div className="card-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleViewEmployee(employee.name.toLowerCase().replace(/\s+/g, "-"))}
                >
                  View
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDeleteEmployee(employee.employeeID)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployeeList;