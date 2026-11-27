// frontend/src/pages/Login.jsx
// Login page: left mein dark brand panel, right mein email + password form.
// Form ab asli backend API se judta hai.

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { parseApiError } from "../api/apiError.js";
import "./Auth.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Agar user kisi protected page se yahan bheja gaya, to login ke baad wahin wapas
  const redirectTo = location.state?.from || "/dashboard";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(""); // backend ka message
  const [submitting, setSubmitting] = useState(false); // request chal rahi hai

  // Jab user kuch type kare, to us field ki value update ho
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setServerError("");
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

  const handleSubmit = async (e) => {
    e.preventDefault(); // page reload hone se rokta hai
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    setServerError("");

    try {
      await login(formData.email.trim(), formData.password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const { message } = parseApiError(error);
      setServerError(message);
    } finally {
      setSubmitting(false);
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

          {serverError && (
            <div className="form-alert" role="alert">
              {serverError}
            </div>
          )}

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

            <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;