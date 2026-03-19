import React, { useMemo, useState } from "react";

function monthDiff(startYYYYMM, endYYYYMM) {
  const [sy, sm] = startYYYYMM.split("-").map(Number);
  const [ey, em] = endYYYYMM.split("-").map(Number);
  return (ey - sy) * 12 + (em - sm);
}

export default function SidebarExportButton({
  exportUrl,
  label = "Export",
}) {
  const EXPORT_URL = exportUrl ?? "/api/export/forecast-allocations.xlsx";

  const now = new Date();
  const defaultStart = `${now.getFullYear()}-01`;
  const defaultEnd = `${now.getFullYear()}-12`;

  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rangeError = useMemo(() => {
    if (!start || !end) return "Select a start and end month.";
    const diff = monthDiff(start, end);
    if (diff < 0) return "End month must be after start month.";
    if (diff > 35) return "Max range is 36 months.";
    return "";
  }, [start, end]);

  async function handleExport() {
    setError("");
    if (rangeError) {
      setError(rangeError);
      return;
    }

    setLoading(true);
    try {
      const url = new URL(EXPORT_URL, window.location.origin);
      url.searchParams.set("start", start); // YYYY-MM
      url.searchParams.set("end", end);     // YYYY-MM

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        credentials: "include", // keep if session auth; remove if not needed
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Export failed (${res.status}). ${text ? "Details: " + text : ""}`
        );
      }

      const blob = await res.blob();

      // Try to use server-provided filename; fallback:
      const cd = res.headers.get("Content-Disposition") || "";
      const match = cd.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] ?? `forecast-export_${start}_to_${end}.xlsx`;

      const a = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);

      setOpen(false);
    } catch (e) {
      setError(e?.message ?? "Something went wrong exporting.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Sidebar button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          background: "#f91c45",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        <span>{label}</span>
        <span style={{ color: "#6b7280", fontWeight: 700 }}></span>
      </button>

      {/* Simple modal/panel */}
      {open && (
        <div
          onClick={() => !loading && setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              borderRadius: 14,
              background: "#f91c45",
              border: "1px solid #e5e7eb",
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  Export forecast allocations
                </div>
                <div style={{ marginTop: 4, color: "white", fontSize: 13 }}>
                  Choose a month range (YYYY-MM).
                </div>
              </div>
              <button
                onClick={() => !loading && setOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              <label style={{ flex: 1, display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, color: "white" }}>
                  Start month
                </span>
                <input
                  type="month"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  style={{
                    height: 38,
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    padding: "0 10px",
                  }}
                />
              </label>

              <label style={{ flex: 1, display: "grid", gap: 6 }}>
                <span style={{ fontSize: 12, color: "white" }}>End month</span>
                <input
                  type="month"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  style={{
                    height: 38,
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    padding: "0 10px",
                  }}
                />
              </label>
            </div>

            {(rangeError || error) && (
              <div
                style={{
                  marginTop: 12,
                  padding: 10,
                  borderRadius: 10,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  fontSize: 13,
                }}
              >
                {error || rangeError}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 14,
              }}
            >
              <button
                onClick={() => !loading && setOpen(false)}
                style={{
                  height: 38,
                  padding: "0 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "#f91c45",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={loading}
                style={{
                  height: 38,
                  padding: "0 12px",
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  background: loading ? "#f3f4f6" : "#f91c45",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                {loading ? "Exporting..." : "Export (.xlsx)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}