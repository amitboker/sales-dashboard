import { useEffect, useRef, memo } from "react";
import { X, Square } from "lucide-react";

/* ── Waveform visualizer ─────────────────────────────────────── */
const BAR_COUNT = 7;
const BAR_MIN_H = 5;
const BAR_MAX_H = 26;

interface WaveformProps {
  analyserNode: AnalyserNode | null;
}

const Waveform = memo(function Waveform({ analyserNode }: WaveformProps) {
  const barsRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const dataRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!barsRef.current) return;

    if (analyserNode) {
      dataRef.current = new Uint8Array(analyserNode.frequencyBinCount);

      const draw = () => {
        if (!barsRef.current || !dataRef.current) return;
        analyserNode.getByteFrequencyData(dataRef.current);
        const bars = barsRef.current.children;
        const step = Math.floor(dataRef.current.length / BAR_COUNT);

        for (let i = 0; i < BAR_COUNT; i++) {
          const val = dataRef.current[i * step] / 255;
          const h = BAR_MIN_H + val * (BAR_MAX_H - BAR_MIN_H);
          (bars[i] as HTMLElement).style.height = `${h}px`;
        }
        rafRef.current = requestAnimationFrame(draw);
      };
      draw();
    } else {
      const bars = barsRef.current.children;
      for (let i = 0; i < BAR_COUNT; i++) {
        const el = bars[i] as HTMLElement;
        el.style.animation = `voice-bar-bounce 1s ease-in-out ${i * 0.1}s infinite alternate`;
      }
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [analyserNode]);

  return (
    <div
      ref={barsRef}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        height: `${BAR_MAX_H}px`,
        padding: "0 4px",
      }}
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          style={{
            width: "3.5px",
            height: `${BAR_MIN_H}px`,
            borderRadius: "2px",
            backgroundColor: "var(--color-primary-darker, #b7dd4c)",
            opacity: 0.85,
            transition: "height 0.1s ease-out",
          }}
        />
      ))}
    </div>
  );
});

/* ── Spinner for processing state ────────────────────────────── */
function Spinner() {
  return (
    <div
      style={{
        width: "18px",
        height: "18px",
        border: "2px solid var(--color-border, #e5e5e5)",
        borderTopColor: "var(--color-primary-darker, #b7dd4c)",
        borderRadius: "50%",
        animation: "voice-spin 0.6s linear infinite",
      }}
    />
  );
}

/* ── Format seconds as mm:ss ─────────────────────────────────── */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ── Recording Overlay ───────────────────────────────────────── */
interface RecordingOverlayProps {
  isRecording: boolean;
  isProcessing: boolean;
  elapsedSeconds: number;
  analyserNode: AnalyserNode | null;
  onStop: () => void;
  onCancel: () => void;
}

export default function RecordingOverlay({
  isRecording,
  isProcessing,
  elapsedSeconds,
  analyserNode,
  onStop,
  onCancel,
}: RecordingOverlayProps) {
  if (isProcessing) {
    return (
      <div style={containerStyle}>
        <style>{keyframes}</style>
        <div style={processingInnerStyle}>
          <Spinner />
          <span style={{ color: "var(--color-muted, #828282)", fontSize: "14px" }}>
            מעבד הקלטה...
          </span>
        </div>
      </div>
    );
  }

  if (!isRecording) return null;

  return (
    <div style={containerStyle}>
      <style>{keyframes}</style>

      {/*
        Visual order (LTR reading): [ Stop ]  [ Waveform ]  [ Timer ]  [ Cancel ✕ ]
        In RTL flex, DOM order is reversed visually.
        DOM order: Cancel, Timer, Waveform, Stop → renders as Stop | Waveform | Timer | Cancel
      */}
      <div style={recordingInnerStyle}>
        {/* Cancel (appears far-left in RTL = rightmost in DOM = first child) */}
        <button
          onClick={onCancel}
          style={cancelBtnStyle}
          aria-label="ביטול הקלטה"
        >
          <X style={{ width: "15px", height: "15px" }} />
        </button>

        {/* Timer */}
        <span style={timerStyle}>{formatTime(elapsedSeconds)}</span>

        {/* Waveform */}
        <Waveform analyserNode={analyserNode} />

        {/* Stop (appears far-right in RTL = leftmost in DOM = last child) */}
        <button
          onClick={onStop}
          style={stopBtnStyle}
          aria-label="עצור הקלטה"
        >
          <Square style={{ width: "12px", height: "12px", fill: "currentColor" }} />
        </button>
      </div>
    </div>
  );
}

/* ── Styles ───────────────────────────────────────────────────── */
const containerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  direction: "rtl",
};

const recordingInnerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  width: "100%",
  justifyContent: "center",
};

const processingInnerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  justifyContent: "center",
};

const cancelBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  border: "1px solid var(--color-border, #e5e5e5)",
  backgroundColor: "transparent",
  color: "var(--color-muted, #828282)",
  cursor: "pointer",
  transition: "all 0.15s",
  flexShrink: 0,
};

const stopBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  border: "none",
  backgroundColor: "var(--color-primary, #DAFD68)",
  color: "#fff",
  cursor: "pointer",
  transition: "all 0.2s",
  flexShrink: 0,
  boxShadow: "0 0 12px rgba(218, 253, 104, 0.35), 0 1px 3px rgba(0,0,0,0.06)",
  animation: "voice-stop-glow 2.4s ease-in-out infinite",
};

const timerStyle: React.CSSProperties = {
  fontFamily: "'SF Mono', 'Cascadia Mono', 'Fira Code', monospace",
  fontSize: "15px",
  fontWeight: 600,
  color: "var(--color-text, #000)",
  minWidth: "50px",
  textAlign: "center",
  letterSpacing: "0.8px",
};

/* ── Keyframe animations ─────────────────────────────────────── */
const keyframes = `
@keyframes voice-bar-bounce {
  0% { height: ${BAR_MIN_H}px; }
  100% { height: 20px; }
}
@keyframes voice-spin {
  to { transform: rotate(360deg); }
}
@keyframes voice-stop-glow {
  0%, 100% { box-shadow: 0 0 12px rgba(218, 253, 104, 0.3), 0 1px 3px rgba(0,0,0,0.06); }
  50% { box-shadow: 0 0 18px rgba(218, 253, 104, 0.45), 0 1px 3px rgba(0,0,0,0.06); }
}
`;
