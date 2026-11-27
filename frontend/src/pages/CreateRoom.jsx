// Create Room page: naam, kaun join kar sakta hai (open ya approval), aur role.
// Form asli backend API se judta hai. Room banne ke baad Room ID aur code ek baar dikhte hain.

import { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput.jsx";
import FormSelect from "../components/FormSelect.jsx";
import OptionCards from "../components/OptionCards.jsx";
import { createRoomRequest } from "../api/roomApi.js";
import { parseApiError } from "../api/apiError.js";
import "./RoomPages.css";

// Room mein kaun aa sakta hai
const JOIN_MODES = [
  {
    value: "open",
    icon: "open",
    title: "Open",
    text: "Anyone who has both the Room ID and the code joins immediately.",
  },
  {
    value: "approval",
    icon: "approval",
    title: "Approval required",
    text: "People with the Room ID and code send a request. They enter only after you accept.",
  },
];

// Right panel: har mode ke liye joining ke steps
const JOIN_STEPS = {
  open: [
    {
      title: "Share the Room ID and code",
      text: "Send both to your teammates. Both are required to enter.",
    },
    {
      title: "They open Join Room",
      text: "They type the Room ID and the code.",
    },
    {
      title: "They are in",
      text: "They enter the room right away. No approval needed.",
    },
  ],
  approval: [
    {
      title: "Share the Room ID and code",
      text: "Send both to your teammates. Both are required to ask for entry.",
    },
    {
      title: "They send a request",
      text: "After typing the Room ID and code, they wait for your approval.",
    },
    {
      title: "You review the request",
      text: "Accept to let them in, or reject to keep them out.",
    },
  ],
};

// Naya member join kare to use kaunsa role mile
const ROLE_OPTIONS = [
  { value: "editor", label: "Editor (can edit and run code)" },
  { value: "viewer", label: "Viewer (can only read)" },
];

const INITIAL_FORM = { name: "", joinMode: "open", defaultRole: "editor" };

function CreateRoom() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Room ban gaya: { room, code }. Code sirf yahin, ek baar dikhta hai.
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(""); // kaunsa copy button abhi "Copied" dikha raha hai

  // Jab user kuch type ya select kare
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setServerError("");
  };

  // "Who can join" card dabane par
  const handleModeChange = (value) => {
    setFormData({ ...formData, joinMode: value });
    setServerError("");
  };

  // Data sahi hai ya nahi, check karne wala function
  const validate = () => {
    const newErrors = {};
    const name = formData.name.trim();

    if (!name) {
      newErrors.name = "Enter a room name.";
    } else if (name.length < 3) {
      newErrors.name = "Room name must be at least 3 characters.";
    } else if (name.length > 50) {
      newErrors.name = "Room name can be at most 50 characters.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    setServerError("");

    try {
      const { data } = await createRoomRequest({
        name: formData.name.trim(),
        joinMode: formData.joinMode,
        defaultRole: formData.defaultRole,
      });
      setCreated({ room: data.room, code: data.code });
    } catch (error) {
      const { message, fieldErrors } = parseApiError(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((current) => ({ ...current, ...fieldErrors }));
      } else {
        setServerError(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Text clipboard par copy karna, aur 2 second ke liye "Copied" dikhana
  const copyText = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setServerError("Could not copy. Please select the text and copy it yourself.");
    }
  };

  // Dosto ko bhejne ke liye taiyar message
  const inviteMessage = created
    ? `Join my CodeTogether room "${created.room.name}".\nRoom ID: ${created.room.roomId}\nCode: ${created.code}\nJoin here: ${window.location.origin}/rooms/join`
    : "";

  // Naya room banane ke liye form wapas khali
  const createAnother = () => {
    setCreated(null);
    setFormData(INITIAL_FORM);
    setErrors({});
    setServerError("");
    setCopied("");
  };

  const isApproval = formData.joinMode === "approval";
  const shownMode = created ? created.room.joinMode : formData.joinMode;

  return (
    <div className="room-page">
      <div className="container">
        <Link to="/dashboard" className="room-back">
          &larr; Back to dashboard
        </Link>

        <div className="room-layout">
          {/* Left: form ya success card */}
          <div className="room-card">
            {created ? (
              <div className="created">
                <span className="created-icon" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <h1>Room created</h1>
                <p className="room-intro">
                  <strong>{created.room.name}</strong> is ready. Share the Room ID and the code with
                  your team. Both are needed to join.
                </p>

                <div className="created-row">
                  <div>
                    <span className="created-label">Room ID</span>
                    <strong className="created-value">{created.room.roomId}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline ws-copy"
                    onClick={() => copyText(created.room.roomId, "id")}
                  >
                    {copied === "id" ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="created-row">
                  <div>
                    <span className="created-label">Code</span>
                    <strong className="created-value">{created.code}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline ws-copy"
                    onClick={() => copyText(created.code, "code")}
                  >
                    {copied === "code" ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="created-warning" role="note">
                  <strong>Save the code now.</strong> For security it is stored only as a hash, so it
                  cannot be shown again after you leave this page.
                </div>

                {serverError && (
                  <div className="form-alert" role="alert">
                    {serverError}
                  </div>
                )}

                <div className="room-actions">
                  <Link to={`/rooms/${created.room.roomId}`} className="btn btn-primary">
                    Open workspace
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => copyText(inviteMessage, "invite")}
                  >
                    {copied === "invite" ? "Copied" : "Copy invite message"}
                  </button>
                </div>

                <p className="created-more">
                  <button type="button" className="ws-link" onClick={createAnother}>
                    Create another room
                  </button>
                </p>
              </div>
            ) : (
              <>
                <h1>Create a room</h1>
                <p className="room-intro">
                  Set up a shared workspace for your team. Once it is created, you
                  get a Room ID and a code to share.
                </p>

                {serverError && (
                  <div className="form-alert" role="alert">
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Section 1: Basics */}
                  <div className="form-section-title">Basics</div>

                  <FormInput
                    label="Room name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="e.g. Data Structures Practice"
                    autoComplete="off"
                  />

                  {/* Section 2: Access */}
                  <div className="form-section-title">Access</div>

                  <OptionCards
                    label="Who can join"
                    value={formData.joinMode}
                    onChange={handleModeChange}
                    options={JOIN_MODES}
                  />

                  <FormSelect
                    label={isApproval ? "Role for accepted members" : "Role for new members"}
                    name="defaultRole"
                    value={formData.defaultRole}
                    onChange={handleChange}
                    options={ROLE_OPTIONS}
                    error={errors.defaultRole}
                    hint="As the room admin, you can change any member's role later."
                  />

                  <div className="room-actions">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? "Creating..." : "Create room"}
                    </button>
                    <Link to="/dashboard" className="btn btn-outline">
                      Cancel
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Right: how joining works (mode ke hisaab se badalta hai) */}
          <aside className="room-side">
            <h2>How joining works</h2>
            <ol className="room-side-list">
              {JOIN_STEPS[shownMode].map((item, index) => (
                <li key={item.title}>
                  <span className="room-side-no">{index + 1}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </div>
                </li>
              ))}
            </ol>

            <p className="side-note">
              <strong>You will be the room admin.</strong> Admins manage members
              and their roles
              {shownMode === "approval" ? ", and review join requests." : "."}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CreateRoom;