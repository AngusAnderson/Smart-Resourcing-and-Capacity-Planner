import { useState } from "react";
import '../../css/Sidebar/Dashboard_tabs.css';

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
          <ul>
            {deadlines.map(ev => (
              <li key={ev.id}>
                <p>{ev.title}</p>
                <p>Ends: {ev.end.toString()}</p>
              </li>
            ))}
          </ul>
        )}

        {activeTab === "feed" && (
          <ul>
            {feedItems.map(item => (
              <li key={item.id}>
                <p>{item.title}</p>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard_Tabs;
