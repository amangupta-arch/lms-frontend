import { NavLink, useLocation } from "react-router-dom";

export default function FooterNav() {
  const location = useLocation();

  // Hide on lesson pages
  const isLesson =
    location.pathname.startsWith("/course/") &&
    location.pathname.includes("/lesson/");
  if (isLesson) return null;

  return (
    <nav
      className="footer-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        background: "#ffffff",
        borderTop: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 50,
      }}
    >
      <Tab to="/home" label="Home" />
      {/* “Guides” == Home for now; omit to keep footer clean */}
      <Tab to="/challenges" label="Challenges" />
      <Tab to="/ai" label="Use AI" />
      <Tab to="/profile" label="Profile" />
    </nav>
  );
}

function Tab({ to, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        textDecoration: "none",
        color: isActive ? "#111827" : "#6b7280",
        fontSize: 13,
        fontWeight: 600,
      })}
    >
      {label}
    </NavLink>
  );
}