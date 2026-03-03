import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../css/Project_list.css";
import CreateProjectModal from "./CreateProjectModal";

function ProjectList() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

    const fetchProjects = async () => {
    setError(null);
    try {
        const res = await api.get("/jobcodes/");

        const raw = Array.isArray(res.data) ? res.data : (res.data?.results || []);

        const normalized = raw.map((p) => ({
        id: p.id,   
        code: p.code,
        name: p.code,           
        description: p.description,
        customerName: p.customerName,
        businessUnit: p.businessUnit,
        }));

        setProjects(normalized);
    } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Could not load projects. Please try again.");
    }
    };

    const handleDeleteProject = async (project) => {
        const code = project?.code;
        if (!code) return;

        setProjects((prev) => prev.filter((p) => p.code !== code));

        try {
            await api.delete(`/jobcodes/${encodeURIComponent(code)}/`);
        } catch (err) {
            const msg = String(err?.message || "");
            const isWeirdDeleteResponse =
            err?.code === "ERR_NETWORK" || msg.includes("Network Error");

            if (!isWeirdDeleteResponse) {
            console.error("Error deleting project:", err);
            }
        } finally {
            fetchProjects();
        }
        };

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;

    return projects.filter((p) => {
      const haystack = `${p.code || ""} ${p.description || ""} ${p.customerName || ""} ${p.businessUnit || ""}`
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [projects, search]);

  return (
    <div className="project-list-page">
      <div className="project-top-bar">
        <button className="project-btn-primary" onClick={() => navigate("/")}>
          Back
        </button>
      </div>

      <div className="project-list-header">
        <h1>Projects</h1>
        <button
          className="project-btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Add Project
        </button>
      </div>

      <div className="project-search-row">
        <input
          className="project-search-input"
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="project-error-message">{error}</div>}

      {filteredProjects.length === 0 ? (
        <div className="project-empty-state">No projects found</div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => {
            const id = project?.code ?? project?.id;

            return (
              <div
                key={project.code}
                className="project-card"
                onClick={() => navigate(`/projects/${encodeURIComponent(project.code)}`)}

              >
                <div className="project-card-content">
                  <h2>{project.name}</h2>
                
                  <p className="project-description">
                    {project.description || "No description"}
                  </p>
                  <p className="project-meta">
                    <strong>Customer:</strong> {project.customerName || "Not set"}
                  </p>
                  <p className="project-meta">
                    <strong>Business Unit:</strong> {project.businessUnit || "Not set"}
                  </p>
                </div>

                <div
                  className="project-card-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="project-btn-secondary"
                    onClick={() => navigate(`/projects/${encodeURIComponent(project.code)}`)}
                  >
                    View
                  </button>
                  <button
                    className="project-btn-danger"
                    onClick={() => handleDeleteProject(project)}
                    
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={() => {
            setShowCreateModal(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}

export default ProjectList;