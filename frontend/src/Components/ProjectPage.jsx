import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/Employee_Project.css";

function ProjectPage({ refreshKey }) {

  const { code } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [forecasts, setForecasts] = useState([]);
  const [forecastsLoading, setForecastsLoading] = useState(false);
  const [forecastsError, setForecastsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSidebar, setIsEditingSidebar] = useState(false);
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
        const res = await api.get(`/jobcodes/${encodeURIComponent(code)}/`);
        console.log("Fetched project data:", res.data);

        const projectData = {
          id: res.data.code,
          name: res.data.code,
          customerName: res.data.customerName,
          businessUnit: res.data.businessUnit,
          description: res.data.description,
          startDate: res.data.startDate,
          finishDate: res.data.endDate,
          durationDays: calculateDuration(res.data.startDate, res.data.endDate),
          remainingBudgetDays: res.data.budgetTime,
          budget: res.data.budgetCost,
          confidenceScore: 0.8, // placeholder until backend provides it
          employees: Array.isArray(res.data.employees)
            ? res.data.employees
            : []
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
  }, [code, refreshKey]);


  useEffect(() => {
    async function fetchProjectForecasts() {
      try {
        setForecastsLoading(true);
        setForecastsError(null);

        const res = await api.get("/forecasts/");
        const projectForecasts = Array.isArray(res.data)
          ? res.data.filter((forecast) => String(forecast.jobCode) === String(id))
          : [];

        const sortedForecasts = projectForecasts.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        setForecasts(sortedForecasts);
      } catch (err) {
        console.error("Failed to load project forecasts", err);
        setForecastsError("Failed to load forecasts.");
      } finally {
        setForecastsLoading(false);
      }
    }

    fetchProjectForecasts();
  }, [id]);

  function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function getTotalAllocatedDays(forecast) {
    if (Array.isArray(forecast.allocations) && forecast.allocations.length > 0) {
      return forecast.allocations.reduce(
        (sum, allocation) => sum + Number(allocation.daysAllocated || 0),
        0
      );
    }
    return Number(forecast.daysAllocated || 0);
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

      const res = await api.patch(`/jobcodes/${encodeURIComponent(code)}/`, updatedData);

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

  const handleSaveSidebar = async () => {
    try {
      const updatedData = {
        startDate: project.startDate,
        endDate: project.finishDate,
        budgetTime: project.remainingBudgetDays,
        budgetCost: project.budget
      };

      const res = await api.patch(`/jobcodes/${encodeURIComponent(code)}/`, updatedData);

      if (res.status === 200) {
        setIsEditingSidebar(false);
      } else {
        console.error("Failed to save sidebar changes");
      }
    } catch (err) {
      console.error("Error saving sidebar changes", err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete project " + project.name + "?")) {
      try {
        //const response = await api.delete(`/jobcodes/${encodeURIComponent(code)}/`);
        console.log("Project deleted successfully");
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Error deleting project", err);
        alert("Failed to delete project. Please try again.");
      }
    }
  };

  if (loading) return <div className="detail-page">Loading project...</div>;
  if (error) return <div className="detail-page">Error: {error}</div>;
  if (!project) return null;

  console.log("PROJECT EMPLOYEES:", project?.employees);

  return (
     <div className="detail-page">
      <div className="detail-top-row">
        <button className="back-button" onClick={() => navigate("/projects/")}>
          Back to Projects
        </button>
      </div>

      <div className="project-layout">
        <main className="project-main">
          <div className="project-header-row">
            <h1 className="project-title">{project.name}</h1>
            <div className="project-header-buttons">
              <button
              className="pill-button"
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
            <button className="pill-button delete-button" onClick={handleDelete}>
              Delete
            </button>
            </div>
          </div>

          <hr className="hr-filter_box" />

          <div className="project-body-card">
            {isEditing ? (
              <div className="edit-section">
                <h3>Edit Project</h3>

                <label>Description:</label>
                <textarea
                  className="edit-description"
                  value={project.description}
                  onChange={(e) => setProject(prev => ({ ...prev, description: e.target.value }))}
                />

                <label>Assign Employees:</label>
                {allEmployees.length > 0 ? (
                  <select
                    multiple
                    value={selectedEmployees.map(id => id.toString())}
                    onChange={(e) =>
                      setSelectedEmployees(
                        Array.from(
                          e.target.selectedOptions,
                          option => Number(option.value)
                        )
                      )
                    }
                  >
                    {allEmployees.map((emp) => (
                      <option
                        key={emp.employeeID || emp.id}
                        value={(emp.employeeID || emp.id).toString()}
                      >
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
              <>
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
                </div>

                <h2 className="section-title">Employees:</h2>
                <div className="description-box">
                  {project.employees && project.employees.length > 0
                    ? project.employees.map(emp => emp.name).join(", ")
                    : "None"}
                </div>

                <h2 className="section-title">Forecasts:</h2>
                {forecastsLoading ? (
                  <p>Loading forecasts...</p>
                ) : forecastsError ? (
                  <p>{forecastsError}</p>
                ) : forecasts.length === 0 ? (
                  <p>No forecasts found for this project.</p>
                ) : (
                  <div className="project-forecast-listing">
                    {forecasts.map((forecast) => (
                      <div
                        key={forecast.forecastID}
                        className="description-box project-forecast-item"
                      >
                        <p className="label-line">
                          <span className="label">Forecast ID:</span>{" "}
                          <span>{forecast.forecastID}</span>
                        </p>
                        <p className="label-line">
                          <span className="label">Job Code:</span>{" "}
                          <span>{forecast.jobCode}</span>
                        </p>
                        <p className="label-line">
                          <span className="label">Date:</span>{" "}
                          <span>{new Date(forecast.date).toLocaleDateString()}</span>
                        </p>
                        <p className="label-line">
                          <span className="label">Total Days Allocated:</span>{" "}
                          <span>{getTotalAllocatedDays(forecast)}</span>
                        </p>
                        <h3 className="section-title">Description:</h3>
                        <p>{forecast.description || "No description"}</p>
                        <h3 className="section-title">Allocations:</h3>
                        {Array.isArray(forecast.allocations) &&
                        forecast.allocations.length > 0 ? (
                          <ul className="specialism-list">
                            {forecast.allocations.map((allocation) => (
                              <li key={`${forecast.forecastID}-${allocation.employeeID}`}>
                                {allocation.employeeName}: {allocation.daysAllocated} day(s)
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No employee allocations.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <aside className="project-side">
          {isEditingSidebar ? (
            <div className="sidebar-edit-section">
              <div className="side-card">
                <h2 className="side-heading">Time:</h2>
                <label>Start Date:</label>
                <input
                  type="date"
                  value={project.startDate}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setProject(prev => ({
                      ...prev,
                      startDate: newStart,
                      durationDays: calculateDuration(newStart, prev.finishDate)
                    }));
                  }}
                />
                <label>Finish Date:</label>
                <input
                  type="date"
                  value={project.finishDate}
                  onChange={(e) => {
                    const newFinish = e.target.value;
                    setProject(prev => ({
                      ...prev,
                      finishDate: newFinish,
                      durationDays: calculateDuration(prev.startDate, newFinish)
                    }));
                  }}
                />
                <p className="label-line">
                  <span className="label">Duration (Days):</span>{" "}
                  <span>{project.durationDays}</span>
                </p>
                <label>Remaining Budget (Days):</label>
                <input
                  type="number"
                  value={project.remainingBudgetDays}
                  onChange={(e) => setProject(prev => ({ ...prev, remainingBudgetDays: parseFloat(e.target.value) }))}
                />
              </div>

              <div className="side-card">
                <h2 className="side-heading">Finance:</h2>
                <label>Budget (Cost Currency):</label>
                <input
                  type="number"
                  value={project.budget}
                  onChange={(e) => setProject(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                />
              </div>

              <div className="edit-buttons">
                <button onClick={handleSaveSidebar}>Save</button>
                <button onClick={() => setIsEditingSidebar(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="side-card">
                <h2 className="side-heading">Time:</h2>
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
            <h2 className="side-heading">Finance:</h2>
            <p className="label-line">
              <span className="label">Budget (Cost Currency):</span>{" "}
              <span>{project.budget}</span>
            </p>
          </div>

              <div className="side-card">
                <h2 className="side-heading">Confidence Score:</h2>
                <p className="confidence-value">{project.confidenceScore}</p>
              </div>

              <button className="pill-button side-edit-button" onClick={() => setIsEditingSidebar(true)}>Edit</button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default ProjectPage;
