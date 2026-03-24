import React, { useEffect, useState } from "react";
import api from "../../services/api";
import TeamUtilisationDonut from "./TeamUtilisationDonut";
import {
  getUtilizationBucket,
  getCurrentMonthKey,
  getForecastMonthKey,
  getMonthWorkingDays,
} from "../../utils/utilisation";

const EmployeeUtilisationCard = () => {
  const [counts, setCounts] = useState({
    under1: 0,
    under2: 0,
    correct: 0,
    over: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const empRes = await api.get("/employees/");
        if (cancelled) return;
        const employees = empRes.data || [];

        const monthKey = getCurrentMonthKey();
        const workingDays = getMonthWorkingDays(monthKey);

        const bucketCounts = {
          under1: 0,
          under2: 0,
          correct: 0,
          over: 0,
        };

        for (const emp of employees) {
          const fRes = await api.get(
            `/forecasts/?employee_id=${emp.employeeID}`
          );
          if (cancelled) return;

          const allForecasts = fRes.data || [];
          const currentForecasts = allForecasts.filter(
            (f) => getForecastMonthKey(f.date) === monthKey
          );

          if (currentForecasts.length === 0) {
            bucketCounts.under1 += 1;
            continue;
          }

          const totalDays = currentForecasts.reduce(
            (sum, f) => sum + parseFloat(f.daysAllocated),
            0
          );

          const allocatedDays = workingDays;

          const bucket = getUtilizationBucket(
            totalDays,
            workingDays,
            allocatedDays
          );

          bucketCounts[bucket] += 1;
        }

        if (cancelled) return;
        setCounts(bucketCounts);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load team utilisation", err);
        setError("Failed to load team utilisation");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="side-card">
      <h2 className="side-heading" style={{ textAlign: 'center' }}>Employee Allocation</h2>
      {loading && <p>Loading…</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && <TeamUtilisationDonut counts={counts} />}
    </div>
  );
};

export default EmployeeUtilisationCard;