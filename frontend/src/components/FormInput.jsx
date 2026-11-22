// frontend/src/components/FormInput.jsx
// Reusable input box: label + (icon) + input + error message.
// type="password" par andar eye icon wala Show/Hide button bhi aata hai.

import { useState } from "react";

// Chhote SVG icons. Naya package install nahi karna padta.
const icons = {
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </>
  ),
};

function SvgIcon({ name }) {
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

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  icon, // optional: "mail", "lock" ya "user"
}) {
  // Password dikhana hai ya chhupana, ye yaad rakhne ke liye
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  // Show dabane par password ko normal text bana dete hain
  const inputType = isPassword && showPassword ? "text" : type;

  // Input ki CSS classes
  let inputClass = "form-input";
  if (error) inputClass += " input-error";
  if (icon) inputClass += " has-icon";
  if (isPassword) inputClass += " has-toggle";

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>

      <div className="input-wrap">
        {icon && (
          <span className="input-icon">
            <SvgIcon name={icon} />
          </span>
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={inputClass}
          aria-invalid={error ? "true" : "false"}
        />

        {isPassword && (
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <SvgIcon name={showPassword ? "eyeOff" : "eye"} />
          </button>
        )}
      </div>

      {/* Error tabhi dikhega jab error text ho */}
      {error && (
        <span className="form-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default FormInput;