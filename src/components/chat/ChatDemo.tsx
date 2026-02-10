import { useState } from "react";
import ChatInput from "./ChatInput";
import ModeSelector from "./ModeSelector";
import type { Mode, Model, ChatSubmitPayload } from "./types";
import { MODELS, SUGGESTION_CARDS } from "./modes";

export default function ChatDemo() {
  const [activeMode, setActiveMode] = useState<Mode | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);

  const handleSubmit = (payload: ChatSubmitPayload) => {
    console.log("Chat submit:", payload);
  };

  return (
    <div
      className="min-h-screen bg-[#F1F1F1] flex flex-col items-center justify-center px-4"
      dir="rtl"
      style={{
        "--color-bg": "#F1F1F1",
        "--color-surface": "#ffffff",
        "--color-surface-muted": "#f5f5f5",
        "--color-border": "#e5e5e5",
        "--color-text": "#000000",
        "--color-muted": "#828282",
        "--color-primary": "#DAFD68",
        "--color-primary-dark": "#c8ec55",
        "--color-primary-darker": "#b7dd4c",
        "--color-primary-soft": "#f3f9d6",
        "--color-primary-light": "#f8fde8",
      } as React.CSSProperties}
    >
      <div className="w-full max-w-3xl flex flex-col items-center gap-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-2 text-black">
          מה תרצו לבנות היום?
        </h1>

        <ChatInput
          activeMode={activeMode}
          onClearMode={() => setActiveMode(null)}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onSubmit={handleSubmit}
          onProClick={() => console.log("Pro clicked")}
        />

        <ModeSelector activeMode={activeMode} onSelect={setActiveMode} />

        <div className="w-full grid grid-cols-2 gap-3 mt-2">
          {SUGGESTION_CARDS.map((text) => (
            <button
              key={text}
              onClick={() => handleSubmit({ text, mode: activeMode, model: selectedModel })}
              className="text-start px-5 py-4 rounded-xl border border-[#e5e5e5] bg-white text-[#828282] text-sm hover:text-black hover:border-[#DAFD68] transition-all duration-200 cursor-pointer"
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
