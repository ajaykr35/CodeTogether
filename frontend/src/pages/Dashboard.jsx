// frontend/src/pages/Dashboard.jsx
// Dashboard: user ka home screen. Yahan se room banate ya join karte hain,
// aur apne rooms ki asli list dekhte hain.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getMyRoomsRequest } from "../api/roomApi.js";
import { parseApiError } from "../api/apiError.js";
import "./Dashboard.css";

// Chhota helper component: icons ke liye same SVG settings ek jagah.
function Icon({ children }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// Do main actions. Data alag rakhne se JSX chhota rehta hai.
const actions = [
  {
    title: "Create a room",
    text: "Start a new coding room, choose who can join and get a Room ID and code to share with your team.",
    to: "/rooms/new",
    button: "Create room",
    buttonClass: "btn btn-primary",
    iconClass: "action-icon action-icon-blue",
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </Icon>
    ),
  },
  {
    title: "Join a room",
    text: "Got a Room ID and code from a teammate? Enter them to join their room and start coding together.",
    to: "/rooms/join",
    button: "Join with code",
    buttonClass: "btn btn-outline",
    iconClass: "action-icon action-icon-purple",
    icon: (
      <Icon>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </Icon>
    ),
  },
];

const ROLE_LABELS = { admin: "Admin", editor: "Editor", viewer: "Viewer" };
const MODE_LABELS = { open: "Open", approval: "Approval" };

function Dashboard() {
  const { user, logout } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [status, setStatus] = useState("loading"); // loading, ready ya error
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0); // Refresh dabane par badhta hai

  // Page khulte hi (aur Refresh par) rooms ki list lao
  useEffect(() => {
    let cancelled = false;

    async function loadRooms() {
      setStatus("loading");
      try {
        const { data } = await getMyRoomsRequest();
        if (!cancelled) {
          setRooms(data.rooms);
          setStatus("ready");
        }
      } catch (err) {
        if (cancelled) return;
        // Token expire ya galat: logout, aur ProtectedRoute login par bhej dega
        if (err.response && err.response.status === 401) {
          logout();
          return;
        }
        setError(parseApiError(err).message);
        setStatus("error");
      }
    }

    loadRooms();
    return () => {
      cancelled = true;
    };
  }, [reloadCount, logout]);

  return (
    <div className="dash-page">
      <div className="container">
        {/* Heading */}
        <div className="dash-header">
          <h1>{user ? `Welcome, ${user.name}` : "Dashboard"}</h1>
          <p>Create a room or join one with a Room ID and code to start coding together.</p>
        </div>

        {/* Do action cards */}
        <div className="action-grid">
          {actions.map((item) => (
            <div className="action-card" key={item.title}>
              <span className={item.iconClass}>{item.icon}</span>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
              <Link to={item.to} className={item.buttonClass}>
                {item.button}
              </Link>
            </div>
          ))}
        </div>

        {/* Your rooms */}
        <section className="rooms-section">
          <div className="rooms-head">
            <h2>Your rooms</h2>
            <button
              type="button"
              className="btn btn-outline rooms-refresh"
              onClick={() => setReloadCount((count) => count + 1)}
              disabled={status === "loading"}
            >
              Refresh
            </button>
          </div>

          {status === "loading" && <p className="rooms-loading">Loading your rooms...</p>}

          {status === "error" && (
            <div className="form-alert" role="alert">
              {error}
            </div>
          )}

          {status === "ready" && rooms.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">
                <Icon>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </Icon>
              </span>
              <h3>No rooms yet</h3>
              <p>Rooms you create or join will appear here.</p>
              <Link to="/rooms/new" className="btn btn-primary">
                Create your first room
              </Link>
            </div>
          )}

          {status === "ready" && rooms.length > 0 && (
            <div className="room-grid">
              {rooms.map((room) => (
                <div className="room-item" key={room.roomId}>
                  <div className="room-item-top">
                    <h3 title={room.name}>{room.name}</h3>
                    <span className={`badge badge-${room.role}`}>{ROLE_LABELS[room.role]}</span>
                  </div>

                  <p className="room-item-id">
                    Room ID <strong>{room.roomId}</strong>
                  </p>

                  <div className="room-item-meta">
                    <span className={`badge badge-mode-${room.joinMode}`}>
                      {MODE_LABELS[room.joinMode]}
                    </span>
                    <span>
                      {room.memberCount} {room.memberCount === 1 ? "member" : "members"}
                    </span>
                    <span>Created {new Date(room.createdAt).toLocaleDateString()}</span>
                  </div>

                  <Link to={`/rooms/${room.roomId}`} className="btn btn-primary room-item-open">
                    Open workspace
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;