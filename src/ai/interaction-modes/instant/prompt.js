export const instantPrompt = {
  mode: "instant",
  description: "Quick factual answers, definitions, short data retrieval, brief explanations.",
  behavior:
    "Respond immediately with a single concise answer. No multi-step workflow. " +
    "Show one brief status message before the response appears.",
  allowedDelays: "1-2 seconds maximum",
  statusMessages: [
    "רגע בודק...",
    "מביא לך את זה...",
    "שנייה מסדר את הנתון...",
    "עוד שנייה...",
    "מחפש...",
  ],
  statusRotationInterval: null, // single message only
  maxStatusMessages: 1,
};
