import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpLeft, ChevronDown, RefreshCw } from "lucide-react";
import { trackEvent } from "../../lib/tracking";
import { sendChatMessage } from "../../ai/service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import ChatInput from "../../components/chat/ChatInput";
import ModeSelector from "../../components/chat/ModeSelector";
import { MODELS, SAMPLE_PROMPTS, PROMPTS_PER_PAGE } from "../../components/chat/modes";

/* ── Intent-aware activity feed ── */

const ACTIVITY_POOLS = {
  greeting: [
    "מנתח את השאלה…",
    "מכין תשובה…",
  ],
  sales: [
    "סורק את נתוני המכירות…",
    "פותח את נתוני הנציגים…",
    "מאתר את 30 הימים האחרונים…",
    "מחשב יחסי המרה…",
    "מנתח ביצועי צוות…",
    "בודק מגמות הכנסה…",
    "משווה מול תקופה קודמת…",
    "מזהה דפוסים בנתונים…",
    "מכין תובנות…",
    "אוסף נתונים רלוונטיים…",
    "בודק יעדים מול ביצוע…",
    "מסכם ביצועים…",
  ],
  technical: [
    "מנתח את השאלה…",
    "מחפש מידע רלוונטי…",
    "מארגן תשובה…",
  ],
  general: [
    "מעבד את הבקשה…",
    "מנתח את השאלה…",
    "מכין תשובה…",
  ],
};

const INTENT_LINE_COUNTS = {
  greeting:  { min: 2, max: 2 },
  sales:     { min: 3, max: 5 },
  technical: { min: 2, max: 3 },
  general:   { min: 2, max: 3 },
};

const GREETING_RE = /^(היי|הי|שלום|אהלן|בוקר טוב|ערב טוב|לילה טוב|מה נשמע|מה קורה|מה העניינים|הלו|yo|hello|hi|hey)\b/i;

const SALES_KEYWORDS = [
  "מכירות","מכירה","נציג","נציגים","ביצועים","ביצועי","המרה","המרות",
  "סגירה","סגירות","לידים","ליד","פאנל","הכנסה","הכנסות","עסקאות","עסקה",
  "יעד","יעדים","דשבורד","מגמות","צוות","לקוחות","לקוח","תחזית",
  "revenue","sales","leads","funnel","pipeline","conversion",
  "rep","reps","performance","target","deal","deals","kpi",
];

const TECHNICAL_KEYWORDS = [
  "מה אתה","מה את","איך אתה","איך את","תסביר","הסבר",
  "מה זה","איך זה","למה זה","מה אפשר","יכולות","פיצ׳רים",
  "what are you","what can you","how do you","explain",
];

function classifyIntent(text) {
  const t = text.trim();
  if (GREETING_RE.test(t)) return "greeting";
  const lower = t.toLowerCase();
  if (SALES_KEYWORDS.some((kw) => lower.includes(kw))) return "sales";
  if (TECHNICAL_KEYWORDS.some((kw) => lower.includes(kw))) return "technical";
  return "general";
}

