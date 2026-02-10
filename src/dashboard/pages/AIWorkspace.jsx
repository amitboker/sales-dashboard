import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "../../lib/tracking";
import { sendChatMessage, isAIConfigured } from "../../ai/service";
import { useAuth } from "../../lib/auth";
import ChatInput from "../../components/chat/ChatInput";
import ModeSelector from "../../components/chat/ModeSelector";
import { MODELS, SUGGESTION_CARDS } from "../../components/chat/modes";

export default function AIWorkspace() {
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
  const abortRef = useRef(null);
  const chatEndRef = useRef(null);

  const hasChat = messages.length > 0;

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
    handleSend(text);
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
        className="flex flex-col items-center justify-center px-4"
        style={{ minHeight: "calc(100vh - 140px)" }}
      >
        <div className="w-full max-w-3xl flex flex-col items-center gap-6">
          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-2" style={{ color: "var(--color-text, #000)" }}>
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
          />

          {/* Error / warning */}
          {error && (
            <div className="w-full rounded-xl border px-4 py-3 text-sm text-center" style={{ borderColor: "var(--color-danger-border, #f5cccc)", backgroundColor: "var(--color-danger-bg, #fce8e8)", color: "var(--color-danger, #d9534f)" }}>
              {error}
            </div>
          )}
          {!isAIConfigured() && !error && (
            <div className="w-full rounded-xl border px-4 py-3 text-sm text-center" style={{ borderColor: "var(--color-warning-border, #f5e6b8)", backgroundColor: "var(--color-warning-bg, #fef4d9)", color: "var(--color-warning, #f0ad4e)" }}>
              VITE_OPENAI_API_KEY לא מוגדר. הוסף אותו לקובץ .env כדי להפעיל את
              העוזר.
            </div>
          )}

          {/* Mode selector */}
          <ModeSelector activeMode={activeMode} onSelect={setActiveMode} />

          {/* Suggestion cards */}
          <div className="w-full grid grid-cols-2 gap-3 mt-2">
            {SUGGESTION_CARDS.map((text) => (
              <button
                key={text}
                onClick={() => handleSuggestionClick(text)}
                className="text-start px-5 py-4 rounded-xl border transition-all duration-200 cursor-pointer text-sm"
                style={{
                  borderColor: "var(--color-border, #e5e5e5)",
                  backgroundColor: "var(--color-surface, #fff)",
                  color: "var(--color-muted, #828282)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--color-text, #000)";
                  e.currentTarget.style.borderColor = "var(--color-primary, #DAFD68)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--color-muted, #828282)";
                  e.currentTarget.style.borderColor = "var(--color-border, #e5e5e5)";
                }}
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 pb-4 text-xs text-center" style={{ color: "var(--color-muted, #828282)", opacity: 0.5 }}>
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
        />
      </div>
    </div>
  );
}
