// frontend/src/pages/CreateRoom.jsx
// Create Room page: naam, kaun join kar sakta hai (open ya approval), aur role.
// Language nahi chunni padti, kyunki har file ki language uske extension se pehchani jaati hai.

import { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput.jsx";
import FormSelect from "../components/FormSelect.jsx";
import OptionCards from "../components/OptionCards.jsx";
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

function CreateRoom() {
  const [formData, setFormData] = useState({
    name: "",
    joinMode: "open",
    defaultRole: "editor",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // Jab user kuch type ya select kare
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setMessage("");
  };

  // "Who can join" card dabane par
  const handleModeChange = (value) => {
    setFormData({ ...formData, joinMode: value });
    setMessage("");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Backend abhi bana nahi hai, isliye honest message dikhate hain.
      const kind = formData.joinMode === "approval" ? "approval-required" : "open";
      setMessage(
        `Looks good. Saving this ${kind} room and generating its Room ID and code will be connected in Phase 5.`
      );
    }
  };

  const isApproval = formData.joinMode === "approval";

  return (
    <div className="room-page">
      <div className="container">
        <Link to="/dashboard" className="room-back">
          &larr; Back to dashboard
        </Link>

        <div className="room-layout">
          {/* Left: form */}
          <div className="room-card">
            <h1>Create a room</h1>
            <p className="room-intro">
              Set up a shared workspace for your team. Once it is created, you
              get a Room ID and a code to share.
            </p>

            {message && <div className="form-info">{message}</div>}

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
                hint="As the room admin, you can change any member's role later."
              />

              <div className="room-actions">
                <button type="submit" className="btn btn-primary">
                  Create room
                </button>
                <Link to="/dashboard" className="btn btn-outline">
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* Right: how joining works (mode ke hisaab se badalta hai) */}
          <aside className="room-side">
            <h2>How joining works</h2>
            <ol className="room-side-list">
              {JOIN_STEPS[formData.joinMode].map((item, index) => (
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
              {isApproval ? ", and review join requests." : "."}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CreateRoom;