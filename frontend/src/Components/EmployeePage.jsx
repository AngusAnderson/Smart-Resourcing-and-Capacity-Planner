import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../css/Employee_Project.css";
import { getWorkingDaysInMonth } from "../utils/dateUtils";
import AddForecastModal from "./AddForecastModal";
import EditForecastModal from "./EditForecastModal";

// const mockEmployee = {
//   id: 1,
//   name: "Employee B",
//   excludedFromAI: false,
//   specialisms: [
//     "Frontend Developer",
//     "Backend Developer",
//     "Edge Delivery Services"
//   ],
//   previousProjects: ["Project X", "Project Y", "Project Z"],
//   currentProjects: ["Project A"],
//   futureProjects: ["Project B", "Project C"]
// };

function EmployeePage() {
  const { id } = useParams(); 
  const [employee, setEmployee] = useState(null);
  const [forecasts, setForecasts] = useState([]);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [showAddForecastModal, setShowAddForecastModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showEditForecastModal, setShowEditForecastModal] = useState(false);
  const [editingForecast, setEditingForecast] = useState(null);
  const [allocatedDaysPerMonth, setAllocatedDaysPerMonth] = useState({});
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    excludedFromAI: false,
    specialisms: [],
  });
  const [specialismOptions, setSpecialismOptions] = useState([]);
  const [employeeSaving, setEmployeeSaving] = useState(false);
  const [employeeSaveError, setEmployeeSaveError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchEmployee() {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`/api/employees/${id}/`);
        if (cancelled) return;

        setEmployee(res.data);
        setEmployeeForm({
          name: res.data.name || "",
          excludedFromAI: !!res.data.excludedFromAI,
          specialisms: res.data.specialisms || [],
        });
      } catch (err) {
        console.error("Failed to load employee", err);
        if (cancelled) return;
        setError("Failed to load employee");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) fetchEmployee();

    return () => {
      cancelled = true;
    };
  }, [id]);


  useEffect(() => {
    async function fetchSpecialisms() {
      try {
        const res = await axios.get("/api/specialisms/");
        setSpecialismOptions(res.data || []);
      } catch (err) {
        console.error("Failed to load specialisms", err);
      }
    }
    fetchSpecialisms();
  }, []);

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

  const getForecastMonthKey = (dateValue) => {
    const date = new Date(dateValue);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthForecasts = forecasts.filter(
    (forecast) => getForecastMonthKey(forecast.date) === currentMonthKey
  );
  const previousMonthForecasts = forecasts.filter(
    (forecast) => getForecastMonthKey(forecast.date) < currentMonthKey
  );
  const futureMonthForecasts = forecasts.filter(
    (forecast) => getForecastMonthKey(forecast.date) > currentMonthKey
  );

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

  const getMonthWorkingDays = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const monthDate = {
      year: parseInt(year),
      month: parseInt(month)
    };
    return getWorkingDaysInMonth(monthDate);
  };

  const handleForecastAdded = (newForecast) => {
    setForecasts((prev) => [...prev, newForecast]);
  };

  const openEditModal = (forecast) => {
    setEditingForecast(forecast);
    setShowEditForecastModal(true);
  };

  const handleForecastUpdated = (updated) => {
    setForecasts((prev) => prev.map((f) => {
      if (f.forecastID === updated.forecastID && f.employeeID === updated.employeeID) {
        return updated;
      }
      return f;
    }));
  };

  // const handleDeleteAllocation = async (forecast) => {
  //   if (!window.confirm("Delete this forecast allocation?")) return;

  //   try {
  //     await api.delete(`/forecasts/${forecast.forecastID}/?employee_id=${forecast.employeeID}`);
  //     setForecasts((prev) =>
  //       prev.filter((p) => !(p.forecastID === forecast.forecastID && p.employeeID === forecast.employeeID))
  //     );
  //   } catch (err) {
  //     console.error("Failed to delete allocation", err);
  //     alert("Failed to delete allocation");
  //   }
  // };

  if (loading) return <div className="detail-page">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!employee) return <div className="detail-page">Employee not found</div>;

  const getMonthColor = (monthKey) => {
    const totalDays = groupedForecasts[monthKey].reduce((sum, f) => sum + parseFloat(f.daysAllocated), 0);
    const workingDays = getMonthWorkingDays(monthKey);
    const allocatedDays = allocatedDaysPerMonth[monthKey] ?? workingDays;

    // Green if total days equals allocated days
    if (totalDays === allocatedDays) return 'utilization-green';
    
    // Red if total days is less than allocated days
    if (totalDays < allocatedDays) return 'utilization-red';
    
    // Yellow if total days is greater than working days
    if (totalDays > workingDays) return 'utilization-yellow';
    
    // Orange if allocated days > total days AND allocated days < working days
    if (allocatedDays > totalDays && allocatedDays < workingDays) return 'utilization-orange';
    
    // Default to orange
    return 'utilization-orange';
  };

  const handleAllocatedDaysChange = (monthKey, value) => {
    setAllocatedDaysPerMonth((prev) => ({
      ...prev,
      [monthKey]: parseFloat(value),
    }));
  };

  const handleEmployeeSave = async () => {
    setEmployeeSaving(true);
    setEmployeeSaveError("");
    try {
      const payload = {
        name: employeeForm.name,
        excludedFromAI: employeeForm.excludedFromAI,
        specialisms: employeeForm.specialisms,
      };
      const res = await axios.patch(`/api/employees/${id}/`, payload);
      setEmployee(res.data);
      setEmployeeForm({
        name: res.data.name || "",
        excludedFromAI: !!res.data.excludedFromAI,
        specialisms: res.data.specialisms || [],
      });
      setIsEditingEmployee(false);
    } catch (err) {
      console.error("Failed to update employee", err);
      setEmployeeSaveError(err.response?.data?.error || "Failed to update employee.");
    } finally {
      setEmployeeSaving(false);
    }
  };

  if (!employee) return null;

  // const previousProjects = employee.previousProjects || [];
  // const currentProjects = employee.currentProjects || [];
  // const futureProjects = employee.futureProjects || [];

  // const specialisms = employee.specialisms || [];

  return (
    <div className="detail-page">
      <div className="detail-top-row">
        <button className="back-button" onClick={() => navigate("/employees/")}>
          Back to Employees
        </button>
      </div>

      <div className="employee-layout">
        <main className="employee-main">
          <div className="employee-header-row">
            <h1 className="employee-name">{employee.name}</h1>
            <button
              className="pill-button"
              onClick={() => {
                if (isEditingEmployee) {
                  setEmployeeForm({
                    name: employee.name || "",
                    excludedFromAI: !!employee.excludedFromAI,
                    specialisms: employee.specialisms || [],
                  });
                }
                setIsEditingEmployee((prev) => !prev);
              }}
            >
              {isEditingEmployee ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="employee-body-card">
            {isEditingEmployee ? (
              <div className="edit-section">
                <h3>Edit Employee</h3>

                <label htmlFor="employeeName">Name:</label>
                <input
                  id="employeeName"
                  type="text"
                  value={employeeForm.name}
                  onChange={(e) =>
                    setEmployeeForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />

                <label htmlFor="employeeExcluded">Excluded From AI:</label>
                <input
                  id="employeeExcluded"
                  type="checkbox"
                  checked={employeeForm.excludedFromAI}
                  onChange={(e) =>
                    setEmployeeForm((prev) => ({
                      ...prev,
                      excludedFromAI: e.target.checked,
                    }))
                  }
                />

                <label htmlFor="employeeSpecialisms">Specialisms:</label>
                <select
                  id="employeeSpecialisms"
                  multiple
                  value={employeeForm.specialisms}
                  onChange={(e) =>
                    setEmployeeForm((prev) => ({
                      ...prev,
                      specialisms: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      ),
                    }))
                  }
                >
                  {specialismOptions.map((s) => (
                    <option key={s.id || s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>

                {employeeSaveError && (
                  <div className="error-message">{employeeSaveError}</div>
                )}

                <div className="edit-buttons">
                  <button onClick={handleEmployeeSave} disabled={employeeSaving}>
                    {employeeSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEmployeeForm({
                        name: employee.name || "",
                        excludedFromAI: !!employee.excludedFromAI,
                        specialisms: employee.specialisms || [],
                      });
                      setIsEditingEmployee(false);
                    }}
                    disabled={employeeSaving}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          <div className="employee-body-card">
            <div className="forecasts-header">
              <h2 className="section-title">Forecasts:</h2>
              <button 
                className="pill-button add-forecast-button"
                onClick={() => setShowAddForecastModal(true)}
              >
                + Add Forecast
              </button>
            </div>
            {forecasts.length > 0 ? (
              <div className="forecasts-months">
                {sortedMonths.map((monthKey) => (
                  <div key={monthKey} className="month-group">
                    <div
                      className={`month-header ${getMonthColor(monthKey)}`}
                      onClick={() => toggleMonth(monthKey)}
                    >
                      <span className="month-toggle">
                        {expandedMonths[monthKey] ? '▼' : '▶'}
                      </span>
                      <span className="month-label">
                        {getMonthLabel(monthKey)}
                      </span>
                      <span className="month-count">
                        ({groupedForecasts[monthKey].length} forecast{groupedForecasts[monthKey].length !== 1 ? 's' : ''}, {getMonthWorkingDays(monthKey)} working days)
                      </span>
                    </div>

                    {expandedMonths[monthKey] && (
                      <table className="forecasts-table">
                        <thead>
                          <tr>
                            <th>Job Code</th>
                            <th>Description</th>
                            <th>Date</th>
                            <th>Days Allocated</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedForecasts[monthKey].map((forecast) => (
                            <tr key={`${forecast.forecastID}-${forecast.employeeID || 'na'}`} onClick={() => openEditModal(forecast)}>
                              <td><Link to={`/projects/${forecast.jobCode}`} className="job-code-link" onClick={(e) => e.stopPropagation()}>{forecast.jobCode}</Link></td>
                                <td>{forecast.description}</td>
                                <td>{new Date(forecast.date).toLocaleDateString()}</td>
                                <td>{forecast.daysAllocated}</td>
                                <td>
                                  <button
                                    className="delete-button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!window.confirm('Delete this forecast allocation?')) return;
                                      // Call DELETE API for this allocation
                                      axios
                                        .delete(`/api/forecasts/${forecast.forecastID}/?employee_id=${forecast.employeeID}`)
                                        .then(() => {
                                          setForecasts((prev) => prev.filter((p) => !(p.forecastID === forecast.forecastID && p.employeeID === forecast.employeeID)));
                                        })
                                        .catch((err) => {
                                          console.error('Failed to delete allocation', err);
                                          alert('Failed to delete allocation');
                                        });
                                    }}
                                  >
                                    ×
                                  </button>
                                </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" style={{ fontWeight: 700, textAlign: "right", paddingRight: "16px" }}>Total Days:</td>
                            <td colSpan="2" style={{ fontWeight: 700 }}>
                              {groupedForecasts[monthKey].reduce((sum, f) => sum + parseFloat(f.daysAllocated), 0)} / 
                              <select
                                value={allocatedDaysPerMonth[monthKey] ?? getMonthWorkingDays(monthKey)}
                                onChange={(e) => handleAllocatedDaysChange(monthKey, e.target.value)}
                                style={{ marginLeft: "8px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                              >
                                {Array.from({ length: getMonthWorkingDays(monthKey) * 2 + 1 }, (_, i) => {
                                  const value = i / 2;
                                  return (
                                  <option key={value} value={value}>
                                    {value}
                                  </option>
                                  );
                                })}
                              </select>
                            </td>
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
              {previousMonthForecasts.length > 0 ? (
                previousMonthForecasts.map((forecast) => (
                  <li key={`${forecast.forecastID}-${forecast.employeeID || 'na'}`}>
                    {forecast.jobCode} — {forecast.description} ({new Date(forecast.date).toLocaleDateString()})
                  </li>
                ))
              ) : (
                <li>No previous forecasts.</li>
              )}
            </ul>
          </div>

          <div className="side-card">
            <h2 className="side-heading">Current Projects</h2>
            <ul className="side-list">
              {currentMonthForecasts.length > 0 ? (
                currentMonthForecasts.map((forecast) => (
                  <li key={`${forecast.forecastID}-${forecast.employeeID || 'na'}`}>
                    {forecast.jobCode} — {forecast.description} ({new Date(forecast.date).toLocaleDateString()})
                  </li>
                ))
              ) : (
                <li>No current forecasts.</li>
              )}
            </ul>
          </div>

          <div className="side-card">
            <h2 className="side-heading">Future Projects</h2>
            <ul className="side-list">
              {futureMonthForecasts.length > 0 ? (
                futureMonthForecasts.map((forecast) => (
                  <li key={`${forecast.forecastID}-${forecast.employeeID || 'na'}`}>
                    {forecast.jobCode} — {forecast.description} ({new Date(forecast.date).toLocaleDateString()})
                  </li>
                ))
              ) : (
                <li>No future forecasts.</li>
              )}
            </ul>
          </div>

        </aside>
      </div>

      {showAddForecastModal && (
        <AddForecastModal
          employeeID={employee.employeeID}
          onClose={() => setShowAddForecastModal(false)}
          onForecastAdded={handleForecastAdded}
        />
      )}
      {showEditForecastModal && (
        <EditForecastModal
          forecast={editingForecast}
          onClose={() => setShowEditForecastModal(false)}
          onForecastUpdated={(u) => { handleForecastUpdated(u); setShowEditForecastModal(false); }}
        />
      )}
    </div>
  );
}

export default EmployeePage;