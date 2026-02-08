import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import Icon from "../components/Icon.jsx";

export default function AIWorkspace() {
  const demoName = typeof window !== "undefined"
    ? localStorage.getItem("demo_first_name")
    : null;
  const displayName = demoName && demoName.trim()
    ? demoName.trim().split(" ")[0]
    : "שם פרטי";
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
            <div className="ai-title">היי {displayName}, בוא נצלול לדאטה 📊</div>
            <div className="ai-subtitle">
              ספר לנו מה אתה צריך — ונטפל בכל השאר
            </div>
          </div>

          <div className="ai-cards">
            <div className="ai-card ai-card--dark">
              <div className="ai-card-tag">Data Assistant</div>
              <div className="ai-card-title">Your RevOps Co-Pilot</div>
              <div className="ai-card-text">
                עוזר חכם שמבין את נתוני ההכנסות שלך,
                מחבר בין המספרים,
                ועוזר לך לחשוב בצורה מסודרת
                על מה שבאמת חשוב.
              </div>
            </div>
            <div className="ai-card ai-card--prompt">
              <div className="ai-card-title">שאלות שכדאי לשאול עכשיו</div>
              <div className="ai-card-text">
                הצעות חכמות לשאלות שיעזרו לך להבין את מצב המכירות
                ולקבל החלטות טובות יותר.
              </div>
            </div>
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

        <div className="ai-chatbar ai-chatbar--wide">
          <div className="ai-chat-input">
            <Icon name="filter" size={16} style={{ filter: "brightness(0.5)" }} />
            <input
              placeholder="שאל משהו..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
          </div>
          <div className="ai-chat-actions">
            <button className="ai-chat-btn primary" aria-label="שליחה">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5l-7 7 7 7" />
                <path d="M5 12h14" />
              </svg>
            </button>
          </div>
        </div>

        <div className="footer">
          Powered by &nbsp; מוקד בסקייל &nbsp; | &nbsp; RevOps Intelligence
        </div>
      </div>
    </div>
  );
}
