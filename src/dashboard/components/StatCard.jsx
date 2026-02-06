import Icon from "./Icon.jsx";

const iconToSvg = {
  dollar: "dollar",
  briefcase: "package",
  chart: "bar-chart",
  clock: "clock",
};

export default function StatCard({ icon, label, value, delta, deltaDirection, deltaLabel }) {
  const svgName = iconToSvg[icon];

  return (
    <div className="card stat-card">
      <div className="stat-icon">
        {svgName ? (
          <Icon name={svgName} size={20} style={{ filter: "sepia(1) saturate(3) hue-rotate(90deg) brightness(0.7)" }} />
        ) : (
          icon
        )}
      </div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {delta && (
          <div className="stat-delta">
            <span className={deltaDirection || ""}>
              <Icon
                name={deltaDirection === "up" ? "trending-up" : "trending-down"}
                size={14}
                style={{
                  filter: deltaDirection === "up"
                    ? "sepia(1) saturate(5) hue-rotate(90deg) brightness(0.6)"
                    : "sepia(1) saturate(5) hue-rotate(0deg) brightness(0.7)",
                  marginLeft: 4,
                }}
              />
              {" "}{delta}
            </span>
            {deltaLabel && <span> {deltaLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
