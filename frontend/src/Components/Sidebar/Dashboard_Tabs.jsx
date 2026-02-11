import { useState } from "react";
import { Temporal } from "temporal-polyfill";
import "../../css/Sidebar/Dashboard_tabs.css";

function formatDueText(end) {
  const endDate = Temporal.PlainDate.from(end);
  const today = Temporal.Now.plainDateISO();
  const diff = endDate.until(today, { largestUnit: "days" }).days * -1; // days until end [web:18][web:27]
  return `Due ${diff} days`;
}

function formatDisplayDate(end) {
  const d = Temporal.PlainDate.from(end);
  const day = String(d.day).padStart(2, "0");
  const month = String(d.month).padStart(2, "0");
  const year = String(d.year).slice(-2);
  return `${day}/${month}/${year}`;
}

function Dashboard_Tabs({ deadlines, feedItems }) {
  const [activeTab, setActiveTab] = useState("deadlines");

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <button
          className={activeTab === "deadlines" ? "tab active" : "tab"}
          onClick={() => setActiveTab("deadlines")}
        >
          <span>Deadlines</span>
        </button>
        <button
          className={activeTab === "feed" ? "tab active" : "tab"}
          onClick={() => setActiveTab("feed")}
        >
          <span>Feed</span>
        </button>
      </div>

      <div className="tabs-body">
        {activeTab === "deadlines" && (
          <div className="deadlines-list">
            {deadlines.length === 0 && (
              <p className="deadlines-empty">No deadlines in the next 2 weeks.</p>
            )}
            {deadlines.map((ev) => (
              <div className="deadline-item" key={ev.id}>
                <div className="deadline-title">{ev.title}</div>
                <div className="deadline-subline">
                  <span className="deadline-due">{formatDueText(ev.end)}</span>
                  <span className="deadline-date">
                    {` { ${formatDisplayDate(ev.end)} }`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "feed" && (
          <div className="feed-list">
            {feedItems?.length === 0 && (
              <p className="feed-empty">No feed items yet.</p>
            )}
            {feedItems?.map((item) => (
              <div className="feed-item" key={item.id}>
                <p className="feed-title">{item.title}</p>
                <p className="feed-body">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard_Tabs;
