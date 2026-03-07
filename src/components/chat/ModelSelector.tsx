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
  const [isHovered, setIsHovered] = useState(false);
  const [triggerWidth, setTriggerWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Measure trigger width whenever it opens
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [isOpen]);

  const triggerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    height: "36px",
    borderRadius: "14px",
    border: "1px solid",
    padding: "0 14px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    borderColor: isOpen
      ? "rgba(183, 221, 76, 0.6)"
      : isHovered
        ? "rgba(183, 221, 76, 0.45)"
        : "#d4d4d4",
    backgroundColor: isOpen
      ? "rgba(218, 253, 104, 0.1)"
      : isHovered
        ? "rgba(218, 253, 104, 0.05)"
        : "#fff",
    color: isOpen || isHovered ? "#1a1a1a" : "#828282",
  };

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={triggerStyle}
      >
        <ChevronDown
          style={{
            width: "14px",
            height: "14px",
            color: "#aaa",
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
          strokeWidth={2}
        />
        <span>{value.label}</span>
        {value.iconUrl ? (
          <img src={value.iconUrl} alt="" style={{ width: "18px", height: "18px", borderRadius: "4px", objectFit: "contain" }} />
        ) : (
          <value.icon
            style={{ width: "16px", height: "16px", color: "#b7dd4c" }}
            strokeWidth={1.8}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "100%",
              marginTop: "6px",
              right: 0,
              minWidth: triggerWidth > 0 ? `${triggerWidth}px` : "auto",
              borderRadius: "16px",
              backgroundColor: "#fff",
              border: "1px solid #e5e5e5",
              boxShadow: "0 6px 24px -4px rgba(0, 0, 0, 0.1)",
              padding: "6px 0",
              zIndex: 60,
              overflow: "hidden",
            }}
          >
            {MODELS.map((model) => {
              const isSelected = value.id === model.id;
              return (
                <DropdownItem
                  key={model.id}
                  model={model}
                  isSelected={isSelected}
                  onClick={() => {
                    onChange(model);
                    setIsOpen(false);
                  }}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Dropdown item ── */
function DropdownItem({
  model,
  isSelected,
  onClick,
}: {
  model: Model;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        textAlign: "start",
        padding: "10px 14px",
        fontSize: "14px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        border: "none",
        fontFamily: "inherit",
        backgroundColor: isSelected
          ? "rgba(218, 253, 104, 0.18)"
          : hovered
            ? "#f5f5f5"
            : "transparent",
        color: isSelected || hovered ? "#1a1a1a" : "#666",
      }}
    >
      {isSelected && (
        <div
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            backgroundColor: "#7a8a2e",
            flexShrink: 0,
          }}
        />
      )}
      {!isSelected && <div style={{ width: "7px", flexShrink: 0 }} />}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{model.label}</span>
        <span style={{ fontSize: "12px", color: "#aaa", marginTop: "1px" }}>{model.description}</span>
      </div>
      {model.iconUrl ? (
        <img src={model.iconUrl} alt="" style={{ width: "20px", height: "20px", borderRadius: "3px", objectFit: "contain", flexShrink: 0 }} />
      ) : (
        <model.icon
          style={{
            width: "18px",
            height: "18px",
            color: isSelected ? "#b7dd4c" : "#bbb",
            flexShrink: 0,
          }}
          strokeWidth={1.8}
        />
      )}
    </button>
  );
}
