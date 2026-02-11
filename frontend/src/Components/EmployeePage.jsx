import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  const [expandedMonths, setExpandedMonths] = useState({});

  useEffect(() => {
    async function fetchEmployee() {
      try {
        const res = await axios.get(`/api/employees/${id}/`);
        setEmployee(res.data);
      } catch (err) {
        console.error("Failed to load employee", err);
      }
    }
    fetchEmployee();
  }, [id]);

  useEffect(() => {
    async function fetchForecasts() {
      try {
        const res = await axios.get(`/api/forecasts/?employee_id=${employee.employeeID}`);
        setForecasts(res.data);
      } catch (err) {
        console.error("Failed to load forecasts", err);
      }
    }
    if (employee) {
      fetchForecasts();
    }
  }, [employee]);

  // Group forecasts by month
  const groupedForecasts = forecasts.reduce((acc, forecast) => {
    const date = new Date(forecast.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(forecast);
    return acc;
  }, {});

  const sortedMonths = Object.keys(groupedForecasts).sort();

  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  const getMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

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
            <h2 className="section-title">Forecasts:</h2>
            {forecasts.length > 0 ? (
              <div className="forecasts-months">
                {sortedMonths.map((monthKey) => (
                  <div key={monthKey} className="month-group">
                    <div
                      className="month-header"
                      onClick={() => toggleMonth(monthKey)}
                    >
                      <span className="month-toggle">
                        {expandedMonths[monthKey] ? '▼' : '▶'}
                      </span>
                      <span className="month-label">
                        {getMonthLabel(monthKey)}
                      </span>
                      <span className="month-count">
                        ({groupedForecasts[monthKey].length} forecast{groupedForecasts[monthKey].length !== 1 ? 's' : ''})
                      </span>
                    </div>

                    {expandedMonths[monthKey] && (
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
                          {groupedForecasts[monthKey].map((forecast) => (
                            <tr key={forecast.forecastID}>
                              <td><Link to={`/projects/${forecast.jobCode}`} className="job-code-link">{forecast.jobCode}</Link></td>
                              <td>{forecast.customer}</td>
                              <td>{new Date(forecast.date).toLocaleDateString()}</td>
                              <td>{forecast.hoursAllocated}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" style={{ fontWeight: 700, textAlign: "right", paddingRight: "16px" }}>Total Hours:</td>
                            <td style={{ fontWeight: 700 }}>{groupedForecasts[monthKey].reduce((sum, f) => sum + parseFloat(f.hoursAllocated), 0)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No forecasts found for this employee.</p>
            )}
          </div>
        </main>

        <aside className="employee-side">
          <div className="side-card">
            <h2 className="side-heading">Previous Projects</h2>
            <ul className="side-list">
              {(employee.previousProjects || []).map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="side-card">
            <h2 className="side-heading">Current Projects</h2>
            <ul className="side-list">
              {(employee.currentProjects || []).map((p) => (
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
