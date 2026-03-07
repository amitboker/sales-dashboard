export const smartPrompt = {
  mode: "smart",
  description: "Medium complexity questions, light analysis, quick comparisons.",
  behavior:
    "Allow 1-2 short status updates before the final response. " +
    "The response may include a brief structured breakdown.",
  allowedDelays: "2-4 seconds",
  statusMessages: [
    "מסתכל על הנתונים...",
    "בודק כמה דברים...",
    "עוד רגע...",
    "מסדר את התמונה...",
    "כמעט שם...",
  ],
  statusRotationInterval: 1500, // ms between messages
  maxStatusMessages: 2,
};
