import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Temporal } from "temporal-polyfill";
import CreateProjectModal from "../CreateProjectModal";
import "../../css/Sidebar/Dashboard_tabs.css";

function formatDueText(end) {
  const endDate = Temporal.PlainDate.from(end);
  const today = Temporal.Now.plainDateISO();
  const diff = endDate.until(today, { largestUnit: "days" }).days * -1;
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
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleDeadlineClick = (id) => {
    navigate(`/projects/${id}`);
  };

  const handleFeedClick = (projectId) => {
    if (!projectId) return;
    navigate(`/projects/${projectId}`);
  };

  const handleUndoClick = async (item) => {
    console.log("FEED undo clicked for", item.projectId);
    try {
      if (item.undo) {
        await item.undo();
      }
    } catch (e) {
      console.error("Undo failed", e);
    }
  };

  const handleProjectCreated = (newProject) => {
    console.log("New project created:", newProject);
    setIsCreateProjectModalOpen(false);
  };

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
              <p className="deadlines-empty">
                No projects ending in the next 2 weeks.
              </p>
            )}
            {deadlines.map((ev) => (
              <div
                className="deadline-item"
                key={ev.id}
                onClick={() => handleDeadlineClick(ev.id)}
              >
                <div className="deadline-title">{ev.title}</div>
                <div className="deadline-subline">
                  <span className="deadline-due">
                    {formatDueText(ev.end)}
                  </span>
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
            {(!feedItems || feedItems.length === 0) && (
              <p className="feed-empty">No recent activity.</p>
            )}
            {feedItems?.map((item) => (
              <div
                className="feed-item"
                key={item.id}
                onClick={() => handleFeedClick(item.projectId)}
              >
                <div className="feed-title">{item.message}</div>
                <div className="feed-subline">
                  <span className="feed-time">
                    Completed at {item.completedAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="create-project-button"
        onClick={() => setIsCreateProjectModalOpen(true)}
      >
        Create Project
      </button>

      {isCreateProjectModalOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateProjectModalOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}

export default Dashboard_Tabs;
