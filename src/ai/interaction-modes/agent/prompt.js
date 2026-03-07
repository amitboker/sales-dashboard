export const agentPrompt = {
  mode: "agent",
  description:
    "Deep analysis, pattern detection, performance diagnostics, complex insights. " +
    "Simulates an AI analyst working through a problem.",
  behavior:
    "Multi-step agent workflow with rotating status messages. " +
    "May ask a clarification question before continuing. " +
    "Delivers a rich, structured response.",
  allowedDelays: "4-8 seconds",
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
  statusRotationInterval: 1000, // ms between messages
  maxStatusMessages: null, // rotate until response is ready
  clarificationExample: "כדי לדייק את הניתוח — על מה תרצה להתמקד?",
};
