import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/Employee_list.css";


function toSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function EmployeeList(){
    const [employees, setEmployees] = useState([]);
    const [specialisms, setSpecialisms] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        specialisms: [],
        excludedFromAI: false,
    });

    const canCreate = useMemo(() => formData.name.trim().length > 0, [formData.name]);
    const [search, setSearch] = useState("");
    const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;

    return employees.filter((e) => {
      const name = String(e?.name || "").toLowerCase();
      const specs = Array.isArray(e?.specialisms) ? e.specialisms.join(" ").toLowerCase() : "";
      return name.includes(q) || specs.includes(q);
    });
  }, [employees, search]);


    useEffect(() => {
        fetchEmployees();
        fetchSpecialisms();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await api.get("/employees/");
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

    const fetchSpecialisms = async () => {
        try {
          const res = await api.get("/specialisms/");
          setSpecialisms(res.data || []);
        } catch (err) {
          console.warn("Failed to load specialisms:", err);
        }
    };
    

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        if (!canCreate) return;

        try{
            await api.post("/employees/", {
                name: formData.name.trim(),
                specialisms: formData.specialisms,
                excludedFromAI: formData.excludedFromAI,
            });
            setFormData({
                name: "",
                specialisms: [],
                excludedFromAI: false,
            });
            setShowCreateForm(false);
            await fetchEmployees();
        } catch (err) {
            console.error("Error creating employee:", err);
            setError("Failed to create employee.");
        }
    }; 

    // const handleDeleteEmployee = async (employeeID) => {
    //     if (!window.confirm("Are you sure you want to delete this employee?")) {
    //         return;
    //     }
    //     try {
    //         await api.delete(`/employees/${employeeID}`);
    //         fetchEmployees();
    //     } catch (err) {
    //         console.error("Error deleting employee:", err);
    //         setError("Failed to delete employee.");
    //     }
    // };

    // const handleViewEmployee = (slug) => {
    //     navigate(`/employee/${slug}`);
    // };

    const handleDeleteEmployee = async (employee) => {
      const slug = toSlug(employee?.name);
      if (!slug) return;

      if (!window.confirm(`Delete ${employee.name}?`)) return;

      try {
        await api.delete(`/employees/${slug}/`);
        await fetchEmployees();
        setError(null);
      } catch (err) {
        console.error("Error deleting employee:", err);
        setError("Failed to delete employee");
      }
   };

    // <button
    //     className="btn-secondary"
    //     onClick={() => handleViewEmployee(employee.employeeID, employeee.slug)}
    // >
    //     View Employee
    // </button>

    const handleViewEmployee = (employee) => {
      const slug = toSlug(employee?.name);
      if (!slug) return;
      navigate(`/employees/${slug}`);
    };

    if (loading) {
        return <div className="employee-list-page"><p>Loading employees...</p></div>;
    }

    if (error) {
        return <div className="employee-list-page"><p className="error">{error}</p></div>;
    }

    return (
        <div className="employee-list-page">

          <div className="list-top-bar">
            <button
              className="btn-primary"
              onClick={() => navigate("/")}
            >
              Back To Calendar Page
            </button>
          </div>

            <div className="list-header">
                <h1>Employees</h1>
                <button className="btn-primary" onClick={() => setShowCreateForm((v) => !v)}>
                  {showCreateForm ? "Cancel" : "Add Employee"}
                </button>
            </div>

            <div className="employee-search-row">
              <input
                className="employee-search-input"
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Specialisms</label>
              <select
                multiple
                value={formData.specialisms}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                  setFormData((prev) => ({ ...prev, specialisms: values }));
                }}
              >
                {specialisms.map((s) => (
                  <option key={s.id ?? s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <small style={{ opacity: 0.8 }}>
                Hold Ctrl (Windows) or Cmd (Mac) to select multiple.
              </small>
            </div>

            {/* <div className="form-group">
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
            </div> */}

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.excludedFromAI}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, excludedFromAI: e.target.checked }))
                  }
                />{" "}
                Excluded From AI
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={!canCreate}>
              Create Employee
            </button>
          </form>
        </div>
      )}

      {/* {employees.length === 0 ? (
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
                > */}


      {filteredEmployees.length === 0 ? (
        <div className="empty-state">No employees found</div>
      ) : (
        <div className="employees-grid">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.employeeID ?? employee.id ?? employee.name}
              className="employee-card"
            >
              <div className="card-content">
                <h2>{employee.name}</h2>
                <p className="specialisms">
                  {(employee.specialisms || []).join(", ") || "No specialisms"}
                </p>
                <p className="ai-status">
                  Excluded from AI: {employee.excludedFromAI ? "Yes" : "No"}
                </p>
              </div>
              <div className="card-actions">
                <button className="btn-secondary" onClick={() => handleViewEmployee(employee)}>
                  View
                </button>
                <button className="btn-danger" onClick={() => handleDeleteEmployee(employee)}>
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