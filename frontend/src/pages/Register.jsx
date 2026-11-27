// frontend/src/pages/Register.jsx
// Register page: left mein brand panel, right mein signup form.
// Form ab asli backend API se judta hai. Account banne ke baad user apne aap login ho jata hai.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { parseApiError } from "../api/apiError.js";
import "./Auth.css";

// Left panel ke 3 steps
const steps = [
  { title: "Create your account", text: "It takes less than a minute." },
  { title: "Create or join a room", text: "Use an invite code from a teammate." },
  { title: "Code together", text: "Edit, chat, talk and run code live." },
];

// Password kitna majboot hai, ye calculate karne wala function.
// Return: { level: "weak" | "medium" | "strong", label: "Weak" ... } ya null (khali password)
function getPasswordStrength(password) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: "weak", label: "Weak" };
  if (score === 3) return { level: "medium", label: "Medium" };
  return { level: "strong", label: "Strong" };
}

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(""); // backend ka message
  const [submitting, setSubmitting] = useState(false); // request chal rahi hai

  const strength = getPasswordStrength(formData.password);

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

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailPattern.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match.";
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
      await register(formData.name.trim(), formData.email.trim(), formData.password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const { message, fieldErrors } = parseApiError(error);
      // Server ne kisi field ki galti batayi to wahin dikhao, warna upar ke laal box mein
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((current) => ({ ...current, ...fieldErrors }));
      } else {
        setServerError(message);
      }
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

          <h2>Start coding together</h2>
          <p>Create your free account and bring your team into one room.</p>

          <ol className="auth-steps">
            {steps.map((item, index) => (
              <li key={item.title}>
                <span className="auth-step-no">{index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              </li>
            ))}
          </ol>
        </aside>

        {/* Right: register form */}
        <div className="auth-card">
          <Link to="/" className="auth-back">
            &larr; Back to home
          </Link>

          {/* Mobile par dikhne wala logo */}
          <div className="auth-mobile-brand">
            <span className="brand-badge">{"</>"}</span>
            CodeTogether
          </div>

          <h1>Create your account</h1>
          <p className="auth-intro">
            Fill in your details to join CodeTogether.
          </p>

          {serverError && (
            <div className="form-alert" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <FormInput
              label="Full name"
              name="name"
              icon="user"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Your name"
              autoComplete="name"
            />
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
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />

            {/* Strength meter: tabhi dikhega jab password likha ho */}
            {strength && (
              <div className={`strength strength-${strength.level}`}>
                <div className="strength-bars" aria-hidden="true">
                  <span className="strength-bar"></span>
                  <span className="strength-bar"></span>
                  <span className="strength-bar"></span>
                </div>
                <span className="strength-label">{strength.label}</span>
              </div>
            )}

            <FormInput
              label="Confirm password"
              name="confirmPassword"
              type="password"
              icon="lock"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />

            <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;