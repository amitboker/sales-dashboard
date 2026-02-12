import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";
import logo from "../../assets/images/logo.png";

const navItems = [
  { id: "ai", label: "עוזר AI", icon: "chat", badge: "חדש" },
  { id: "command", label: "Command Center", icon: "bar-chart" },
  { id: "team", label: "ביצועי צוות", icon: "users" },
  { id: "funnel", label: "משפך מכירות", icon: "funnel" },
  { id: "projection", label: "Projection Builder", icon: "calculator" },
];

export default function SideNav({ activeId, onSelect, collapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <button
        className="sidebar-toggle"
        onClick={onToggleCollapse}
        type="button"
        aria-label={collapsed ? "הרחב תפריט" : "כווץ תפריט"}
      >
        {collapsed ? "›" : "‹"}
      </button>
      <div className="brand">
        <img src={logo} alt="מוקד בסקייל" className="brand-logo" />
        <div className="brand-info">
          <div className="brand-title">מוקד בסקייל</div>
          <div className="brand-subtitle">דאשבורד ביצועים</div>
        </div>
      </div>

      <div className="nav-group">
        <div className="nav-label">ניווט</div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeId === item.id ? "active" : ""}`}
              onClick={() => onSelect(item.id)}
              type="button"
              data-tooltip={item.label}
            >
              <span className="nav-icon-wrap">
                <Icon name={item.icon} size={18} style={{ filter: "none" }} />
              </span>
              <span className="nav-text">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="nav-footer">
        <button
          className={`nav-footer-item ${activeId === "settings" ? "active" : ""}`}
          onClick={() => onSelect("settings")}
          type="button"
          data-tooltip="הגדרות"
        >
          <Icon name="settings" size={16} style={{ filter: "none", opacity: 0.6 }} />
          <span className="nav-text">הגדרות</span>
        </button>

        <div className="theme-switcher">
          <button
            className={`theme-opt${theme === "light" ? " active" : ""}`}
            onClick={() => setTheme("light")}
            type="button"
          >
            <span className="theme-icon">☀︎</span>
            <span className="nav-text">Light</span>
          </button>
          <button
            className={`theme-opt${theme === "dark" ? " active" : ""}`}
            onClick={() => setTheme("dark")}
            type="button"
          >
            <span className="theme-icon">☽</span>
            <span className="nav-text">Dark</span>
          </button>
        </div>

        <div className="pro-card">
          <div className="pro-card-headline">שדרג לגרסת Pro</div>
          <div className="pro-card-desc">אתה משתמש בגרסה חינמית</div>
          <button className="pro-card-btn" type="button" onClick={() => navigate('/pricing')}>שדרג</button>
        </div>
      </div>
    </aside>
  );
}
