import { useNavigate } from "react-router-dom";
import Icon from "../../dashboard/components/Icon.jsx";
import logo from "../../assets/images/logo.png";

const navItems = [
  { id: "users", label: "ניהול משתמשים", icon: "users" },
  { id: "analytics", label: "אנליטיקס", icon: "bar-chart" },
  { id: "events", label: "לוג אירועים", icon: "zap" },
];

export default function AdminSideNav({ activeId, onSelect }) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="brand">
        <img src={logo} alt="מוקד בסקייל" className="brand-logo" />
        <div className="brand-info">
          <div className="brand-title">מוקד בסקייל</div>
          <div className="brand-subtitle">פאנל ניהול</div>
        </div>
      </div>

      <div className="nav-group">
        <div className="nav-label">ניהול</div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeId === item.id ? "active" : ""}`}
              onClick={() => onSelect(item.id)}
              type="button"
            >
              <span className="nav-icon-wrap">
                <Icon name={item.icon} size={18} style={{ filter: "none" }} />
              </span>
              <span className="nav-text">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="nav-footer">
        <button
          className="nav-footer-item"
          onClick={() => navigate("/dashboard")}
          type="button"
        >
          <Icon name="logout" size={16} style={{ filter: "none", opacity: 0.6 }} />
          <span className="nav-text">חזרה לדאשבורד</span>
        </button>
      </div>
    </aside>
  );
}
