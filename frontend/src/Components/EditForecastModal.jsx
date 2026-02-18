import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/AddForecastModal.css";

function EditForecastModal({ forecast, onClose, onForecastUpdated }) {
  const [formData, setFormData] = useState({
    forecastID: "",
    jobCode: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    daysAllocated: "",
    employeeID: null,
  });
  const [jobCodes, setJobCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (forecast) {
      setFormData({
        forecastID: forecast.forecastID,
        jobCode: forecast.jobCode || "",
        date: forecast.date ? new Date(forecast.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        description: forecast.description || "",
        daysAllocated: forecast.daysAllocated || "",
        employeeID: forecast.employeeID || null,
      });
    }
  }, [forecast]);

  useEffect(() => {
    fetchJobCodes();
  }, []);

  const fetchJobCodes = async () => {
    try {
      const res = await axios.get("/api/jobcodes/");
      setJobCodes(res.data || []);
    } catch (err) {
      console.error("Failed to load job codes", err);
      setError("Failed to load job codes");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        jobCode: formData.jobCode,
        date: formData.date,
        description: formData.description,
      };

      // include allocation update if employeeID provided
      if (formData.employeeID) {
        payload.employeeID = formData.employeeID;
        payload.daysAllocated = parseFloat(formData.daysAllocated);
      }

      const res = await axios.patch(`/api/forecasts/${formData.forecastID}/`, payload);

      onForecastUpdated(res.data);
      onClose();
    } catch (err) {
      console.error("Failed to update forecast", err);
      setError(err.response?.data?.error || "Failed to update forecast.");
    } finally {
      setLoading(false);
    }
  };

  if (!forecast) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Forecast</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="forecast-form">
          <div className="form-group">
            <label>Forecast ID</label>
            <input type="text" value={formData.forecastID} disabled />
          </div>

          <div className="form-group">
            <label htmlFor="jobCode">Job Code *</label>
            <select
              id="jobCode"
              name="jobCode"
              value={formData.jobCode}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a Job Code</option>
              {jobCodes.map((jc) => (
                <option key={jc.id} value={jc.code}>
                  {jc.code} - {jc.description}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="daysAllocated">Days Allocated</label>
            <input
              type="number"
              id="daysAllocated"
              name="daysAllocated"
              value={formData.daysAllocated}
              onChange={handleInputChange}
              step="0.1"
              min="0"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditForecastModal;
