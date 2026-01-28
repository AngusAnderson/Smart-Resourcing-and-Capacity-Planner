import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/Employee_Project.css";

function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          confidenceScore: 0.8 // This might need to come from backend later
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

  if (loading) return <div className="detail-page">Loading project...</div>;
  if (error) return <div className="detail-page">Error: {error}</div>;
  if (!project) return null;

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
            <button className="pill-button">Edit</button>
          </div>

          <hr className='hr-filter_box'></hr>

          <div className="project-body-card">
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
        </main>

        <aside className="project-side">
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

          <button className="pill-button side-edit-button">Edit</button>
        </aside>
      </div>
    </div>
  );
}

export default ProjectPage;
