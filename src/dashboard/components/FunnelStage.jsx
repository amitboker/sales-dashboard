export default function FunnelStage({ label, value, percent, status }) {
  return (
    <div className={`funnel-stage ${status}`}>
      <div className="funnel-meta">
        <span className="funnel-percent">{percent}</span>
        <span className="muted">{value}</span>
      </div>
      <div className="funnel-bar">
        <span className="funnel-label">{label}</span>
      </div>
    </div>
  );
}

