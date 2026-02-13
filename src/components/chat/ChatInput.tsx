import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Paperclip, Sparkles, X, RotateCcw } from "lucide-react";
import ModelSelector from "./ModelSelector";
import RecordingOverlay from "./RecordingOverlay";
import Toast from "./Toast";
import { useVoiceRecorder } from "./useVoiceRecorder";
import { useTranscription } from "./useTranscription";
import type { Mode, Model, ChatSubmitPayload } from "./types";
import { MODELS } from "./modes";

/* ── Send arrow icon (Utari-style: down → curve → right) ───── */
const SendArrow = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block" }}
  >
    <path d="M6 5v6a4 4 0 0 0 4 4h8" />
    <polyline points="14 11 18 15 14 19" />
  </svg>
);

/* ── Animated placeholder prompts ──────────────────────────────── */
const PLACEHOLDER_PROMPTS = [
  "הצג לי את ההכנסות החודשיות...",
  "מי הנציג עם הכי הרבה סגירות?",
  "נתח את משפך המכירות שלנו...",
  "בנה דוח המרות לרבעון האחרון...",
];

/* ── Tooltip ───────────────────────────────────────────────────── */
interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

function Tooltip({ text, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <div
        className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white border border-[var(--color-border,#e5e5e5)] px-3 py-1.5 text-xs text-[var(--color-text,#000)] shadow-lg z-50 transition-all duration-200 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-1 pointer-events-none"
        }`}
      >
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
      </div>
    </div>
  );
}

/* ── ChatInput ─────────────────────────────────────────────────── */
interface ChatInputProps {
  onSubmit?: (payload: ChatSubmitPayload) => void;
  onProClick?: () => void;
  activeMode?: Mode | null;
  onClearMode?: () => void;
  selectedModel?: Model;
  onModelChange?: (model: Model) => void;
}

export default function ChatInput({
  onSubmit,
  onProClick,
  activeMode = null,
  onClearMode,
  selectedModel,
  onModelChange,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [placeholderText, setPlaceholderText] = useState("");
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showProBanner, setShowProBanner] = useState(true);
  const [model, setModel] = useState<Model>(selectedModel || MODELS[0]);
  const [toast, setToast] = useState<{ message: string; type: "error" | "warning" | "info" } | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Voice recording & transcription
  const recorder = useVoiceRecorder();
  const transcription = useTranscription();
  const isVoiceActive = recorder.state === "recording" || transcription.state === "transcribing";

  /* sync controlled model prop */
  useEffect(() => {
    if (selectedModel) setModel(selectedModel);
  }, [selectedModel]);

  /* animated typing placeholder */
  useEffect(() => {
    const currentPrompt = PLACEHOLDER_PROMPTS[currentPromptIndex];
    let charIndex = 0;
    let timeout: ReturnType<typeof setTimeout>;

    if (isTyping) {
      const typeChar = () => {
        if (charIndex <= currentPrompt.length) {
          setPlaceholderText(currentPrompt.slice(0, charIndex));
          charIndex++;
          timeout = setTimeout(typeChar, 50);
        } else {
          timeout = setTimeout(() => setIsTyping(false), 2000);
        }
      };
      typeChar();
    } else {
      const eraseChar = () => {
        const current = PLACEHOLDER_PROMPTS[currentPromptIndex];
        if (charIndex < current.length) {
          setPlaceholderText(current.slice(0, current.length - charIndex));
          charIndex++;
          timeout = setTimeout(eraseChar, 30);
        } else {
          setPlaceholderText("");
          setCurrentPromptIndex((prev) => (prev + 1) % PLACEHOLDER_PROMPTS.length);
          setIsTyping(true);
        }
      };
      eraseChar();
    }

    return () => clearTimeout(timeout);
  }, [currentPromptIndex, isTyping]);

  /* Show recorder errors as toasts */
  useEffect(() => {
    if (recorder.error) {
      setToast({ message: recorder.error, type: "error" });
    }
  }, [recorder.error]);

  const handleModelChange = (newModel: Model) => {
    setModel(newModel);
    onModelChange?.(newModel);
  };

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return;
    onSubmit?.({ text: inputValue.trim(), mode: activeMode, model });
    setInputValue("");
  }, [inputValue, activeMode, model, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  /* ── Voice recording handlers ────────────────────────────────── */
  const handleMicClick = useCallback(async () => {
    if (recorder.state === "recording") return; // already recording
    transcription.reset();
    await recorder.startRecording();
  }, [recorder, transcription]);

  const handleVoiceStop = useCallback(async () => {
    // Check minimum duration
    if (recorder.elapsedSeconds < 1) {
      recorder.cancelRecording();
      setToast({ message: "הקליטו הודעה ארוכה יותר", type: "warning" });
      return;
    }

    const blob = await recorder.stopRecording();
    if (!blob) return;

    const text = await transcription.transcribe(blob);
    if (text) {
      // Auto-fill and auto-send
      onSubmit?.({ text, mode: activeMode, model });
      transcription.reset();
    }
  }, [recorder, transcription, activeMode, model, onSubmit]);

  const handleVoiceCancel = useCallback(() => {
    recorder.cancelRecording();
    transcription.reset();
  }, [recorder, transcription]);

  const handleTranscriptionRetry = useCallback(async () => {
    const text = await transcription.retry();
    if (text) {
      onSubmit?.({ text, mode: activeMode, model });
      transcription.reset();
    }
  }, [transcription, activeMode, model, onSubmit]);

  /* ── Determine what to show in the content area ──────────────── */
  const showRecordingUI = recorder.state === "recording";
  const showProcessingUI = transcription.state === "transcribing";
  const showRetryUI = transcription.state === "error";
  const showTextarea = !showRecordingUI && !showProcessingUI && !showRetryUI;
  const isInputEmpty = !inputValue.trim();

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div
        className={`relative rounded-[22px] bg-white border shadow-sm transition-all duration-300 hover:shadow-md ${
          showRecordingUI
            ? "border-[var(--color-primary,#DAFD68)]/60 shadow-[0_0_24px_-8px_rgba(183,221,76,0.25)]"
            : "border-[var(--color-border,#e5e5e5)] focus-within:border-[var(--color-primary,#DAFD68)]/40 focus-within:shadow-[0_0_30px_-10px_rgba(218,253,104,0.15)]"
        }`}
      >
        {/* ── Pro banner ─────────────────────────────────────── */}
        {showProBanner && !isVoiceActive && (
          <div
            onClick={onProClick}
            className="group flex items-center justify-between px-5 py-3 border-b border-[var(--color-border,#e5e5e5)] cursor-pointer transition-all duration-200 hover:bg-[var(--color-surface-muted,#f5f5f5)]/50"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 text-[var(--color-primary-darker,#b7dd4c)] text-xs font-semibold tracking-wide">
                <Sparkles className="h-3.5 w-3.5" />
                Pro
              </span>
              <span className="text-[13px] text-[var(--color-muted,#828282)] group-hover:text-[var(--color-text,#000)] transition-colors">
                גלו את כל היכולות של Clario Pro
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowProBanner(false);
              }}
              className="p-0.5 rounded hover:bg-[var(--color-surface-muted,#f5f5f5)] transition-colors"
            >
              <X className="h-3.5 w-3.5 text-[var(--color-muted,#828282)]/50 hover:text-[var(--color-muted,#828282)]" />
            </button>
          </div>
        )}

        {/* ── Content area: textarea / recording / processing / retry ── */}
        <div
          className={showTextarea ? "px-5 pt-5 pb-2" : ""}
          style={!showTextarea ? { position: "relative", minHeight: "88px" } : undefined}
        >
          {showRecordingUI && (
            <RecordingOverlay
              isRecording
              isProcessing={false}
              elapsedSeconds={recorder.elapsedSeconds}
              analyserNode={recorder.analyserNode}
              onStop={handleVoiceStop}
              onCancel={handleVoiceCancel}
            />
          )}

          {showProcessingUI && (
            <RecordingOverlay
              isRecording={false}
              isProcessing
              elapsedSeconds={0}
              analyserNode={null}
              onStop={() => {}}
              onCancel={() => {}}
            />
          )}

          {showRetryUI && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                minHeight: "60px",
                direction: "rtl",
              }}
            >
              <span
                style={{
                  color: "var(--color-danger, #d9534f)",
                  fontSize: "14px",
                }}
              >
                {transcription.error}
              </span>
              <button
                onClick={handleTranscriptionRetry}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--color-border, #e5e5e5)",
                  backgroundColor: "transparent",
                  color: "var(--color-text, #000)",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <RotateCcw style={{ width: "14px", height: "14px" }} />
                נסו שוב
              </button>
              <button
                onClick={handleVoiceCancel}
                style={{
                  padding: "6px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--color-border, #e5e5e5)",
                  backgroundColor: "transparent",
                  color: "var(--color-muted, #828282)",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                ביטול
              </button>
            </div>
          )}

          {showTextarea && (
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={inputValue ? "" : placeholderText || "תארו את המשימה שלכם..."}
              className="w-full bg-transparent text-[var(--color-text,#000)] placeholder:text-[var(--color-muted,#828282)]/60 outline-none text-base resize-none min-h-[60px] max-h-[120px] leading-relaxed"
              dir="rtl"
              rows={2}
            />
          )}
        </div>

        {/* ── Bottom toolbar ─────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 pb-4 pt-1">
          {/* Right (RTL start): attach · mic · active-mode chip */}
          <div className="flex items-center gap-1">
            {!isVoiceActive && (
              <Tooltip text="העלאת קבצים">
                <button
                  className="group relative p-2 rounded-2xl hover:bg-[var(--color-surface-muted,#f5f5f5)] transition-all duration-200 cursor-pointer"
                  aria-label="העלאת קבצים"
                >
                  <Paperclip className="h-5 w-5 text-[var(--color-muted,#828282)] group-hover:text-[var(--color-text,#000)] transition-colors" />
                </button>
              </Tooltip>
            )}

            <Tooltip text={recorder.state === "recording" ? "מקליט..." : "הקלטת הודעה קולית"}>
              <button
                onClick={handleMicClick}
                className={`group relative p-2 rounded-2xl transition-all duration-200 cursor-pointer ${
                  recorder.state === "recording"
                    ? "bg-[var(--color-primary,#DAFD68)]/20"
                    : "hover:bg-[var(--color-surface-muted,#f5f5f5)]"
                }`}
                aria-label="הקלטת הודעה קולית"
                disabled={transcription.state === "transcribing"}
              >
                <Mic
                  className={`h-5 w-5 transition-colors ${
                    recorder.state === "recording"
                      ? "text-[var(--color-primary-darker,#b7dd4c)]"
                      : "text-[var(--color-muted,#828282)] group-hover:text-[var(--color-text,#000)]"
                  }`}
                />
              </button>
            </Tooltip>

            {/* active-mode chip */}
            {activeMode && !isVoiceActive && (
              <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-surface-muted,#f5f5f5)] border border-[var(--color-border,#e5e5e5)] px-2.5 py-1 ms-1">
                <activeMode.icon className="h-3.5 w-3.5 text-[var(--color-primary-darker,#b7dd4c)]" strokeWidth={1.5} />
                <span className="text-xs text-[var(--color-text,#000)] font-medium">{activeMode.label}</span>
                <button
                  onClick={onClearMode}
                  className="p-0.5 rounded-full hover:bg-[var(--color-border,#e5e5e5)] transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3 text-[var(--color-muted,#828282)] hover:text-[var(--color-text,#000)]" />
                </button>
              </div>
            )}
          </div>

          {/* Left (RTL end): model selector · send */}
          <div className="flex items-center gap-2.5">
            {!isVoiceActive && (
              <ModelSelector value={model} onChange={handleModelChange} />
            )}

            {!isVoiceActive && (
              <Tooltip text="שליחה">
                <button
                  onClick={handleSubmit}
                  disabled={isInputEmpty}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                    isInputEmpty
                      ? "bg-[var(--color-surface-muted,#f0f0f0)] cursor-default"
                      : "bg-[var(--color-primary,#DAFD68)] hover:bg-[var(--color-primary-dark,#c8ec55)] shadow-sm hover:shadow cursor-pointer active:scale-95"
                  }`}
                >
                  <SendArrow />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
