import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpLeft, RefreshCw } from "lucide-react";
import { trackEvent } from "../../lib/tracking";
import { sendChatMessage } from "../../ai/service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import ChatInput from "../../components/chat/ChatInput";
import ModeSelector from "../../components/chat/ModeSelector";
import { MODELS, SAMPLE_PROMPTS, PROMPTS_PER_PAGE } from "../../components/chat/modes";
import DottedBackground from "../../components/DottedBackground";

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
  const abortRef = useRef(null);
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
  }, [messages, isStreaming, isThinking]);

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

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await sendChatMessage(
          history,
          trimmed,
          (chunk) => {
            // First chunk → transition from thinking to streaming
            if (isThinkingRef.current) {
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
        const elapsed = (Date.now() - thinkStartRef.current) / 1000;
        const duration = elapsed < 1 ? Math.round(elapsed * 10) / 10 : Math.round(elapsed);
        // Store duration on the completed assistant message
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant" && last.content) {
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
    setMessages([]);
    setError("");
    setIsStreaming(false);
    setIsThinking(false);
  };

  /* ── Landing state (no messages) ── */
  if (!hasChat) {
    return (
      <div
        className="ai-workspace-container ai-landing"
        style={{ minHeight: "calc(100vh - 140px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 6vh, 72px) 16px 0" }}
      >
        <DottedBackground />
        <div style={{ width: "100%", maxWidth: "48rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
          {/* Plan badge */}
          <div
            onClick={() => navigate("/pricing")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(183, 221, 76, 0.3)",
              backgroundColor: "rgba(218, 253, 104, 0.1)",
              cursor: "pointer",
              marginBottom: "-8px",
              transition: "all 0.2s ease",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(218, 253, 104, 0.16)";
              e.currentTarget.style.borderColor = "rgba(183, 221, 76, 0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(218, 253, 104, 0.1)";
              e.currentTarget.style.borderColor = "rgba(183, 221, 76, 0.3)";
            }}
          >
            <span style={{ fontSize: "12px", color: "#7a9a2e", fontWeight: 450 }}>
              תוכנית חינמית
            </span>
            <span style={{ fontSize: "12px", color: "#7a9a2e", opacity: 0.3 }}>&bull;</span>
            <span style={{ fontSize: "12px", color: "#6b8c24", fontWeight: 550 }}>
              שדרג ל-Pro
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
      <DottedBackground />
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
                {/* Think / stream status */}
                {isActiveThinking && (
                  <div className="chat-think-label">
                    <span className="think-dot" />
                    <span>...חושב</span>
                  </div>
                )}
                {isActiveStream && (
                  <div className="chat-think-label">
                    <span className="think-dot streaming" />
                    <span>...כותב</span>
                  </div>
                )}
                {showDuration && (
                  <div className="chat-think-label done">
                    <span>חשב {msg._thinkDuration < 1 ? `${msg._thinkDuration} שניות` : `${msg._thinkDuration} שניות`}</span>
                  </div>
                )}

                {/* Bubble — always rendered to avoid layout shift */}
                {(isActiveThinking && !msg.content) ? (
                  /* Thinking: just status label, no bubble yet */
                  null
                ) : (
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
                    <span
                      className={isActiveStream && msg.content ? "streaming-cursor" : ""}
                      style={{ whiteSpace: "pre-wrap", unicodeBidi: "plaintext" }}
                    >
                      {msg.content}
                    </span>
                  </div>
                )}
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
        />
      </div>
    </div>
  );
}
