// frontend/src/pages/Login.jsx
// Login page: left mein dark brand panel, right mein email + password form.

import { useState } from "react";
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput.jsx";
import "./Auth.css";

function Login() {
  // Form ki values yaad rakhne ke liye state
  const [formData, setFormData] = useState({ email: "", password: "" });
  // Har field ka error message
  const [errors, setErrors] = useState({});
  // Submit ke baad dikhne wala message
  const [message, setMessage] = useState("");

  // Jab user kuch type kare, to us field ki value update ho
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // type karte hi purana error hat jaye
    setMessage("");
  };

  // Data sahi hai ya nahi, check karne wala function
  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailPattern.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // page reload hone se rokta hai
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Backend abhi bana nahi hai, isliye honest message dikhate hain.
      setMessage("Form is valid. Server login will be connected in Phase 4.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        {/* Left: dark brand panel (mobile par chhup jata hai) */}
        <aside className="auth-side">
          <div className="auth-side-brand">
            <span className="brand-badge">{"</>"}</span>
            CodeTogether
          </div>

          <h2>Welcome back</h2>
          <p>Pick up right where you left off with your team.</p>

          {/* Sirf design ke liye illustration, asli editor baad mein aayega */}
          <div className="auth-preview" aria-hidden="true">
            <div className="auth-preview-bar">
              <span>main.js</span>
              <span className="auth-online">2 online</span>
            </div>
            <div className="auth-code">
              <div className="auth-code-line">
                <span className="auth-code-no">1</span>
                <span>
                  <span className="c-kw">const</span> room ={" "}
                  <span className="c-fn">joinRoom</span>(
                  <span className="c-str">"K7X9QA"</span>);
                  <span className="auth-cursor auth-cursor-blue">
                    <span>You</span>
                  </span>
                </span>
              </div>
              <div className="auth-code-line">
                <span className="auth-code-no">2</span>
                <span>
                  room.<span className="c-fn">editTogether</span>();
                  <span className="auth-cursor auth-cursor-purple">
                    <span>Teammate</span>
                  </span>
                </span>
              </div>
            </div>
          </div>

          <ul className="auth-side-list">
            <li>Join rooms with an invite code</li>
            <li>Edit code live with your team</li>
            <li>Chat, talk and run code together</li>
          </ul>
        </aside>

        {/* Right: login form */}
        <div className="auth-card">
          <Link to="/" className="auth-back">
            &larr; Back to home
          </Link>

          {/* Mobile par dikhne wala logo */}
          <div className="auth-mobile-brand">
            <span className="brand-badge">{"</>"}</span>
            CodeTogether
          </div>

          <h1>Login to your account</h1>
          <p className="auth-intro">
            Enter your details to access your coding rooms.
          </p>

          {message && <div className="form-info">{message}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <FormInput
              label="Email"
              name="email"
              type="email"
              icon="mail"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <FormInput
              label="Password"
              name="password"
              type="password"
              icon="lock"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <button type="submit" className="btn btn-primary auth-submit">
              Login
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;