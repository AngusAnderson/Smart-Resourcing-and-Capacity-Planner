import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Project_list.css";
import CreateProjectModal from "./CreateProjectModal";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:8000/jobcodes/");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const deleteProject = async (code) => {
    try {
      await axios.delete(`http://localhost:8000/jobcodes/${code}/`);
      fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const filteredProjects = projects.filter((project) =>
    `${project.code} ${project.description} ${project.customer} ${project.business_unit}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <h2>Projects</h2>
        <button className="add-project-btn" onClick={() => setShowModal(true)}>
            Add Project
        </button>
      </div>

      <input
        type="text"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="project-search"
      />

      <div className="project-grid">
        {filteredProjects.map((project) => (
          <div key={project.code} className="project-card">
            <h3>{project.code}</h3>
            <p>{project.description}</p>
            <p><strong>Customer:</strong> {project.customer}</p>
            <p><strong>Business Unit:</strong> {project.business_unit}</p>

            <div className="project-card-buttons">
              <button
                className="view-btn"
                onClick={() => navigate(`/projects/${project.code}`)}
              >
                View
              </button>

              <button
                className="delete-btn"
                onClick={() => deleteProject(project.code)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onProjectCreated={fetchProjects}
        />
      )}
    </div>
  );
};

export default ProjectList;