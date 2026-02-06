export default function SummaryTile({ label, value, highlight }) {
  return (
    <div className={`summary-tile ${highlight ? "highlight" : ""}`}>
      <div className="summary-label">{label}</div>
      <div className="summary-value">{value}</div>
    </div>
  );
}
