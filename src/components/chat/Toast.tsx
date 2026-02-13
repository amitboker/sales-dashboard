import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

const COLORS = {
  error: {
    bg: "var(--color-danger-bg, #fce8e8)",
    border: "var(--color-danger-border, #f5cccc)",
    text: "var(--color-danger, #d9534f)",
  },
  warning: {
    bg: "var(--color-warning-bg, #fef4d9)",
    border: "var(--color-warning-border, #f5e6b8)",
    text: "var(--color-warning, #f0ad4e)",
  },
  info: {
    bg: "var(--color-surface-muted, #f5f5f5)",
    border: "var(--color-border, #e5e5e5)",
    text: "var(--color-text, #000)",
  },
};

export default function Toast({
  message,
  type = "error",
  duration = 4000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 250); // wait for fade-out
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = COLORS[type];

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0" : "-12px"})`,
        opacity: visible ? 1 : 0,
        transition: "all 0.25s ease",
        zIndex: 9999,
        padding: "10px 20px",
        borderRadius: "12px",
        border: `1px solid ${colors.border}`,
        backgroundColor: colors.bg,
        color: colors.text,
        fontSize: "14px",
        fontWeight: 500,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        pointerEvents: "auto",
        direction: "rtl",
        whiteSpace: "nowrap",
      }}
    >
      {message}
    </div>
  );
}
