import { useState, useEffect, useRef } from "react";
import { Mic, Paperclip, Sparkles, X } from "lucide-react";
import ModelSelector from "./ModelSelector";
import type { Mode, Model, ChatSubmitPayload } from "./types";
import { MODELS } from "./modes";

/* ── Send arrow icon (Utari-style) ───────────────────────────── */
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
  >
    <path d="M5 5h7a4 4 0 0 1 4 4v8" />
    <polyline points="12 13 16 17 20 13" />
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
        className={`absolute bottom-full mb-2 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white border border-[var(--color-border,#e5e5e5)] px-3 py-1.5 text-xs text-[var(--color-text,#000)] shadow-lg z-50 transition-all duration-200 ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-1 pointer-events-none"
        }`}
      >
        {text}
        <div className="absolute top-full start-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
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
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const handleModelChange = (newModel: Model) => {
    setModel(newModel);
    onModelChange?.(newModel);
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    onSubmit?.({ text: inputValue.trim(), mode: activeMode, model });
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative rounded-[22px] bg-white border border-[var(--color-border,#e5e5e5)] shadow-sm transition-all duration-300 hover:shadow-md focus-within:border-[var(--color-primary,#DAFD68)]/40 focus-within:shadow-[0_0_30px_-10px_rgba(218,253,104,0.15)]">
        {/* ── Pro banner ─────────────────────────────────────── */}
        {showProBanner && (
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

        {/* ── Textarea ───────────────────────────────────────── */}
        <div className="px-5 pt-5 pb-2">
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
        </div>

        {/* ── Bottom toolbar ─────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 pb-4 pt-1">
          {/* Right (RTL start): attach · mic · active-mode chip */}
          <div className="flex items-center gap-1">
            <Tooltip text="העלאת קבצים">
              <button
                className="group relative p-2 rounded-2xl hover:bg-[var(--color-surface-muted,#f5f5f5)] transition-all duration-200 cursor-pointer"
                aria-label="העלאת קבצים"
              >
                <Paperclip className="h-5 w-5 text-[var(--color-muted,#828282)] group-hover:text-[var(--color-text,#000)] transition-colors" />
              </button>
            </Tooltip>

            <Tooltip text="הקלטת הודעה קולית">
              <button
                className="group relative p-2 rounded-2xl hover:bg-[var(--color-surface-muted,#f5f5f5)] transition-all duration-200 cursor-pointer"
                aria-label="הקלטת הודעה קולית"
              >
                <Mic className="h-5 w-5 text-[var(--color-muted,#828282)] group-hover:text-[var(--color-text,#000)] transition-colors" />
              </button>
            </Tooltip>

            {/* active-mode chip */}
            {activeMode && (
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
            <ModelSelector value={model} onChange={handleModelChange} />

            <Tooltip text="שליחה">
              <button
                onClick={handleSubmit}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary,#DAFD68)] hover:bg-[var(--color-primary-dark,#c8ec55)] shadow-sm hover:shadow transition-all duration-200 cursor-pointer active:scale-95"
              >
                <SendArrow />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
