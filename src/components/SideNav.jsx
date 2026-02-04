import Icon from "./Icon.jsx";
import logo from "../assets/images/logo.png";

const navItems = [
  { id: "overview", label: "סקירת מכירות", icon: "bar-chart" },
  { id: "funnel", label: "משפך מכירות", icon: "funnel" },
  { id: "team", label: "ביצועי צוות", icon: "users" },
  { id: "ai", label: "עוזר AI", icon: "chat", badge: "חדש" },
  { id: "forecast", label: "תכנון תחזית", icon: "calculator" },
];

export default function SideNav({ activeId, onSelect }) {
  return (
    <aside className="sidebar">
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
            >
              <span className="nav-icon-wrap">
                <Icon name={item.icon} size={18} style={{ filter: "brightness(0) invert(1)" }} />
              </span>
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>
      </div>
      <div className="nav-footer">
        <button className="nav-footer-item" type="button">
          <Icon name="settings" size={16} style={{ filter: "brightness(0) invert(1)", opacity: 0.6 }} />
          <span>הגדרות</span>
        </button>
        <button className="nav-footer-item" type="button">
          <Icon name="logout" size={16} style={{ filter: "brightness(0) invert(1)", opacity: 0.6 }} />
          <span>התנתקות</span>
        </button>
      </div>
    </aside>
  );
}
