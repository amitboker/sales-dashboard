import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "../components/Icon.jsx";
import { trackEvent } from "../../lib/tracking";
import { sendChatMessage, isAIConfigured } from "../../ai/service";

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
  const [messages, setMessages] = useState([]); // {role, content}
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);
  const chatEndRef = useRef(null);

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

  const hasChat = messages.length > 0;

  // Auto-scroll to bottom when messages change
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

    // Build history for API (exclude the new user message, it's passed separately)
    const history = messages.map(({ role, content }) => ({ role, content }));

    setIsStreaming(true);

    // Add a placeholder assistant message that will be filled by streaming
    const assistantIdx = messages.length + 1; // index after adding userMsg
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
      // Remove empty assistant message on error
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

  return (
    <div className="ai-page">
      <div className="ai-shell">
        {!hasChat ? (
          <>
            {/* Hero — shown when no chat yet */}
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

            {/* Quick prompts */}
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
                  onClick={() => handlePromptClick(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Chat conversation view */}
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
          </>
        )}

        {/* Error display */}
        {error && (
          <div className="ai-error">
            {error}
          </div>
        )}

        {/* API key warning */}
        {!isAIConfigured() && !error && (
          <div className="ai-warning">
            ⚠ VITE_OPENAI_API_KEY לא מוגדר. הוסף אותו לקובץ .env כדי להפעיל את העוזר.
          </div>
        )}

        {/* Chat input bar — always visible */}
        <div className="ai-chatbar ai-chatbar--wide">
          <div className="ai-chat-input">
            <Icon name="filter" size={16} style={{ filter: "brightness(0.5)" }} />
            <input
              placeholder="שאל משהו..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
            />
          </div>
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
        </div>

        <div className="footer">
          Powered by &nbsp; מוקד בסקייל &nbsp; | &nbsp; RevOps Intelligence
        </div>
      </div>
    </div>
  );
}
