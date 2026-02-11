import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/Employee_Project.css";

const mockProject = {
  id: 1,
  name: "Project A",
  customerName: "Comwrap Reply",
  businessUnit: "Department Name",
  description:
    "Project description goes here.",
  startDate: "5/10/25",
  finishDate: "9/10/25",
  durationDays: 18,
  remainingBudgetDays: 12,
  budget: 50000,
  confidenceScore: 0.8
};

function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await api.get("/employees/");
        console.log("Fetched employees:", res.data);
        setAllEmployees(res.data);
      } catch (err) {
        console.error("Failed to load employees", err);
      }
    }
    fetchEmployees();
  }, []);

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        const res = await api.get(`/jobcodes/${id}/`);
        console.log('Fetched project data:', res.data); // Debug log
        
        // Map backend data to frontend structure
        const projectData = {
          id: res.data.code,
          name: res.data.code, // or res.data.description if you prefer
          customerName: res.data.customerName,
          businessUnit: res.data.businessUnit,
          description: res.data.description,
          startDate: res.data.startDate,
          finishDate: res.data.endDate,
          durationDays: calculateDuration(res.data.startDate, res.data.endDate),
          remainingBudgetDays: res.data.budgetTime,
          budget: res.data.budgetCost,
          confidenceScore: 0.8, // This might need to come from backend later
          employees: Array.isArray(res.data.employees) ? res.data.employees : []
        };
        
        setProject(projectData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load project", err);
        setError(err.message);
        setLoading(false);
      }
    }
    fetchProject();
  }, [id]);

  // Helper function to calculate duration in days
  function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  const handleSave = async () => {
    try {
      const updatedData = {
        employees: selectedEmployees,
        description: project.description,
        startDate: project.startDate,
        endDate: project.finishDate
      };

      console.log("Employee IDs being sent:", selectedEmployees);

      const res = await api.patch(`/jobcodes/${id}/`, updatedData);

      if (res.status === 200 && res.data.employees) {
        setProject(prev => ({
          ...prev,
          employees: res.data.employees
        }));
        setIsEditing(false);
      } else {
        console.error("Failed to save project changes");
      }
    } catch (err) {
      console.error("Error saving project changes", err);
    }
  };

  if (loading) return <div className="detail-page">Loading project...</div>;
  if (error) return <div className="detail-page">Error: {error}</div>;
  if (!project) return null;

  console.log("PROJECT EMPLOYEES:", project?.employees);

  return (
    <div className="detail-page">
      <div className="detail-top-row">
        <button className="back-button" onClick={() => navigate("/")}>
          Back to Calendar Page
        </button>
      </div>

      <div className="project-layout">
        <main className="project-main">
          <div className="project-header-row">
            <h1 className="project-title">{project.name}</h1>
            <button className="pill-button"
              onClick={() => {
                const ids = Array.isArray(project.employees)
                  ? project.employees.map(e => e.id).filter(Boolean)
                  : [];
                setSelectedEmployees(ids);
                setIsEditing(true);
              }}
            >
              Edit
            </button>
          </div>

          <div className="project-body-card">
            {isEditing ? (
              <div className="edit-section">
                <h3>Edit Project</h3>

                <label>Assign Employees:</label>
                {allEmployees.length > 0 ? (
                  <select
                    multiple
                    value={selectedEmployees.map(id => id.toString())}
                    onChange={(e) => 
                      setSelectedEmployees(
                        Array.from(e.target.selectedOptions, option => Number(option.value))
                      )
                    }
                  >
                    {allEmployees.map((emp) => (
                      <option key={emp.employeeID || emp.id} value={(emp.employeeID || emp.id).toString()}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p>Loading employees...</p>
                )}

                <div className="edit-buttons">
                  <button onClick={handleSave}>Save</button>
                  <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
              <p className="label-line">
                <span className="label">Customer Name:</span>{" "}
                <span>{project.customerName}</span>
              </p>
              <p className="label-line">
                <span className="label">Business Unit:</span>{" "}
                <span>{project.businessUnit}</span>
              </p>

              <h2 className="section-title">Description:</h2>
              <div className="description-box">
                <p>{project.description}</p>
              </div>

              <div className="assigned-employees">
                <strong>Assigned Employees:</strong>{" "}
                {project.employees && project.employees.length > 0
                  ? project.employees.map(emp => emp.name).join(", ")
                  :"None"}
              </div>
            </div>
          )}
        </div>
        </main>

        <aside className="project-side">
          <div className="side-card">
            <h2 className="side-heading">Time</h2>
            <p className="label-line">
              <span className="label">Start Date:</span>{" "}
              <span>{project.startDate}</span>
            </p>
            <p className="label-line">
              <span className="label">Finish Date:</span>{" "}
              <span>{project.finishDate}</span>
            </p>
            <p className="label-line">
              <span className="label">Duration (Days):</span>{" "}
              <span>{project.durationDays}</span>
            </p>
            <p className="label-line">
              <span className="label">Remaining Budget (Days):</span>{" "}
              <span>{project.remainingBudgetDays}</span>
            </p>
          </div>

          <div className="side-card">
            <h2 className="side-heading">Finance</h2>
            <p className="label-line">
              <span className="label">Budget (Cost Currency):</span>{" "}
              <span>{project.budget}</span>
            </p>
          </div>

          <div className="side-card">
            <h2 className="side-heading">Confidence Score:</h2>
            <p className="confidence-value">{project.confidenceScore}</p>
          </div>

          <button className="pill-button side-edit-button">Edit</button>
        </aside>
      </div>
    </div>
  );
}

export default ProjectPage;
