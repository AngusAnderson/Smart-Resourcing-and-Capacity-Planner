import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Employee_Project.css";

const mockEmployee = {
  id: 1,
  name: "Employee B",
  excludedFromAI: false,
  specialisms: [
    "Frontend Developer",
    "Backend Developer",
    "Edge Delivery Services"
  ],
  previousProjects: ["Project X", "Project Y", "Project Z"],
  currentProjects: ["Project A"]
};

function EmployeePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    async function fetchEmployee() {
      try {
        // we will add this later when backend and frontend are linked
        // const res = await axios.get(`/api/employees/${id}/`);
        // setEmployee(res.data);
        setEmployee(mockEmployee);
      } catch (err) {
        console.error("Failed to load employee", err);
      }
    }
    fetchEmployee();
  }, [id]);

  if (!employee) return null;

  return (
    <div className="detail-page">
      <div className="detail-top-row">
        <button className="back-button" onClick={() => navigate("/")}>
          Back to Calendar Page
        </button>
      </div>

      <div className="employee-layout">
        <main className="employee-main">
          <div className="employee-header-row">
            <h1 className="employee-name">{employee.name}</h1>
            <button className="pill-button">Edit</button>
          </div>

          <div className="employee-body-card">
            <p className="label-line">
              <span className="label">Excluded From AI:</span>{" "}
              <span>{employee.excludedFromAI ? "True" : "False"}</span>
            </p>

            <h2 className="section-title">Specialisms:</h2>
            <ul className="specialism-list">
              {employee.specialisms.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </main>

        <aside className="employee-side">
          <div className="side-card">
            <h2 className="side-heading">Previous Projects</h2>
            <ul className="side-list">
              {employee.previousProjects.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="side-card">
            <h2 className="side-heading">Current Projects</h2>
            <ul className="side-list">
              {employee.currentProjects.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <button className="pill-button side-edit-button">Edit</button>
        </aside>
      </div>
    </div>
  );
}

export default EmployeePage;
