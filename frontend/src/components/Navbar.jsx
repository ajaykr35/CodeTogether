// frontend/src/components/Navbar.jsx
// Ye navbar har page ke upar dikhega.
// Link / NavLink normal <a> tag ki jagah use hote hain, taaki page reload na ho.

import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Logo: click karne par Home page par jayega */}
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">{"</>"}</span>
          CodeTogether
        </Link>

        <nav className="navbar-links">
          {/* NavLink ko pata hota hai ki abhi kaunsa page khula hai (isActive) */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
          >
            Home
          </NavLink>

          <Link to="/login" className="btn btn-outline">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary">
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;