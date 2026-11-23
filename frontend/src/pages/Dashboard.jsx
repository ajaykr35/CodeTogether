// frontend/src/pages/Dashboard.jsx
// Dashboard: user ka home screen. Yahan se room banate ya join karte hain.

import { Link } from "react-router-dom";
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
    text: "Start a new coding room, choose a language and get an invite code to share with your team.",
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
    text: "Got an invite code from a teammate? Enter it to join their room and start coding together.",
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

function Dashboard() {
  return (
    <div className="dash-page">
      <div className="container">
        {/* Heading */}
        <div className="dash-header">
          <h1>Dashboard</h1>
          <p>Create a room or join one with an invite code to start coding together.</p>
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

        {/* Your rooms: abhi database nahi hai, isliye empty state.
            Phase 5 mein yahan asli rooms ki list aayegi. */}
        <section className="rooms-section">
          <h2>Your rooms</h2>

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
        </section>
      </div>
    </div>
  );
}

export default Dashboard;