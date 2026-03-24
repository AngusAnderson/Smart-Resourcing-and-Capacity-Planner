import React, { useMemo, useState } from "react";
import "../../css/Sidebar/TeamUtilisationDonut.css";

const COLORS = {
  under1: "#ef4444",  // red
  under2: "#fb923c",  // orange
  correct: "#22c55e", // green
  over: "#eab308",    // yellow
};

const LABELS = {
  under1: "Under-allocated (HYPO days)",
  under2: "Under-allocated (Working days)",
  correct: "Correctly allocated",
  over: "Over-allocated (Working days)",
};

const RADIUS = 55;
const STROKE_WIDTH = 18;
const CIRC = 2 * Math.PI * RADIUS;

function makeSegments(counts) {
  const entries = [
    { key: "under1", value: counts.under1 ?? 0 },
    { key: "under2", value: counts.under2 ?? 0 },
    { key: "correct", value: counts.correct ?? 0 },
    { key: "over", value: counts.over ?? 0 },
  ];

  const total = entries.reduce((sum, e) => sum + e.value, 0);
  if (total === 0) {
    return entries.map((e) => ({
      ...e,
      label: LABELS[e.key],
      dashArray: "0 100",
      dashOffset: 0,
      fraction: 0,
    }));
  }

  let cumulative = 0;
  return entries.map((e) => {
    const fraction = e.value / total;
    const dash = fraction * CIRC;
    const gap = CIRC - dash;
    const dashArray = `${dash} ${gap}`;
    const dashOffset = -cumulative * CIRC;
    cumulative += fraction;
    return {
      ...e,
      label: LABELS[e.key],
      dashArray,
      dashOffset,
      fraction,
    };
  });
}

const TeamUtilisationDonut = ({ counts }) => {
  const segments = useMemo(() => makeSegments(counts), [counts]);
  const [activeKey, setActiveKey] = useState(null);

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const activeSegment =
    segments.find((s) => s.key === activeKey) ||
    segments.find((s) => s.value > 0) ||
    null;

  return (
    <div className="util-card">
      <div className="util-chart-wrapper util-chart-wrapper--stacked">
        <svg
          className="util-chart util-chart--large"
          viewBox="0 0 150 150"
        >
          <g transform="translate(75,75) rotate(-90)">
            <circle
              r={RADIUS}
              className="util-ring-bg"
              fill="none"
            />
            {segments.map((seg) =>
              seg.value > 0 ? (
                <circle
                  key={seg.key}
                  r={RADIUS}
                  fill="none"
                  stroke={COLORS[seg.key]}
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="butt"
                  className={
                    "util-ring-segment" +
                    (activeKey === seg.key ? " util-ring-segment--active" : "")
                  }
                  onClick={() =>
                    setActiveKey((prev) =>
                      prev === seg.key ? null : seg.key
                    )
                  }
                />
              ) : null
            )}
          </g>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            className="util-center-text util-center-text--large"
          >
            {total}
          </text>
        </svg>

        <div className="util-legend util-legend--wide">
          {segments.map((seg) => (
            <button
              key={seg.key}
              type="button"
              className={
                "util-legend-row" +
                (activeKey === seg.key ? " util-legend-row--active" : "")
              }
              onClick={() =>
                setActiveKey((prev) => (prev === seg.key ? null : seg.key))
              }
            >
              <span
                className="util-legend-dot"
                style={{ backgroundColor: COLORS[seg.key] }}
              />
              <span className="util-legend-label">{seg.label}</span>
              <span className="util-legend-value">{seg.value}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="util-details">
        {activeSegment ? (
          <>
            <span className="util-details-label">
              {activeSegment.label}
            </span>
            <span className="util-details-value">
              {activeSegment.value} employee
              {activeSegment.value === 1 ? "" : "s"} (
              {total > 0
                ? Math.round(activeSegment.fraction * 10000) / 100
                : 0}
              %)
            </span>
          </>
        ) : (
          <span className="util-details-placeholder">
            Click a segment or label to see details
          </span>
        )}
      </div>
    </div>
  );
};

export default TeamUtilisationDonut;