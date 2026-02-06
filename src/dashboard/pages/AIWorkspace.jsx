import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import Icon from "../components/Icon.jsx";

export default function AIWorkspace() {
  const [chatInput, setChatInput] = useState("");
  const [promptSeed, setPromptSeed] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const quickPrompts = [
    "תן לי תובנות על ירידת ההמרה בשבוע האחרון",
    "מהם 3 צווארי הבקבוק העיקריים במשפך המכירות?",
    "המלץ על גרף KPI להציג בישיבת הנהלה",
    "סכם ביצועי נציגים עם חריגה מהיעד",
    "תנתח את יחס הלידים להצעות מחיר לפי חודש",
    "איזה צוות הוביל את הצמיחה ברבעון האחרון?",
    "תזהה חריגות ב‑SLA ונקודות סיכון תפעוליות",
    "סכם את השינוי בממוצע זמן הסגירה השבוע",
  ];
  const displayedPrompts = useMemo(() => {
    const start = (promptSeed * 4) % quickPrompts.length;
    return [
      quickPrompts[start],
      quickPrompts[(start + 1) % quickPrompts.length],
      quickPrompts[(start + 2) % quickPrompts.length],
      quickPrompts[(start + 3) % quickPrompts.length],
    ];
  }, [promptSeed, quickPrompts]);

  return (
    <div className="ai-page">
      <div className="ai-shell">
        <div className="ai-main">
          <div className="ai-hero">
            <div className="ai-orb" />
            <div className="ai-title">שלום, שם פרטי. במה תרצה להתמקד?</div>
            <div className="ai-subtitle">
              ספר לנו מה אתה צריך — ונטפל בכל השאר
            </div>
          </div>

          <div className="ai-cards">
            <div className="ai-card ai-card--dark">
              <div className="ai-card-tag">Data Assistant</div>
              <div className="ai-card-title">Sam Lee</div>
              <div className="ai-card-text">
                עוזר שמנהל תהליכי מכירה ומקסם מעורבות לקוחות בצורה חכמה.
              </div>
            </div>
            <div className="ai-card ai-card--list">
              <div className="ai-card-title">משימות מומלצות</div>
              <ul className="ai-card-list">
                <li>מענה על RFP באופן אוטומטי</li>
                <li>ניתוח מתחרים חכם</li>
                <li>טיוב מסרים מול לקוח</li>
              </ul>
              <button className="ai-link">צפה בכל המשימות</button>
            </div>
            <div className="ai-card ai-card--prompt">
              <div className="ai-card-title">שאלת דוגמה</div>
              <div className="ai-card-text">
                מה היתרונות המרכזיים שכדאי להדגיש ללקוחות פוטנציאליים?
              </div>
              <div className="ai-card-meta">Suggested prompt</div>
            </div>
          </div>

          <div className="ai-pill-row">
            <button className="ai-pill">חבר יומן</button>
            <button className="ai-pill">דמו משימה</button>
            <button className="ai-pill">אינטגרציות</button>
            <button className="ai-pill">שיתופים</button>
          </div>
        </div>

        <div className={`ai-prompt-row ${isRefreshing ? "is-refreshing" : ""}`}>
          <button
            className="ai-refresh"
            onClick={() => {
              if (isRefreshing) return;
              setIsRefreshing(true);
              setTimeout(() => {
                setPromptSeed((s) => s + 1);
                setIsRefreshing(false);
              }, 220);
            }}
          >
            רענן פרומפטים
          </button>
          {displayedPrompts.map((prompt) => (
            <button
              key={prompt}
              className="ai-prompt-pill"
              onClick={() => setChatInput(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="ai-chatbar">
          <div className="ai-chat-input">
            <Icon name="filter" size={16} style={{ filter: "brightness(0.5)" }} />
            <input
              placeholder="שאל משהו..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
          </div>
          <div className="ai-chat-actions">
            <button className="ai-chat-btn ghost">Attach</button>
            <button className="ai-chat-btn ghost">Voice</button>
            <button className="ai-chat-btn primary">Send</button>
          </div>
        </div>

        <div className="footer">
          Powered by &nbsp; מוקד בסקייל &nbsp; | &nbsp; RevOps Intelligence
        </div>
      </div>
    </div>
  );
}
