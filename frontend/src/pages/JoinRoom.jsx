// Join Room page: Room ID + Code daalkar room mein jaate hain.
// Teen states: "form", "waiting" (approval ka intezaar), "rejected" (request decline hui).

import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FormInput from "../components/FormInput.jsx";
import "./RoomPages.css";

// Right panel ke steps
const JOIN_STEPS = [
  {
    title: "Get the Room ID and code",
    text: "Ask the room admin for both. You need both to join.",
  },
  {
    title: "Enter them here",
    text: "The Room ID has 8 characters and the code has 6.",
  },
  {
    title: "Join the room",
    text: "Open rooms let you in at once. In approval rooms you wait until the admin accepts.",
  },
];

// Input ko saaf karta hai: capital letters aur numbers hi rakhta hai, length tak kaat deta hai.
// Jaise "k7x9 q2af" -> "K7X9Q2AF"
function cleanValue(value, maxLength) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, maxLength);
}

const ROOM_ID_LENGTH = 8;
const CODE_LENGTH = 6;

function JoinRoom() {
  // TEMPORARY design preview: URL mein ?preview=waiting ya ?preview=rejected.
  // Asli server judne par (Phase 5) ye hata denge.
  const [searchParams] = useSearchParams();
  const preview = searchParams.get("preview");
  const startStatus = preview === "waiting" || preview === "rejected" ? preview : "form";

  const [status, setStatus] = useState(startStatus);
  const [formData, setFormData] = useState({ roomId: "", code: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // Jab user kuch type kare: value saaf karke save karte hain
  const handleChange = (e) => {
    const { name, value } = e.target;
    const maxLength = name === "roomId" ? ROOM_ID_LENGTH : CODE_LENGTH;
    setFormData({ ...formData, [name]: cleanValue(value, maxLength) });
    setErrors({ ...errors, [name]: "" });
    setMessage("");
  };

  // Data sahi hai ya nahi, check karne wala function
  const validate = () => {
    const newErrors = {};

    if (!formData.roomId) {
      newErrors.roomId = "Enter the Room ID.";
    } else if (formData.roomId.length !== ROOM_ID_LENGTH) {
      newErrors.roomId = `The Room ID has ${ROOM_ID_LENGTH} characters (letters and numbers).`;
    }

    if (!formData.code) {
      newErrors.code = "Enter the code.";
    } else if (formData.code.length !== CODE_LENGTH) {
      newErrors.code = `The code has ${CODE_LENGTH} characters (letters and numbers).`;
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Backend abhi bana nahi hai, isliye honest message dikhate hain.
      setMessage(
        "Looks good. Checking the Room ID and code, then joining or sending a request will be connected in Phase 5."
      );
    }
  };

  // Waiting ya declined se wapas form par aana
  const backToForm = () => {
    setStatus("form");
    setMessage("");
  };

  return (
    <div className="room-page">
      <div className="container">
        <Link to="/dashboard" className="room-back">
          &larr; Back to dashboard
        </Link>

        <div className="room-layout">
          {/* Left: form ya status card */}
          <div className="room-card">
            {/* ---------- State 1: form ---------- */}
            {status === "form" && (
              <>
                <h1>Join a room</h1>
                <p className="room-intro">
                  Enter the Room ID and the code you received from the room
                  admin.
                </p>

                {message && <div className="form-info">{message}</div>}

                <form onSubmit={handleSubmit} noValidate>
                  <FormInput
                    label="Room ID"
                    name="roomId"
                    icon="hash"
                    value={formData.roomId}
                    onChange={handleChange}
                    error={errors.roomId}
                    placeholder="e.g. K7X9Q2AF"
                    autoComplete="off"
                  />
                  <FormInput
                    label="Code"
                    name="code"
                    type="password"
                    icon="lock"
                    value={formData.code}
                    onChange={handleChange}
                    error={errors.code}
                    placeholder="6-character code"
                    autoComplete="off"
                  />

                  <div className="room-actions">
                    <button type="submit" className="btn btn-primary">
                      Join room
                    </button>
                    <Link to="/dashboard" className="btn btn-outline">
                      Cancel
                    </Link>
                  </div>
                </form>
              </>
            )}

            {/* ---------- State 2: approval ka intezaar ---------- */}
            {status === "waiting" && (
              <div className="status-card">
                <div className="spinner" aria-hidden="true"></div>
                <h1>Waiting for approval</h1>
                <p>
                  Your request has been sent to the room admin. You will enter
                  the room as soon as it is accepted. Please keep this page
                  open.
                </p>

                <div className="status-meta">
                  <div>
                    <span>Status</span>
                    <strong>Pending</strong>
                  </div>
                  {formData.roomId && (
                    <div>
                      <span>Room ID</span>
                      <strong>{formData.roomId}</strong>
                    </div>
                  )}
                </div>

                <div className="status-actions">
                  <button type="button" className="btn btn-outline" onClick={backToForm}>
                    Cancel request
                  </button>
                </div>
              </div>
            )}

            {/* ---------- State 3: request decline hui ---------- */}
            {status === "rejected" && (
              <div className="status-card">
                <span className="status-icon-rejected">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </span>
                <h1>Request declined</h1>
                <p>
                  The room admin did not accept your request. Check the Room ID
                  and code, or ask the admin to send them again.
                </p>

                <div className="status-actions">
                  <button type="button" className="btn btn-primary" onClick={backToForm}>
                    Try again
                  </button>
                  <Link to="/dashboard" className="btn btn-outline">
                    Back to dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right: how joining works */}
          <aside className="room-side">
            <h2>How joining works</h2>
            <ol className="room-side-list">
              {JOIN_STEPS.map((item, index) => (
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
              <strong>Both are required.</strong> A Room ID alone, or a code
              alone, is not enough to enter a room.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default JoinRoom;