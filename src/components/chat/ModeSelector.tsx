import type { Mode } from "./types";
import { MODES } from "./modes";

interface ModeSelectorProps {
  activeMode: Mode | null;
  onSelect: (mode: Mode | null) => void;
}

export default function ModeSelector({ activeMode, onSelect }: ModeSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-6 flex-wrap">
      {MODES.map((mode) => {
        const isActive = activeMode?.id === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onSelect(isActive ? null : mode)}
            className={`flex items-center gap-1.5 text-sm transition-all duration-200 cursor-pointer py-1 ${
              isActive
                ? "text-[var(--color-primary-darker,#b7dd4c)] font-medium"
                : "text-[var(--color-muted,#828282)] hover:text-[var(--color-text,#000)]"
            }`}
          >
            <span>{mode.label}</span>
            <mode.icon className="h-4 w-4" strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
}
