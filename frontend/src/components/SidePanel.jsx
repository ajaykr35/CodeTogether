// frontend/src/components/SidePanel.jsx
// Right side ka panel: Call card, aur tabs (Chat, People, History, Review).
// Abhi tabs ke andar khali states hain. Asli data baad ke phases mein judega.

import { useState } from "react";
import CallPanel from "./CallPanel.jsx";

const TABS = ["Chat", "People", "History", "Review"];

function SidePanel({ onNotice, media }) {
  const [tab, setTab] = useState("Chat");
  const [historyView, setHistoryView] = useState("edits");

  return (
    <aside className="ws-side">
      {/* Call card: mic aur camera */}
      <CallPanel media={media} />

      {/* Tabs */}
      <div className="ws-ptabs" role="tablist">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={tab === name}
            className={tab === name ? "active" : ""}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="ws-pbody">
        {/* Chat */}
        {tab === "Chat" && (
          <div className="ws-chat">
            <div className="ws-empty-small">
              <strong>No messages yet</strong>
              <p>Messages from your team will appear here.</p>
            </div>
            <div className="ws-chat-input">
              <input placeholder="Chat connects in Phase 8" disabled aria-label="Chat message" />
              <button
                type="button"
                className="btn btn-primary ws-small"
                onClick={() => onNotice("Chat is added in Phase 8.")}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* People */}
        {tab === "People" && (
          <>
            <div className="ws-section">
              <h3>Online now</h3>
              <p className="ws-muted">No one is online yet. People who join will appear here.</p>
            </div>
            <div className="ws-section">
              <h3>
                Join requests <span className="ws-badge">Admin only</span>
              </h3>
              <p className="ws-muted">No pending requests.</p>
            </div>
          </>
        )}

        {/* History */}
        {tab === "History" && (
          <>
            <div className="ws-chips">
              <button
                type="button"
                className={historyView === "edits" ? "active" : ""}
                onClick={() => setHistoryView("edits")}
              >
                Edits
              </button>
              <button
                type="button"
                className={historyView === "activity" ? "active" : ""}
                onClick={() => setHistoryView("activity")}
              >
                Activity
              </button>
            </div>

            <div className="ws-empty-small">
              {historyView === "edits" ? (
                <>
                  <strong>No edits yet</strong>
                  <p>Changes to files will be listed here, with who made them and when.</p>
                </>
              ) : (
                <>
                  <strong>No activity yet</strong>
                  <p>Joins, code runs and saves will appear here.</p>
                </>
              )}
            </div>
          </>
        )}

        {/* Review */}
        {tab === "Review" && (
          <div className="ws-empty-small">
            <strong>No review comments yet</strong>
            <p>Select lines in the editor to leave a review comment for your team.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

export default SidePanel;