import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Model } from "./types";
import { MODELS } from "./modes";

interface ModelSelectorProps {
  value: Model;
  onChange: (model: Model) => void;
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full bg-[var(--color-surface-muted,#f5f5f5)] border border-[var(--color-border,#e5e5e5)] px-3 py-1.5 text-sm text-[var(--color-muted,#828282)] hover:text-[var(--color-text,#000)] hover:border-[var(--color-primary,#DAFD68)]/40 transition-all duration-200 cursor-pointer"
      >
        <value.icon className="h-3.5 w-3.5 text-[var(--color-primary-darker,#b7dd4c)]" />
        <span>{value.label}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 end-0 rounded-xl bg-white border border-[var(--color-border,#e5e5e5)] shadow-xl py-1.5 z-[60] min-w-[200px] overflow-hidden"
          >
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onChange(model);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 w-full text-start px-4 py-2.5 text-sm transition-all duration-150 cursor-pointer ${
                  value.id === model.id
                    ? "text-[var(--color-primary-darker,#b7dd4c)] bg-[var(--color-primary-light,#f8fde8)]"
                    : "text-[var(--color-muted,#828282)] hover:text-[var(--color-text,#000)] hover:bg-[var(--color-surface-muted,#f5f5f5)]"
                }`}
              >
                <model.icon
                  className={`h-4 w-4 ${
                    value.id === model.id ? "text-[var(--color-primary-darker,#b7dd4c)]" : "text-[var(--color-muted,#828282)]"
                  }`}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{model.label}</span>
                  <span className="text-xs text-[var(--color-muted,#828282)]/60">{model.description}</span>
                </div>
                {value.id === model.id && (
                  <div className="ms-auto h-1.5 w-1.5 rounded-full bg-[var(--color-primary,#DAFD68)]" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
