import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/AddForecastModal.css";

function AddForecastModal({ employeeID, onClose, onForecastAdded }) {
  const [formData, setFormData] = useState({
    forecastID: "",
    jobCode: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    daysAllocated: "",
  });
  const [jobCodes, setJobCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const generateForecastID = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `FORECAST-${timestamp}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        forecastID: formData.forecastID || generateForecastID(),
        employeeID: employeeID,
        daysAllocated: parseFloat(formData.daysAllocated),
      };

      const res = await axios.post("/api/forecasts/create/", dataToSubmit);
      
      if (res.status === 201) {
        onForecastAdded(res.data);
        setFormData({
          forecastID: "",
          jobCode: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
          daysAllocated: "",
        });
        onClose();
      }
    } catch (err) {
      console.error("Failed to create forecast", err);
      setError(
        err.response?.data?.error ||
          "Failed to create forecast. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Forecast</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="forecast-form">
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
              placeholder="Add any notes or details about this forecast"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="daysAllocated">Days Allocated *</label>
            <input
              type="number"
              id="daysAllocated"
              name="daysAllocated"
              value={formData.daysAllocated}
              onChange={handleInputChange}
              placeholder="e.g., 5.0"
              step="0.1"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="forecastID">Forecast ID (auto-generated if blank)</label>
            <input
              type="text"
              id="forecastID"
              name="forecastID"
              value={formData.forecastID}
              onChange={handleInputChange}
              placeholder="Leave blank for auto-generated ID"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? "Creating..." : "Add Forecast"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddForecastModal;
