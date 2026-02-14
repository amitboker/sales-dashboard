import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpLeft, RefreshCw } from "lucide-react";
import { trackEvent } from "../../lib/tracking";
import { sendChatMessage, isAIConfigured } from "../../ai/service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import ChatInput from "../../components/chat/ChatInput";
import ModeSelector from "../../components/chat/ModeSelector";
import { MODELS, SAMPLE_PROMPTS, PROMPTS_PER_PAGE } from "../../components/chat/modes";

export default function AIWorkspace() {
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
    const demoName = localStorage.getItem("demo_first_name");
    if (demoName && demoName.trim()) return demoName.trim().split(" ")[0];
    return "שם פרטי";
  })();

  const [activeMode, setActiveMode] = useState(null);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const [prefillValue, setPrefillValue] = useState("");
  const abortRef = useRef(null);
  const chatEndRef = useRef(null);

  const hasChat = messages.length > 0;

  // Prompt rotation: track offset per mode to cycle through the pool
  const [promptOffset, setPromptOffset] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getVisiblePrompts = useCallback((modeId) => {
    const pool = SAMPLE_PROMPTS[modeId] || [];
    const offset = promptOffset[modeId] || 0;
    const count = PROMPTS_PER_PAGE;
    // Wrap around the pool
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
    // Stop spin animation after 400ms
    setTimeout(() => setIsRefreshing(false), 400);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = useCallback(
    async (text) => {
      const trimmed = (typeof text === "string" ? text : "").trim();
      if (!trimmed || isStreaming) return;

      setError("");
      trackEvent("ai_workspace_use", {
        page: "/dashboard/ai",
        feature: "ai_chat",
      });

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
    },
    [isStreaming, messages]
  );

  const handleSubmit = (payload) => {
    handleSend(payload.text);
  };

  const handleSuggestionClick = (text) => {
    trackEvent("ai_workspace_use", {
      page: "/dashboard/ai",
      feature: "ai_quick_prompt",
    });
    // Populate input only — do NOT auto-submit
    setPrefillValue(text);
  };

  const handleNewChat = () => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setError("");
    setIsStreaming(false);
  };

  /* ── Landing state (no messages) ── */
  if (!hasChat) {
    return (
      <div
        style={{ minHeight: "calc(100vh - 140px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(24px, 6vh, 72px) 16px 0" }}
      >
        <div style={{ width: "100%", maxWidth: "48rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
          {/* Plan badge — subtle green pill */}
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

          {/* Heading */}
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 300, letterSpacing: "-0.02em", textAlign: "center", marginBottom: "8px", color: "var(--color-text, #000)" }}>
            מה תרצו לבנות היום?
          </h1>

          {/* Chat input */}
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

          {/* Error / warning */}
          {error && (
            <div style={{ width: "100%", borderRadius: "12px", border: "1px solid var(--color-danger-border, #f5cccc)", padding: "12px 16px", fontSize: "14px", textAlign: "center", backgroundColor: "var(--color-danger-bg, #fce8e8)", color: "var(--color-danger, #d9534f)" }}>
              {error}
            </div>
          )}
          {!isAIConfigured() && !error && (
            <div style={{ width: "100%", borderRadius: "12px", border: "1px solid var(--color-warning-border, #f5e6b8)", padding: "12px 16px", fontSize: "14px", textAlign: "center", backgroundColor: "var(--color-warning-bg, #fef4d9)", color: "var(--color-warning, #f0ad4e)" }}>
              VITE_OPENAI_API_KEY לא מוגדר. הוסף אותו לקובץ .env כדי להפעיל את
              העוזר.
            </div>
          )}

          {/* Mode selector chips */}
          <ModeSelector activeMode={activeMode} onSelect={setActiveMode} />

          {/* Conditional sample prompts — only when a chip is selected */}
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
                {/* Header row: label + refresh button */}
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
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

        {/* Footer */}
        <div style={{ marginTop: "auto", paddingTop: "32px", paddingBottom: "16px", fontSize: "12px", textAlign: "center", color: "var(--color-muted, #828282)", opacity: 0.5 }}>
          Powered by &nbsp; מוקד בסקייל &nbsp; | &nbsp; RevOps Intelligence
        </div>
      </div>
    );
  }

  /* ── Conversation state ── */
  return (
    <div
      className="flex flex-col"
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
      <div className="flex-1 overflow-y-auto space-y-4 pb-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={
                msg.role === "user"
                  ? { backgroundColor: "var(--color-primary, #DAFD68)", color: "#0A0A0A" }
                  : { backgroundColor: "var(--color-surface-muted, #f5f5f5)", border: "1px solid var(--color-border, #e5e5e5)", color: "var(--color-muted, #828282)" }
              }
            >
              {msg.role === "user" ? displayName.slice(0, 1) : "AI"}
            </div>

            {/* Bubble */}
            <div
              className="max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              dir="auto"
              style={
                msg.role === "user"
                  ? {
                      backgroundColor: "var(--color-primary-light, #f8fde8)",
                      border: "1px solid var(--color-primary-soft, #f3f9d6)",
                      color: "var(--color-text, #000)",
                    }
                  : {
                      backgroundColor: "var(--color-surface, #fff)",
                      border: "1px solid var(--color-border, #e5e5e5)",
                      color: "var(--color-text, #000)",
                    }
              }
            >
              {msg.role === "assistant" && !msg.content && isStreaming ? (
                <span className="flex gap-1 py-1">
                  <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:0ms]" style={{ backgroundColor: "var(--color-primary, #DAFD68)" }} />
                  <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:150ms]" style={{ backgroundColor: "var(--color-primary, #DAFD68)" }} />
                  <span className="h-2 w-2 rounded-full animate-bounce [animation-delay:300ms]" style={{ backgroundColor: "var(--color-primary, #DAFD68)" }} />
                </span>
              ) : (
                msg.content.split("\n").map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < msg.content.split("\n").length - 1 && <br />}
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border px-4 py-3 text-sm text-center mb-4" style={{ borderColor: "var(--color-danger-border)", backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)" }}>
          {error}
        </div>
      )}

      {/* Chat input (sticky bottom) */}
      <div className="pt-2 pb-4">
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
