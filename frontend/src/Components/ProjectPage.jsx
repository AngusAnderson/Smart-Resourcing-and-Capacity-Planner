import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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

  useEffect(() => {
    async function fetchProject() {
      try {
        // we will add this later when backend and frontend are linked
        // const res = await axios.get(`/api/projects/${id}/`);
        // setProject(res.data);
        setProject(mockProject);
      } catch (err) {
        console.error("Failed to load project", err);
      }
    }
    fetchProject();
  }, [id]);

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
