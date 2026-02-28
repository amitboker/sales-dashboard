import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";
import logo from "../../assets/icons/clario-symbol.png";

const navItems = [
  { id: "ai", label: "עוזר AI", icon: "chat", badge: "חדש" },
  { id: "command", label: "מרכז שליטה", icon: "bar-chart" },
  { id: "team", label: "ביצועי צוות", icon: "users" },
  { id: "funnel", label: "משפך מכירות", icon: "funnel" },
  { id: "projection", label: "בניית תחזית", icon: "calculator" },
  { id: "settings", label: "הגדרות", icon: "settings" },
];

const extraTools = [
  { id: "competitor-intel", label: "מודיעין מתחרים", icon: "trending-up" },
  { id: "test-planner", label: "מתכנן בדיקות", icon: "check-circle" },
  { id: "voice-of-customer", label: "קול הלקוח", icon: "users" },
];

export default function SideNav({ activeId, onSelect, collapsed, onToggleCollapse, onLogout }) {
  const navigate = useNavigate();
  const [extraOpen, setExtraOpen] = useState(false);

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <div className="brand">
        <button
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          type="button"
          aria-label={collapsed ? "הרחב תפריט" : "כווץ תפריט"}
        >
          {collapsed ? "›" : "‹"}
        </button>
        <img src={logo} alt="Clario" className="brand-logo" />
        <div className="brand-info">
          <div className="brand-title">Clario</div>
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

        <div className="extra-tools-divider" />

        <button
          className={`extra-tools-toggle${extraOpen ? " open" : ""}`}
          type="button"
          onClick={() => setExtraOpen((v) => !v)}
          data-tooltip="כלים נוספים"
        >
          <span className="nav-text">כלים נוספים</span>
          <span className="extra-tools-chevron">
            <Icon name="chevron-down-sm" size={14} style={{ filter: "none" }} />
          </span>
        </button>

        <div className={`extra-tools-list${extraOpen ? " open" : ""}`}>
          <div className="extra-tools-inner">
            {extraTools.map((item) => (
              <button
                key={item.id}
                className="nav-item extra-tool-item"
                type="button"
                data-tooltip={item.label}
              >
                <span className="nav-icon-wrap">
                  <Icon name={item.icon} size={18} style={{ filter: "none" }} />
                </span>
                <span className="nav-text">{item.label}</span>
                <span className="coming-soon-badge">בקרוב</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="nav-footer">
        <div className="pro-card">
          <div className="pro-card-header">
            <span className="pro-card-title">Clario Pro</span>
            <span className="pro-card-sparkle">✦</span>
          </div>
          <div className="pro-card-desc">גישה מלאה לכל הכלים והתחזיות</div>
          <button className="pro-card-btn" type="button" onClick={() => navigate('/pricing')}>צפה בתוכניות</button>
        </div>

        <div className="sidebar-logout-divider" />
        <button
          className="sidebar-logout-btn"
          type="button"
          onClick={onLogout}
          data-tooltip="התנתק"
        >
          <Icon name="logout" size={16} style={{ filter: "none" }} />
          <span className="nav-text">התנתק</span>
        </button>
      </div>
    </aside>
  );
}
