// src/components/Header.js
import { Link, NavLink } from "react-router-dom";
import { useI18n } from "../locale/LocaleProvider"; // ← use your i18n hook
import "./Header.css";

export default function Header() {
  const { t } = useI18n();

  const item = (to, labelKey) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "px-3 py-2 rounded-md text-sm font-medium " +
        (isActive ? "header-link-active" : "header-link")
      }
    >
      {t(labelKey)}
    </NavLink>
  );

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/home" className="logo">MyLMS</Link>

        {/* Desktop nav */}
        <nav className="nav-desktop">
          {item("/home", "nav.home")}
          {item("/home", "nav.guides")}        {/* guides == home for now */}
          {item("/challenges", "nav.challenges")}
          {item("/ai", "nav.ai")}
          {item("/profile", "Profile")}
        </nav>

        {/* Mobile: hamburger goes straight to Profile */}
        <Link
          to="/profile"
          className="hamburger"
          aria-label={t("nav.gotoProfile")}
          style={{ textDecoration: "none" }}
        >
          
        </Link>
      </div>
    </header>
  );
}