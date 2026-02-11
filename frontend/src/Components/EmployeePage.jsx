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
  currentProjects: ["Project A"],
  futureProjects: ["Project B", "Project C"]
};

function EmployeePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [forecasts, setForecasts] = useState([]);

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

  useEffect(() => {
    async function fetchForecasts() {
      try {
        const res = await axios.get("/api/forecasts/");
        // Filter forecasts for this employee
        const employeeForecasts = res.data.filter(
          (forecast) => forecast.employeeID === parseInt(id)
        );
        setForecasts(employeeForecasts);
      } catch (err) {
        console.error("Failed to load forecasts", err);
      }
    }
    if (id) {
      fetchForecasts();
    }
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

          <div className="employee-body-card">
            <h2 className="section-title">Forecasts</h2>
            {forecasts.length > 0 ? (
              <table className="forecasts-table">
                <thead>
                  <tr>
                    <th>Job Code</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Hours Allocated</th>
                  </tr>
                </thead>
                <tbody>
                  {forecasts.map((forecast) => (
                    <tr key={forecast.forecastID}>
                      <td>{forecast.jobCode}</td>
                      <td>{forecast.customer}</td>
                      <td>{forecast.date}</td>
                      <td>{forecast.hoursAllocated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No forecasts found for this employee.</p>
            )}
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

          <div className="side-card">
            <h2 className="side-heading">Future Projects</h2>
            <ul className="side-list">
              {(employee.futureProjects || []).map((p) => (
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
