import Icon from "./Icon.jsx";

const iconToSvg = {
  error: "alert-circle",
  warning: "alert-triangle",
  check: "check-circle",
};

const iconFilter = {
  error: "sepia(1) saturate(5) hue-rotate(0deg) brightness(0.7)",
  warning: "sepia(1) saturate(3) hue-rotate(30deg) brightness(0.7)",
  check: "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)",
};

export default function AlertCard({ title, description, variant, icon }) {
  return (
    <div className={`alert-item ${variant}`}>
      <div className="alert-text">
        <div className="alert-title">{title}</div>
        <div className="alert-desc">{description}</div>
      </div>
      <div className="alert-icon">
        <Icon name={iconToSvg[icon] || "alert-circle"} size={16} style={{ filter: iconFilter[icon] || "" }} />
      </div>
    </div>
  );
}
