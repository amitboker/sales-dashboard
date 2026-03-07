import { useState, useEffect, useRef } from "react";
import "./AgentStatus.css";

/**
 * Animated AI status indicator with mode-aware behavior.
 *
 * Props:
 *   mode      — "instant" | "smart" | "agent"
 *   messages  — array of Hebrew status strings
 *   active    — whether the status is currently visible
 */
export default function AgentStatus({ mode = "instant", messages = [], active = false }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef(null);

  const config = {
    instant: { interval: null,  max: 1    },
    smart:   { interval: 1500,  max: 2    },
    agent:   { interval: 1000,  max: null  },
  }[mode] || { interval: null, max: 1 };

  useEffect(() => {
    if (!active) {
      setVisible(false);
      setIndex(0);
      clearInterval(intervalRef.current);
      return;
    }

    setVisible(true);
    setIndex(0);

    if (config.interval && messages.length > 1) {
      let step = 0;
      intervalRef.current = setInterval(() => {
        step += 1;
        if (config.max && step >= config.max) {
          clearInterval(intervalRef.current);
          return;
        }
        setIndex((prev) => (prev + 1) % messages.length);
      }, config.interval);
    }

    return () => clearInterval(intervalRef.current);
  }, [active, mode, messages.length]);

  if (!active || !visible || messages.length === 0) return null;

  return (
    <div className="agent-status" data-mode={mode}>
      <span className="agent-status-dot" />
      <span key={index} className="agent-status-text">
        {messages[index]}
      </span>
    </div>
  );
}
