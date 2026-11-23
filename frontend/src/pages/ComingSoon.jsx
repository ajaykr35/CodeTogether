// frontend/src/pages/ComingSoon.jsx
// Temporary placeholder: jin pages ko abhi banana baaki hai, unke liye.
// Create Room aur Join Room pages banne par ye hat jayega.

import { Link } from "react-router-dom";

function ComingSoon({ title }) {
  return (
    <div className="container" style={{ textAlign: "center", paddingTop: 64 }}>
      <h2>{title}</h2>
      <p>This page will be built in the next steps.</p>
      <Link to="/dashboard" className="btn btn-primary">
        Back to dashboard
      </Link>
    </div>
  );
}

export default ComingSoon;