import React, { useEffect, useState, useRef } from 'react'

export default function OverallProjectProgress() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeLabel, setActiveLabel] = useState("");
  const timeoutRef = useRef(null);

  const handleSegmentClick = (label) => {
    setActiveLabel(label);
    setIsExpanded(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
      setActiveLabel("");
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="progress-wrapper">
      <div
        className={`progress-ring ${isExpanded ? "progress-ring-left" : ""}`}
      >
        <div className="progress-ring-inner" />

        <button
          className="segment-btn segment-green"
          onClick={() => handleSegmentClick("Currently allocated: 25%")}
        />
        <button
          className="segment-btn segment-yellow"
          onClick={() => handleSegmentClick("Over‑allocated: 15%")}
        />
        <button
          className="segment-btn segment-orange"
          onClick={() => handleSegmentClick("Under‑allocated: 40%")}
        />
        <button
          className="segment-btn segment-red"
          onClick={() => handleSegmentClick("Critical under‑allocation: 20%")}
        />
      </div>

      {isExpanded && (
        <div className="progress-text">
          {activeLabel}
        </div>
      )}
    </div>
  );
}
