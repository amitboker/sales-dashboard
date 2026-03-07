/**
 * Shared behavior configuration for all three AI interaction modes.
 *
 * Each mode defines timing, UX constraints, and Hebrew status messages
 * that control how the Clario AI assistant presents its "thinking" phase.
 */

export const interactionBehavior = {
  instant: {
    minDuration: 800,           // ms
    maxDuration: 2000,          // ms
    rotationInterval: null,     // no rotation — single message only
    maxMessagesToShow: 1,
    allowClarification: false,
    showSingleMessageOnly: true,
    statusMessages: [
      "רגע בודק...",
      "מביא לך את זה...",
      "שנייה מסדר את הנתון...",
      "עוד שנייה...",
      "מחפש...",
    ],
  },

  smart: {
    minDuration: 2000,          // ms
    maxDuration: 4000,          // ms
    rotationInterval: 1500,     // ms between messages
    maxMessagesToShow: 2,
    allowClarification: false,
    showSingleMessageOnly: false,
    statusMessages: [
      "מסתכל על הנתונים...",
      "בודק כמה דברים...",
      "עוד רגע...",
      "מסדר את התמונה...",
      "כמעט שם...",
    ],
  },

  agent: {
    minDuration: 4000,          // ms
    maxDuration: 8000,          // ms
    rotationInterval: 1000,     // ms between messages
    maxMessagesToShow: null,     // rotate until response is ready
    allowClarification: true,
    showSingleMessageOnly: false,
    statusMessages: [
      "מבשל נתונים...",
      "מחפש משהו מעניין...",
      "סורק נתונים...",
      "מצליב מידע...",
      "מעמיק בניתוח...",
      "בודק דפוסים...",
      "מנתח מגמות...",
      "מחבר את הנקודות...",
    ],
  },
};

/**
 * Convenience: get the config for a given mode string.
 */
export function getBehavior(mode) {
  return interactionBehavior[mode] || interactionBehavior.instant;
}
