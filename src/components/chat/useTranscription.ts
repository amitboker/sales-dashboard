import { useState, useRef, useCallback } from "react";

export type TranscriptionState = "idle" | "transcribing" | "done" | "error";

const WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions";
const MIN_BLOB_SIZE = 1000; // ~1KB → too short to be useful

export interface UseTranscriptionReturn {
  state: TranscriptionState;
  text: string | null;
  error: string | null;
  transcribe: (blob: Blob) => Promise<string | null>;
  retry: () => Promise<string | null>;
  reset: () => void;
}

export function useTranscription(): UseTranscriptionReturn {
  const [state, setState] = useState<TranscriptionState>("idle");
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastBlobRef = useRef<Blob | null>(null);

  const doTranscribe = useCallback(async (blob: Blob): Promise<string | null> => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      setError("VITE_OPENAI_API_KEY לא מוגדר");
      setState("error");
      return null;
    }

    if (blob.size < MIN_BLOB_SIZE) {
      setError("הקליטו הודעה ארוכה יותר");
      setState("error");
      return null;
    }

    lastBlobRef.current = blob;
    setState("transcribing");
    setError(null);
    setText(null);

    try {
      // Determine file extension from MIME type
      const mime = blob.type || "audio/webm";
      const ext = mime.includes("mp4") ? "mp4" : mime.includes("wav") ? "wav" : "webm";

      const formData = new FormData();
      formData.append("file", blob, `recording.${ext}`);
      formData.append("model", "whisper-1");
      formData.append("language", "he");

      const res = await fetch(WHISPER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Whisper API error (${res.status}): ${body}`);
      }

      const data = await res.json();
      const transcribedText = data.text?.trim() || "";

      if (!transcribedText) {
        setError("לא זוהה דיבור. נסו שוב.");
        setState("error");
        return null;
      }

      setText(transcribedText);
      setState("done");
      return transcribedText;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "שגיאה בתמלול";
      setError(msg);
      setState("error");
      return null;
    }
  }, []);

  const retry = useCallback(async (): Promise<string | null> => {
    if (!lastBlobRef.current) return null;
    return doTranscribe(lastBlobRef.current);
  }, [doTranscribe]);

  const reset = useCallback(() => {
    setState("idle");
    setText(null);
    setError(null);
    lastBlobRef.current = null;
  }, []);

  return { state, text, error, transcribe: doTranscribe, retry, reset };
}
