// frontend/src/components/Footer.jsx
// Ye footer har page ke neeche dikhega.

import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-brand">CodeTogether</span>
        <span>
          © {new Date().getFullYear()} CodeTogether. Real-time collaborative
          coding.
        </span>
      </div>
    </footer>
  );
}

export default Footer;