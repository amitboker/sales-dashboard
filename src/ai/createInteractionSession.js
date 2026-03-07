import { getBehavior } from "./interactionBehaviorConfig.js";

/**
 * Creates a normalized interaction session object.
 *
 * @param {string} mode              — "instant" | "smart" | "agent"
 * @param {object} [options]
 * @param {string[]} [options.overrideMessages] — custom status messages (replaces defaults)
 * @returns {object} session
 */
export function createInteractionSession(mode, options = {}) {
  const behavior = getBehavior(mode);
  const messages = options.overrideMessages || shuffleAndPick(behavior.statusMessages, behavior.maxMessagesToShow);

  return {
    mode,
    messages,
    timing: {
      minDuration: behavior.minDuration,
      maxDuration: behavior.maxDuration,
      rotationInterval: behavior.rotationInterval,
    },
    allowClarification: behavior.allowClarification,
    showSingleMessageOnly: behavior.showSingleMessageOnly,
  };
}

/**
 * Shuffle an array and optionally limit to `max` items.
 */
function shuffleAndPick(arr, max) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  if (max == null) return shuffled;
  return shuffled.slice(0, max);
}
