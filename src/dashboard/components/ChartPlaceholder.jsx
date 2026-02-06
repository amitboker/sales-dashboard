export default function ChartPlaceholder({ title, subtitle }) {
  return (
    <div className="card chart-card">
      <div className="chart-header">
        <div>
          <div className="chart-title">{title}</div>
          {subtitle && <div className="muted">{subtitle}</div>}
        </div>
        <span className="pill">נתוני דמה</span>
      </div>
      <div className="chart-body">
        <div className="chart-grid" />
      </div>
    </div>
  );
}

