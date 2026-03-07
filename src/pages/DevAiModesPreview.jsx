import { useState, useCallback } from "react";
import AgentStatus from "../components/ai/AgentStatus";
import { getBehavior } from "../ai/interactionBehaviorConfig";
import { explainInteractionModeDecision } from "../ai/interactionModeRouter";
import { createInteractionSession } from "../ai/createInteractionSession";

const MODES = ["instant", "smart", "agent"];

const MODE_LABELS = {
  instant: "Instant",
  smart: "Smart",
  agent: "Agent",
};

const MODE_DESCRIPTIONS = {
  instant: "תשובות מהירות, הגדרות, שליפת נתון קצר",
  smart: "שאלות בינוניות, ניתוח קל, השוואות",
  agent: "ניתוח עמוק, זיהוי דפוסים, תובנות מורכבות",
};

export default function DevAiModesPreview() {
  const [activeMode, setActiveMode] = useState(null);
  const [testPrompt, setTestPrompt] = useState("");
  const [classification, setClassification] = useState(null);
  const [session, setSession] = useState(null);

  const handleActivate = useCallback((mode) => {
    if (activeMode === mode) {
      setActiveMode(null);
      setSession(null);
      return;
    }
    const s = createInteractionSession(mode);
    setSession(s);
    setActiveMode(mode);
  }, [activeMode]);

  const handleClassify = useCallback(() => {
    if (!testPrompt.trim()) return;
    const result = explainInteractionModeDecision(testPrompt);
    setClassification(result);
  }, [testPrompt]);

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#faf9f6",
        fontFamily: '"Heebo", system-ui, sans-serif',
        padding: "48px 24px",
        maxWidth: "640px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "4px", color: "#1a1a1a" }}>
        AI Interaction Modes — Preview
      </h1>
      <p style={{ fontSize: "13px", color: "#8b8b8b", marginBottom: "32px" }}>
        Developer tool — for internal iteration only
      </p>

      {/* Mode cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
        {MODES.map((mode) => {
          const behavior = getBehavior(mode);
          const isActive = activeMode === mode;
          return (
            <div
              key={mode}
              style={{
                border: isActive ? "1.5px solid #d4f34e" : "1px solid #e5e5e5",
                borderRadius: "14px",
                padding: "20px",
                background: "#fff",
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a" }}>
                    {MODE_LABELS[mode]}
                  </span>
                  <span style={{ fontSize: "12px", color: "#aaa", marginRight: "8px" }}>
                    {behavior.minDuration / 1000}–{behavior.maxDuration / 1000}s
                  </span>
                </div>
                <button
                  onClick={() => handleActivate(mode)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e5e5e5",
                    background: isActive ? "#d4f34e" : "#fff",
                    color: "#1a1a1a",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: 500,
                    transition: "all 0.15s",
                  }}
                >
                  {isActive ? "Stop" : "Preview"}
                </button>
              </div>

              <p style={{ fontSize: "13px", color: "#8b8b8b", margin: "0 0 12px" }}>
                {MODE_DESCRIPTIONS[mode]}
              </p>

              {/* Live AgentStatus preview */}
              <div style={{ minHeight: "28px" }}>
                {isActive && session && (
                  <AgentStatus
                    mode={mode}
                    messages={session.messages.length > 0 ? session.messages : behavior.statusMessages}
                    active={true}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Prompt classifier tester */}
      <div style={{
        border: "1px solid #e5e5e5",
        borderRadius: "14px",
        padding: "20px",
        background: "#fff",
      }}>
        <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", color: "#1a1a1a" }}>
          Prompt Classifier
        </h2>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input
            type="text"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleClassify()}
            placeholder="הקלד prompt לבדיקה..."
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #e5e5e5",
              fontSize: "14px",
              fontFamily: "inherit",
              direction: "rtl",
              outline: "none",
            }}
          />
          <button
            onClick={handleClassify}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              border: "none",
              background: "#1a1a1a",
              color: "#fff",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            Classify
          </button>
        </div>

        {classification && (
          <div style={{
            background: "#fafafa",
            borderRadius: "10px",
            padding: "14px",
            fontSize: "13px",
            color: "#555",
            lineHeight: "1.7",
            direction: "ltr",
            fontFamily: "monospace",
          }}>
            <div><strong>Mode:</strong> {classification.mode}</div>
            <div><strong>Reason:</strong> {classification.reason}</div>
            <div><strong>Length:</strong> {classification.promptLength} chars</div>
            {classification.matchedKeywords.length > 0 && (
              <div><strong>Keywords:</strong> [{classification.matchedKeywords.join(", ")}]</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
