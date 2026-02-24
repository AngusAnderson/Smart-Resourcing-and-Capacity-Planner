import React, { useState, useEffect } from "react";
import api from "../services/api";
import "../css/CreateProjectModal.css";

function CreateProjectModal({ onClose, onProjectCreated }) {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    customerName: "",
    businessUnit: "",
    jobOrigin: "A",
    budgetTime: "",
    budgetCost: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    employees: [],
    status: "O",
  });
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const JOB_ORIGIN_OPTIONS = [
    { value: "A", label: "A - Order or eq." },
    { value: "B", label: "B - Formal Effort" },
    { value: "C", label: "C - Other effort" },
    { value: "D", label: "D - Forecast COGE" },
  ];

  const STATUS_OPTIONS = [
    { value: "O", label: "O - Open" },
    { value: "B", label: "B - Blocked" },
    { value: "C", label: "C - Closed" },
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees/");
      setAllEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to load employees", err);
      setError("Failed to load employees");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmployeeChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((option) =>
      parseInt(option.value)
    );
    setFormData((prev) => ({
      ...prev,
      employees: selectedOptions,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.code || !formData.description || !formData.customerName || !formData.businessUnit) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const dataToSubmit = {
        ...formData,
        budgetTime: parseInt(formData.budgetTime),
        budgetCost: parseFloat(formData.budgetCost),
      };

      const res = await api.post("/jobcodes/", dataToSubmit);

      if (res.status === 201) {
        onProjectCreated(res.data);
        setFormData({
          code: "",
          description: "",
          customerName: "",
          businessUnit: "",
          jobOrigin: "A",
          budgetTime: "",
          budgetCost: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          employees: [],
          status: "O",
        });
        onClose();
      }
    } catch (err) {
      console.error("Failed to create project", err);
      setError(
        err.response?.data?.error ||
          "Failed to create project - please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="forecast-form">
          <div className="form-group">
            <label htmlFor="code">Project Code *</label>
            <input
              id="code"
              name="code"
              type="text"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="Enter project code"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Project description"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerName">Customer Name *</label>
            <input
              id="customerName"
              name="customerName"
              type="text"
              value={formData.customerName}
              onChange={handleInputChange}
              placeholder="Enter customer name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessUnit">Business Unit *</label>
            <input
              id="businessUnit"
              name="businessUnit"
              type="text"
              value={formData.businessUnit}
              onChange={handleInputChange}
              placeholder="Enter business unit"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="jobOrigin">Job Origin</label>
            <select
              id="jobOrigin"
              name="jobOrigin"
              value={formData.jobOrigin}
              onChange={handleInputChange}
            >
              {JOB_ORIGIN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="budgetTime">Budget Time (days) *</label>
            <input
              id="budgetTime"
              name="budgetTime"
              type="number"
              step="0.5"
              value={formData.budgetTime}
              onChange={handleInputChange}
              placeholder="Enter budget days"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="budgetCost">Budget Cost *</label>
            <input
              id="budgetCost"
              name="budgetCost"
              type="number"
              step="0.01"
              value={formData.budgetCost}
              onChange={handleInputChange}
              placeholder="Enter budget cost"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date *</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="employees">Assign Employees</label>
            <select
              id="employees"
              name="employees"
              multiple
              value={formData.employees.map((id) => String(id))}
              onChange={handleEmployeeChange}
              size={5}
            >
              {allEmployees.map((employee) => (
                <option key={employee.employeeID} value={employee.employeeID}>
                  {employee.name}
                </option>
              ))}
            </select>
            <small>Hold Ctrl/Cmd to select multiple employees</small>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;
