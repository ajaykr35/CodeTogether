// frontend/src/components/CallPanel.jsx
// Call card: mic aur camera ke on/off buttons, status aur mic level.
// Mic aur camera ka logic Workspace ke hook (useLocalMedia) se aata hai.
// Apna video ab alag floating window (VideoWindow) mein dikhta hai.

// Chhote SVG icons (on aur off, dono)
const icons = {
  mic: (
    <>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
    </>
  ),
  micOff: (
    <>
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
    </>
  ),
  video: (
    <>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </>
  ),
  videoOff: (
    <>
      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </>
  ),
};

function CallIcon({ name }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function CallPanel({ media }) {
  const { micOn, cameraOn, micLevel, error, toggleMic, toggleCamera } = media;

  // Upar ek line ka status
  let status = "Mic and camera are off";
  if (micOn && cameraOn) status = "Mic and camera are on";
  else if (micOn) status = "Mic is on";
  else if (cameraOn) status = "Camera is on";

  return (
    <div className="call">
      <div className="call-head">
        <div>
          <strong>Call</strong>
          <span>{status}</span>
        </div>

        <div className="call-buttons">
          <button
            type="button"
            className={micOn ? "call-btn on" : "call-btn off"}
            onClick={toggleMic}
            aria-pressed={micOn}
            aria-label={micOn ? "Turn off microphone" : "Turn on microphone"}
            title={micOn ? "Turn off microphone" : "Turn on microphone"}
          >
            <CallIcon name={micOn ? "mic" : "micOff"} />
          </button>

          <button
            type="button"
            className={cameraOn ? "call-btn on" : "call-btn off"}
            onClick={toggleCamera}
            aria-pressed={cameraOn}
            aria-label={cameraOn ? "Turn off camera" : "Turn on camera"}
            title={cameraOn ? "Turn off camera" : "Turn on camera"}
          >
            <CallIcon name={cameraOn ? "video" : "videoOff"} />
          </button>
        </div>
      </div>

      {/* Mic level (sirf mic on hone par) */}
      {micOn && (
        <div className="call-meter" role="img" aria-label="Microphone level">
          <span style={{ width: `${micLevel}%` }}></span>
        </div>
      )}

      {error && (
        <p className="call-error" role="alert">
          {error}
        </p>
      )}

      <p className="call-note">
        {cameraOn
          ? "Your video is in a floating window. Drag it anywhere, resize it or minimise it. "
          : ""}
        Only you can see and hear this for now. Sharing with teammates is added
        in Phase 8.
      </p>
    </div>
  );
}

export default CallPanel;