function pickActivityLines(intent) {
  const pool = ACTIVITY_POOLS[intent] || ACTIVITY_POOLS.general;
  const { min, max } = INTENT_LINE_COUNTS[intent] || INTENT_LINE_COUNTS.general;
  const count = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function AIWorkspace({ profilePhoto, hasData, isDemo } = {}) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const displayName = (() => {
    if (user && profile) {
      const first = profile.firstName || "";
      const last = profile.lastName || "";
      const full = `${first} ${last}`.trim();
      if (full) return full.split(" ")[0];
      return user.email.split("@")[0];
    }
    return "שם פרטי";
  })();

  const [activeMode, setActiveMode] = useState(null);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState("");
  const [prefillValue, setPrefillValue] = useState("");
  const [activityLines, setActivityLines] = useState([]);
  const [expandedThinking, setExpandedThinking] = useState(new Set());
  const abortRef = useRef(null);
  const activityIntervalRef = useRef(null);
  const chatEndRef = useRef(null);
  const messagesRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const isThinkingRef = useRef(false);
  const thinkStartRef = useRef(0);

  const hasChat = messages.length > 0;

  // Prompt rotation
  const [promptOffset, setPromptOffset] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getVisiblePrompts = useCallback((modeId) => {
    const pool = SAMPLE_PROMPTS[modeId] || [];
    const offset = promptOffset[modeId] || 0;
    const count = PROMPTS_PER_PAGE;
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(pool[(offset + i) % pool.length]);
    }
    return result;
  }, [promptOffset]);

  const handleRefreshPrompts = useCallback((modeId) => {
    setIsRefreshing(true);
    setPromptOffset((prev) => {
      const pool = SAMPLE_PROMPTS[modeId] || [];
      const current = prev[modeId] || 0;
      const next = (current + PROMPTS_PER_PAGE) % pool.length;
      return { ...prev, [modeId]: next };
    });
    setTimeout(() => setIsRefreshing(false), 400);
  }, []);

  /* ── Smart scroll ── */
  const handleMessagesScroll = useCallback(() => {
    const el = messagesRef.current;
    if (!el) return;
    isNearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  useEffect(() => {
    if (!isNearBottomRef.current) return;
    const el = messagesRef.current;
    if (!el) return;
    if (isStreaming || isThinking) {
      requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming, isThinking, activityLines]);

  /* ── Send message ── */
  const handleSend = useCallback(
    async (text) => {
      const trimmed = (typeof text === "string" ? text : "").trim();
      if (!trimmed || isStreaming || isThinking) return;

      setError("");
      trackEvent("ai_workspace_use", {
        page: "/dashboard/ai",
        feature: "ai_chat",
      });

      const history = messages.map(({ role, content }) => ({ role, content }));
      thinkStartRef.current = Date.now();

      // Add user message + empty assistant message immediately
      setMessages((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: "" },
      ]);

      setIsThinking(true);
      isThinkingRef.current = true;

      // Start intent-aware activity simulation
      setActivityLines([]);
      const intent = classifyIntent(trimmed);
      const selectedLines = pickActivityLines(intent);
      let lineIndex = 0;
      activityIntervalRef.current = setInterval(() => {
        if (lineIndex < selectedLines.length) {
          setActivityLines((prev) => [...prev, selectedLines[lineIndex]]);
          lineIndex++;
        } else {
          clearInterval(activityIntervalRef.current);
          activityIntervalRef.current = null;
        }
      }, 600);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await sendChatMessage(
          history,
          trimmed,
          (chunk) => {
            // First chunk → transition from thinking to streaming
            if (isThinkingRef.current) {
              // Clear activity simulation
              if (activityIntervalRef.current) {
                clearInterval(activityIntervalRef.current);
                activityIntervalRef.current = null;
              }
              // Capture thinking duration (time until first real chunk)
              const thinkElapsed = (Date.now() - thinkStartRef.current) / 1000;
              const thinkDuration = thinkElapsed < 1
                ? Math.round(thinkElapsed * 10) / 10
                : Math.round(thinkElapsed);
              // Save activity lines + think duration to the message
              setActivityLines((currentLines) => {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      _activityLines: currentLines,
                      _thinkDuration: thinkDuration,
                    };
                  }
                  return updated;
                });
                return currentLines;
              });
              isThinkingRef.current = false;
              setIsThinking(false);
              setIsStreaming(true);
            }
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
          controller.signal,
          { hasData, isDemo }
        );
      } catch (err) {
        if (activityIntervalRef.current) {
          clearInterval(activityIntervalRef.current);
          activityIntervalRef.current = null;
        }
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
        // Store duration on the completed assistant message (fallback if not set in onChunk)
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant" && last.content && last._thinkDuration == null) {
            const elapsed = (Date.now() - thinkStartRef.current) / 1000;
            const duration = elapsed < 1 ? Math.round(elapsed * 10) / 10 : Math.round(elapsed);
            updated[updated.length - 1] = { ...last, _thinkDuration: duration };
          }
          return updated;
        });
        isThinkingRef.current = false;
        setIsThinking(false);
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, isThinking, messages, hasData, isDemo]
  );

  const handleSubmit = (payload) => {
    handleSend(payload.text);
  };

  const handleSuggestionClick = (text) => {
    trackEvent("ai_workspace_use", {
      page: "/dashboard/ai",
      feature: "ai_quick_prompt",
    });
    setPrefillValue(text);
  };

  const handleNewChat = () => {
    if (abortRef.current) abortRef.current.abort();
    if (activityIntervalRef.current) {
      clearInterval(activityIntervalRef.current);
      activityIntervalRef.current = null;
    }
    setMessages([]);
    setActivityLines([]);
    setExpandedThinking(new Set());
    setError("");
    setIsStreaming(false);
    setIsThinking(false);
  };

  const handleStopStreaming = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    if (activityIntervalRef.current) {
      clearInterval(activityIntervalRef.current);
      activityIntervalRef.current = null;
    }
    setActivityLines([]);
    setIsStreaming(false);
    setIsThinking(false);
    abortRef.current = null;
  }, []);

  /* ── Landing state (no messages) ── */
  if (!hasChat) {
    return (
      <div
        className="ai-workspace-container ai-landing"
        style={{ minHeight: "calc(100vh - 140px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 6vh, 72px) 16px 0" }}
      >
        <div style={{ width: "100%", maxWidth: "48rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
          {/* Early access pill — mirrors marketing site */}
          <div className="ai-early-pill" onClick={() => navigate("/pricing")}>
            <span className="ai-early-pill__fill" />
            <span className="ai-early-pill__badge">חדש</span>
            <span className="ai-early-pill__text">Clario AI · עכשיו בגישה מוקדמת</span>
            <span className="ai-early-pill__arrow-wrap">
              <span className="ai-early-pill__arrow-out">←</span>
              <span className="ai-early-pill__arrow-in">←</span>
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 300, letterSpacing: "-0.02em", textAlign: "center", marginBottom: "8px", color: "var(--color-text, #000)" }}>
            מה תרצו לבנות היום?
          </h1>

          <ChatInput
            activeMode={activeMode}
            onClearMode={() => setActiveMode(null)}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onSubmit={handleSubmit}
            onProClick={() => {}}
            prefillValue={prefillValue}
            onPrefillConsumed={() => setPrefillValue("")}
            isStreaming={isStreaming || isThinking}
            onStop={handleStopStreaming}
          />

          {error && (
            <div style={{ width: "100%", borderRadius: "12px", border: "1px solid var(--color-danger-border, #f5cccc)", padding: "12px 16px", fontSize: "14px", textAlign: "center", backgroundColor: "var(--color-danger-bg, #fce8e8)", color: "var(--color-danger, #d9534f)" }}>
              {error}
            </div>
          )}

          <ModeSelector activeMode={activeMode} onSelect={setActiveMode} />

          <AnimatePresence mode="wait">
            {activeMode && SAMPLE_PROMPTS[activeMode.id] && (
              <motion.div
                key={activeMode.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ width: "100%", marginTop: "8px" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <p style={{ fontSize: "13px", color: "var(--color-muted, #828282)", fontWeight: 400, margin: 0 }}>
                    הצעות ל{activeMode.label}
                  </p>
                  <button
                    onClick={() => handleRefreshPrompts(activeMode.id)}
                    title="הצעות חדשות"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border, #e5e5e5)",
                      backgroundColor: "var(--color-surface, #fff)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      padding: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-primary, #DAFD68)";
                      e.currentTarget.style.backgroundColor = "var(--color-surface-muted, #fafafa)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border, #e5e5e5)";
                      e.currentTarget.style.backgroundColor = "var(--color-surface, #fff)";
                    }}
                  >
                    <RefreshCw
                      style={{
                        width: "13px",
                        height: "13px",
                        color: "var(--color-muted, #828282)",
                        transition: "transform 0.4s ease",
                        transform: isRefreshing ? "rotate(360deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                </div>

                <div className="ai-sample-prompts-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <AnimatePresence mode="wait">
                    {getVisiblePrompts(activeMode.id).map((text, i) => (
                      <motion.button
                        key={text}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2, delay: i * 0.05, ease: "easeOut" }}
                        onClick={() => handleSuggestionClick(text)}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "12px",
                          textAlign: "start",
                          padding: "14px 16px",
                          borderRadius: "14px",
                          border: "1px solid var(--color-border, #e5e5e5)",
                          backgroundColor: "var(--color-surface, #fff)",
                          color: "var(--color-muted, #828282)",
                          fontSize: "13px",
                          lineHeight: "1.5",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          fontFamily: "inherit",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--color-text, #000)";
                          e.currentTarget.style.borderColor = "var(--color-primary, #DAFD68)";
                          e.currentTarget.style.boxShadow = "0 2px 12px -4px rgba(218, 253, 104, 0.2)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--color-muted, #828282)";
                          e.currentTarget.style.borderColor = "var(--color-border, #e5e5e5)";
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <span>{text}</span>
                        <ArrowUpLeft
                          style={{
                            width: "14px",
                            height: "14px",
                            flexShrink: 0,
                            marginTop: "2px",
                            opacity: 0.4,
                            transition: "opacity 0.2s",
                          }}
                        />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ marginTop: "auto", paddingTop: "32px", paddingBottom: "16px", fontSize: "12px", textAlign: "center", color: "var(--color-muted, #828282)", opacity: 0.5 }}>
          Powered by Clario | RevOps Intelligence
        </div>
      </div>
    );
  }

  /* ── Conversation state ── */
  return (
    <div
      className="ai-workspace-container flex flex-col"
      style={{ minHeight: "calc(100vh - 140px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 cursor-pointer"
          style={{
            backgroundColor: "var(--color-primary, #DAFD68)",
            color: "#0A0A0A",
          }}
        >
          שיחה חדשה
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        onScroll={handleMessagesScroll}
        className="flex-1 overflow-y-auto pb-8"
      >
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          const isLast = i === messages.length - 1;
          const isActiveThinking = isLast && !isUser && isThinking;
          const isActiveStream = isLast && !isUser && isStreaming;
          const showDuration = !isUser && msg._thinkDuration != null && !isActiveThinking && !isActiveStream;

          /* ── User message — clean, no avatar ── */
          if (isUser) {
            return (
              <div
                key={i}
                className="chat-msg"
                style={{
                  marginTop: i === 0 ? 0 : 20,
                  display: "flex",
                  justifyContent: "flex-start",
                  direction: "rtl",
                }}
              >
                <div
                  className="chat-bubble chat-bubble-user"
                  dir="rtl"
                  style={{
                    maxWidth: "75%",
                    borderRadius: "16px",
                    padding: "12px 16px",
                    fontSize: "14px",
                    lineHeight: "1.65",
                    textAlign: "right",
                    backgroundColor: "var(--color-primary-light, #f8fde8)",
                    border: "1px solid var(--color-primary-soft, #f3f9d6)",
                    color: "var(--color-text, #000)",
                  }}
                >
                  <span style={{ whiteSpace: "pre-wrap", unicodeBidi: "plaintext" }}>
                    {msg.content}
                  </span>
                </div>
              </div>
            );
          }

          /* ── Assistant message — avatar + status + bubble ── */
          const prevIsAssistant = i > 0 && messages[i - 1].role === "assistant";

          return (
            <div
              key={i}
              className="chat-msg"
              style={{
                marginTop: prevIsAssistant ? 6 : 20,
                display: "flex",
                gap: "12px",
                direction: "rtl",
                maxWidth: "100%",
              }}
            >
              {/* Clario avatar */}
              {!prevIsAssistant ? (
                <img
                  src="/clario-symbol.png"
                  alt="Clario"
                  style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "contain", flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 32, flexShrink: 0 }} />
              )}

              {/* Status line + bubble */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Think status — only during active thinking */}
                {isActiveThinking && (
                  <div className="chat-think-label">
                    <span className="think-dot" />
                    <span>...חושב</span>
                  </div>
                )}
                {/* Stream status — only during active streaming */}
                {isActiveStream && (
                  <div className="chat-think-label">
                    <span className="think-dot streaming" />
                    <span>...כותב</span>
                  </div>
                )}
                {/* Simple duration fallback for messages without activity */}
                {showDuration && !(msg._activityLines || []).length && (
                  <div className="chat-think-label done">
                    <span>חשב {msg._thinkDuration} שניות</span>
                  </div>
                )}

                {/* Bubble */}
                {(() => {
                  const liveLines = isActiveThinking ? activityLines : [];
                  const savedLines = msg._activityLines || [];
                  const hasActivity = savedLines.length > 0;
                  const thinkExpanded = expandedThinking.has(i);
                  const showToggle = !isActiveThinking && hasActivity;

                  // During thinking with no lines yet and no content: no bubble
                  if (isActiveThinking && liveLines.length === 0 && !msg.content) return null;
                  // No content and no activity at all: no bubble
                  if (!msg.content && liveLines.length === 0 && !hasActivity) return null;

                  return (
                    <div
                      className="chat-bubble chat-bubble-ai"
                      dir="rtl"
                      style={{
                        maxWidth: "85%",
                        borderRadius: "16px",
                        padding: "12px 16px",
                        fontSize: "14px",
                        lineHeight: "1.65",
                        textAlign: "right",
                        backgroundColor: "var(--color-surface, #fff)",
                        border: "1px solid var(--color-border, #e5e5e5)",
                        color: "var(--color-text, #000)",
                      }}
                    >
                      {/* LIVE thinking: activity lines appearing one by one */}
                      {isActiveThinking && liveLines.length > 0 && (
                        <div className="agent-activity-feed">
                          {liveLines.map((line, j) => (
                            <div key={j} className="agent-activity-line">
                              <span className="agent-activity-icon">⟡</span>
                              <span>{line}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* STREAMING / COMPLETED: collapsible thinking section */}
                      {showToggle && (
                        <>
                          <button
                            className="agent-thinking-toggle"
                            onClick={() => setExpandedThinking((prev) => {
                              const next = new Set(prev);
                              if (next.has(i)) next.delete(i);
                              else next.add(i);
                              return next;
                            })}
                          >
                            <span className="agent-thinking-toggle__dot" />
                            <span>חשב במשך {msg._thinkDuration ?? "…"} שניות</span>
                            <ChevronDown className={`agent-thinking-toggle__chevron${thinkExpanded ? " expanded" : ""}`} />
                          </button>
                          {thinkExpanded && (
                            <div className="agent-activity-feed agent-activity-feed--revealed">
                              {savedLines.map((line, j) => (
                                <div key={j} className="agent-activity-line">
                                  <span className="agent-activity-icon">⟡</span>
                                  <span>{line}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {/* Divider between thinking section and answer */}
                      {(showToggle || (isActiveThinking && liveLines.length > 0)) && msg.content && (
                        <div className="agent-activity-divider" />
                      )}

                      {/* Final answer content */}
                      <span
                        className={isActiveStream && msg.content ? "streaming-cursor" : ""}
                        style={{ whiteSpace: "pre-wrap", unicodeBidi: "plaintext" }}
                      >
                        {msg.content}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border px-4 py-3 text-sm text-center mb-4" style={{ borderColor: "var(--color-danger-border)", backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)" }}>
          {error}
        </div>
      )}

      {/* Chat input */}
      <div className="chat-input-elevated pt-2 pb-4">
        <ChatInput
          activeMode={activeMode}
          onClearMode={() => setActiveMode(null)}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onSubmit={handleSubmit}
          onProClick={() => {}}
          prefillValue={prefillValue}
          onPrefillConsumed={() => setPrefillValue("")}
          isStreaming={isStreaming || isThinking}
          onStop={handleStopStreaming}
        />
      </div>
    </div>
  );
}
