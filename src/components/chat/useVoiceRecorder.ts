import { useState, useRef, useCallback, useEffect } from "react";

export type RecorderState = "idle" | "recording" | "stopped";

/** Preferred MIME types in order */
const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/wav",
];

function getSupportedMime(): string {
  for (const mime of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return "";
}

const MAX_DURATION_S = 60;

export interface UseVoiceRecorderReturn {
  state: RecorderState;
  elapsedSeconds: number;
  analyserNode: AnalyserNode | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const resolveStopRef = useRef<((blob: Blob | null) => void) | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Clean up all resources */
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    recorderRef.current = null;
    chunksRef.current = [];
    setAnalyserNode(null);
    setElapsedSeconds(0);
  }, []);

  /** Cleanup on unmount */
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up AudioContext + AnalyserNode for waveform
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      setAnalyserNode(analyser);

      // Create MediaRecorder
      const mimeType = getSupportedMime();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        if (resolveStopRef.current) {
          resolveStopRef.current(blob);
          resolveStopRef.current = null;
        }
      };

      recorder.start(250); // collect chunks every 250ms
      setState("recording");

      // Start timer
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      // Auto-stop at max duration
      maxTimerRef.current = setTimeout(() => {
        if (recorderRef.current?.state === "recording") {
          recorderRef.current.stop();
          setState("stopped");
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, MAX_DURATION_S * 1000);
    } catch (err: unknown) {
      cleanup();
      setState("idle");
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("נדרשת הרשאת מיקרופון");
      } else {
        setError("שגיאה בהפעלת המיקרופון");
      }
    }
  }, [cleanup]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (!recorderRef.current || recorderRef.current.state !== "recording") {
      return null;
    }

    return new Promise((resolve) => {
      resolveStopRef.current = resolve;
      recorderRef.current!.stop();
      setState("stopped");
      if (timerRef.current) clearInterval(timerRef.current);
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    });
  }, []);

  const cancelRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    resolveStopRef.current = null;
    cleanup();
    setState("idle");
  }, [cleanup]);

  return {
    state,
    elapsedSeconds,
    analyserNode,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
