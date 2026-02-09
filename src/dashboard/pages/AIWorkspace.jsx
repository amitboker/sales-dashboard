import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "../components/Icon.jsx";
import { trackEvent } from "../../lib/tracking";
import { sendChatMessage, isAIConfigured } from "../../ai/service";

const allPromptCards = [
  { title: "ניתוח משפך", desc: "צווארי בקבוק ונקודות חיכוך במשפך המכירות", prompt: "מהם 3 צווארי הבקבוק העיקריים במשפך המכירות?" },
  { title: "ביצועי צוות", desc: "סיכום ביצועי נציגים וחריגות מהיעד", prompt: "סכם ביצועי נציגים עם חריגה מהיעד" },
  { title: "תובנות KPI", desc: "מדדים וגרפים חשובים להצגה בישיבות", prompt: "המלץ על גרף KPI להציג בישיבת הנהלה" },
  { title: "ירידת המרה", desc: "ניתוח שינויים ומגמות ביחסי המרה", prompt: "תן לי תובנות על ירידת ההמרה בשבוע האחרון" },
  { title: "לידים להצעות", desc: "יחס לידים להצעות מחיר לפי חודש", prompt: "תנתח את יחס הלידים להצעות מחיר לפי חודש" },
  { title: "צמיחה ברבעון", desc: "צוותים מובילים ומגמות צמיחה", prompt: "איזה צוות הוביל את הצמיחה ברבעון האחרון?" },
  { title: "חריגות SLA", desc: "נקודות סיכון ובעיות תפעוליות", prompt: "תזהה חריגות ב‑SLA ונקודות סיכון תפעוליות" },
  { title: "זמן סגירה", desc: "שינויים בממוצע זמני סגירת עסקאות", prompt: "סכם את השינוי בממוצע זמן הסגירה השבוע" },
];

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
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);
  const chatEndRef = useRef(null);

  const displayedPrompts = useMemo(() => {
    const start = (promptSeed * 3) % allPromptCards.length;
    return [
      allPromptCards[start],
      allPromptCards[(start + 1) % allPromptCards.length],
      allPromptCards[(start + 2) % allPromptCards.length],
    ];
  }, [promptSeed]);

  const hasChat = messages.length > 0;

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = useCallback(async (text) => {
    const trimmed = (text || chatInput).trim();
    if (!trimmed || isStreaming) return;

    setError("");
    setChatInput("");
    trackEvent("ai_workspace_use", { page: "/dashboard/ai", feature: "ai_chat" });

    const userMsg = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);

    const history = messages.map(({ role, content }) => ({ role, content }));

    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await sendChatMessage(
        history,
        trimmed,
        (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              updated[updated.length - 1] = {
                ...last,
                content: last.content + chunk,
              };
            }
            return updated;
          });
        },
        controller.signal
      );
    } catch (err) {
      if (err.name === "AbortError") return;
      const msg = err.message || "שגיאה בתקשורת עם השרת";
      setError(msg);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant" && !last.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [chatInput, isStreaming, messages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt) => {
    trackEvent("ai_workspace_use", { page: "/dashboard/ai", feature: "ai_quick_prompt" });
    handleSend(prompt);
  };

  const handleNewChat = () => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setError("");
    setChatInput("");
    setIsStreaming(false);
  };

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setPromptSeed((s) => s + 1);
      setIsRefreshing(false);
    }, 220);
  };

  const chatbarJSX = (
    <div className="ai-chat-input">
      <input
        placeholder="שאל משהו על הנתונים..."
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isStreaming}
      />
    </div>
  );

  const sendBtnJSX = (
    <div className="ai-chat-actions">
      <button
        className="ai-chat-btn primary"
        aria-label="שליחה"
        onClick={() => handleSend()}
        disabled={isStreaming || !chatInput.trim()}
      >
        {isStreaming ? (
          <span className="ai-btn-spinner" />
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5l-7 7 7 7" />
            <path d="M5 12h14" />
          </svg>
        )}
      </button>
    </div>
  );

  return (
    <div className="ai-page">
      <div className="ai-shell">
        {!hasChat ? (
          <div className="ai-landing">
            <div className="ai-hero">
              <div className="ai-orb" />
              <h1 className="ai-title">היי {displayName}, במה אוכל לעזור?</h1>
              <p className="ai-subtitle">
                ספר לנו מה אתה צריך — ונטפל בכל השאר
              </p>
            </div>

            <div className="ai-chatbar ai-chatbar--hero">
              {chatbarJSX}
              {sendBtnJSX}
            </div>

            {error && <div className="ai-error">{error}</div>}
            {!isAIConfigured() && !error && (
              <div className="ai-warning">
                VITE_OPENAI_API_KEY לא מוגדר. הוסף אותו לקובץ .env כדי להפעיל את העוזר.
              </div>
            )}

            <div className="ai-prompt-section">
              <div className={`ai-prompt-cards ${isRefreshing ? "is-refreshing" : ""}`}>
                {displayedPrompts.map((card) => (
                  <button
                    key={card.prompt}
                    className="ai-prompt-card"
                    onClick={() => handlePromptClick(card.prompt)}
                  >
                    <span className="ai-prompt-card-title">{card.title}</span>
                    <span className="ai-prompt-card-desc">{card.desc}</span>
                  </button>
                ))}
              </div>
              <button
                className="ai-prompt-refresh"
                onClick={handleRefresh}
                aria-label="רענון הצעות"
                type="button"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2v6h-6" />
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="ai-conversation">
              <div className="ai-conversation-header">
                <button className="ai-new-chat-btn" onClick={handleNewChat}>
                  שיחה חדשה
                </button>
              </div>
              <div className="ai-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`ai-message ai-message--${msg.role}`}>
                    <div className="ai-message-avatar">
                      {msg.role === "user" ? (
                        <span className="ai-avatar-user">
                          {displayName.slice(0, 1)}
                        </span>
                      ) : (
                        <span className="ai-avatar-bot" />
                      )}
                    </div>
                    <div className="ai-message-content">
                      {msg.role === "assistant" && !msg.content && isStreaming ? (
                        <span className="ai-typing-indicator">
                          <span /><span /><span />
                        </span>
                      ) : (
                        <div className="ai-message-text" dir="auto">
                          {msg.content.split("\n").map((line, j) => (
                            <span key={j}>
                              {line}
                              {j < msg.content.split("\n").length - 1 && <br />}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {error && <div className="ai-error">{error}</div>}

            <div className="ai-chatbar ai-chatbar--wide">
              {chatbarJSX}
              {sendBtnJSX}
            </div>
          </>
        )}

        <div className="footer">
          Powered by &nbsp; מוקד בסקייל &nbsp; | &nbsp; RevOps Intelligence
        </div>
      </div>
    </div>
  );
}
