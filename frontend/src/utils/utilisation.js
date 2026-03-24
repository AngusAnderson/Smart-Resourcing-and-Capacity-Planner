// src/utils/utilization.js
import { getWorkingDaysInMonth } from "./dateUtils";

// Same thresholds as EmployeePage.getMonthColor but return bucket key
export function getUtilizationBucket(totalDays, workingDays, allocatedDays) {
  if (totalDays === allocatedDays) return "correct"; // green

  if (allocatedDays > totalDays && allocatedDays < workingDays) {
    return "under2"; // orange
  }

  if (totalDays < allocatedDays) return "under1"; // red

  if (totalDays > workingDays) return "over"; // yellow

  return "under2";
}

export function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getForecastMonthKey(dateValue) {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthWorkingDays(monthKey) {
  const [year, month] = monthKey.split("-");
  const monthDate = {
    year: parseInt(year, 10),
    month: parseInt(month, 10),
  };
  return getWorkingDaysInMonth(monthDate);
}