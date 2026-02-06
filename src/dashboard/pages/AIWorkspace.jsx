import PageHeader from "../components/PageHeader.jsx";
import Icon from "../components/Icon.jsx";

export default function AIWorkspace() {
  return (
    <div>
      <div style={{ textAlign: "center", marginTop: 40, marginBottom: 12 }}>
        <Icon name="settings" size={28} style={{ filter: "sepia(1) saturate(3) hue-rotate(90deg) brightness(0.6)" }} />
      </div>
      <div className="ai-title">
        עוזר RevOps החכם שלך
      </div>
      <div className="ai-subtitle">
        שאל כל שאלה על ביצועי המכירות, זהה דליפות, וקבל המלצות מבוססות נתונים
      </div>
      <div style={{ padding: "0 20px" }}>
        <div className="ai-input-wrap">
          <button className="ai-btn ai-send"><Icon name="zap" size={16} style={{ filter: "brightness(0) invert(1)" }} /></button>
          <input placeholder="מה מצב המכירות החודש?" />
          <button className="ai-btn ai-clip"><Icon name="filter" size={16} style={{ filter: "brightness(0.4)" }} /></button>
        </div>
      </div>
      <div className="footer">
        Powered by &nbsp; מוקד בסקייל &nbsp; | &nbsp; RevOps Intelligence
      </div>
    </div>
  );
}
