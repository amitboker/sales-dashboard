import { getBehavior } from "./interactionBehaviorConfig.js";

/* ── Keyword lists by intent ── */

const INSTANT_KEYWORDS = [
  "מה זה",
  "כמה",
  "מתי",
  "איפה",
  "מי",
  "הגדרה",
  "תאריך",
];

const SMART_KEYWORDS = [
  "השווה",
  "מה ההבדל",
  "תסביר",
  "הסבר",
  "סכם",
  "סיכום",
  "תן דוגמה",
  "פרט",
];

const AGENT_KEYWORDS = [
  "נתח",
  "ניתוח",
  "מגמות",
  "דפוסים",
  "ביצועים",
  "אבחון",
  "תחזית",
  "הסבר לעומק",
  "מה הסיבה",
  "סרוק",
  "בדוק לעומק",
  "זהה בעיות",
  "מה קרה עם",
  "למה ירדו",
  "למה עלו",
  "מה המגמה",
  "תבנית",
];

/* ── Length thresholds (characters) ── */

const INSTANT_MAX = 60;
const SMART_MAX = 200;

/* ── Public API ── */

/**
 * Classify a user prompt into an interaction mode.
 * Returns the mode string: "instant" | "smart" | "agent"
 */
export function determineInteractionMode(userPrompt) {
  const { mode } = classifyPrompt(userPrompt);
  return mode;
}

/**
 * Same classification but returns an explanation object for debugging.
 */
export function explainInteractionModeDecision(userPrompt) {
  return classifyPrompt(userPrompt);
}

/**
 * Get the full behavior config for a prompt.
 */
export function getInteractionBehavior(userPrompt) {
  const { mode } = classifyPrompt(userPrompt);
  return getBehavior(mode);
}

/* ── Internal classification ── */

function classifyPrompt(userPrompt) {
  const trimmed = userPrompt.trim();
  const length = trimmed.length;

  const matchedAgent = findKeywords(trimmed, AGENT_KEYWORDS);
  if (matchedAgent.length > 0 || length > SMART_MAX) {
    return {
      mode: "agent",
      reason: matchedAgent.length > 0
        ? `matched agent keywords: [${matchedAgent.join(", ")}]`
        : `prompt length (${length}) exceeds smart threshold (${SMART_MAX})`,
      promptLength: length,
      matchedKeywords: matchedAgent,
    };
  }

  const matchedSmart = findKeywords(trimmed, SMART_KEYWORDS);
  if (matchedSmart.length > 0 || length > INSTANT_MAX) {
    return {
      mode: "smart",
      reason: matchedSmart.length > 0
        ? `matched smart keywords: [${matchedSmart.join(", ")}]`
        : `prompt length (${length}) exceeds instant threshold (${INSTANT_MAX})`,
      promptLength: length,
      matchedKeywords: matchedSmart,
    };
  }

  const matchedInstant = findKeywords(trimmed, INSTANT_KEYWORDS);
  return {
    mode: "instant",
    reason: matchedInstant.length > 0
      ? `matched instant keywords: [${matchedInstant.join(", ")}]`
      : `short prompt (${length} chars), no special keywords`,
    promptLength: length,
    matchedKeywords: matchedInstant,
  };
}

function findKeywords(text, keywords) {
  return keywords.filter((kw) => text.includes(kw));
}
