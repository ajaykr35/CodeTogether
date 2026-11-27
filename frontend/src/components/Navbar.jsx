// Ye navbar har page ke upar dikhega. Logged-in aur logged-out ke liye alag dikhta hai.

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Navbar.css";

function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // token hatao aur user ko bhula do
    navigate("/");
  };

  // NavLink ko pata hota hai ki abhi kaunsa page khula hai (isActive)
  const linkClass = (extra = "") => ({ isActive }) =>
    `navbar-link ${extra} ${isActive ? "active" : ""}`.replace(/\s+/g, " ").trim();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo: click karne par Home page par jayega */}
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">{"</>"}</span>
          CodeTogether
        </Link>

        <nav className="navbar-links">
          <NavLink to="/" end className={linkClass("navbar-link-home")}>
            Home
          </NavLink>

          {/* Token check hone tak (loading) kuch nahi dikhate, taaki buttons jhapkein nahi */}
          {!loading && user && (
            <>
              <NavLink to="/dashboard" className={linkClass()}>
                Dashboard
              </NavLink>

              <span className="navbar-user" title={user.email}>
                <span className="navbar-avatar" aria-hidden="true">
                  {user.name.trim().charAt(0).toUpperCase()}
                </span>
                <span className="navbar-username">{user.name}</span>
              </span>

              <button type="button" className="btn btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}

          {!loading && !user && (
            <>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;