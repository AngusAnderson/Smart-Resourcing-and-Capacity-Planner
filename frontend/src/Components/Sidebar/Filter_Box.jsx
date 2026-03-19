import React from "react";
import "../../css/Sidebar/Filter_Box.css";
import OverallProjectProgress from "../../functions/Filter_Box_Functions/Overall_Project_Progress";
import Dashboard_Tabs from "./Dashboard_Tabs";
import { getDeadlinesWithinTwoWeeks } from '../../utils/deadlineUtils';

const Filter_Box = ({ searchTerm, onSearchChange, events, feedItems }) => {
  const deadlines = getDeadlinesWithinTwoWeeks(events || []);

  return (
    <div className="filter-box">
      <h1 className="h1-filter_box">Filter</h1>

      {/* Filter search box */}
      <form className="search-box" onSubmit={(e) => e.preventDefault()}>
        <span className="search-icon">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke="currentColor" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" />
          </svg>
        </span>
        <div className="vertical-divider"></div>
        <input
          className="search-input"
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </form>

      <hr className="hr-filter_box" />
      <div className="white-space-filter_box"></div>

      {/* Dashboard tabs area */}
      <div className="dashboard">
        <Dashboard_Tabs
          deadlines={deadlines}
          feedItems={feedItems || []}
        />
      </div>
      
    </div>
  );
};

export default Filter_Box;
