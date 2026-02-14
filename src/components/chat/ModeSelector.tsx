import { motion } from "framer-motion";
import type { Mode } from "./types";
import { MODES } from "./modes";

interface ModeSelectorProps {
  activeMode: Mode | null;
  onSelect: (mode: Mode | null) => void;
}

export default function ModeSelector({ activeMode, onSelect }: ModeSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {MODES.map((mode) => {
        const isActive = activeMode?.id === mode.id;
        return (
          <motion.button
            key={mode.id}
            onClick={() => onSelect(isActive ? null : mode)}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium transition-all duration-200 cursor-pointer border ${
              isActive
                ? "bg-[var(--color-primary,#DAFD68)]/15 border-[var(--color-primary-darker,#b7dd4c)] text-[var(--color-text,#000)] shadow-[0_0_16px_-4px_rgba(183,221,76,0.4)]"
                : "bg-[var(--color-surface,#fff)] border-[var(--color-border,#e5e5e5)] text-[var(--color-muted,#828282)] hover:border-[var(--color-primary,#DAFD68)]/50 hover:text-[var(--color-text,#000)] hover:bg-[var(--color-surface-muted,#fafafa)]"
            }`}
          >
            <mode.icon
              className={`h-3.5 w-3.5 transition-colors duration-200 ${
                isActive
                  ? "text-[var(--color-primary-darker,#b7dd4c)]"
                  : "text-[var(--color-muted,#828282)]"
              }`}
              strokeWidth={1.5}
            />
            <span>{mode.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
