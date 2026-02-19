/**
 * Single source of truth for onboarding routing decisions.
 * Reads from user.user_metadata (instant, no async DB call).
 *
 * Returns the path the user should be on, or null if onboarding is complete.
 */
export function getOnboardingTarget(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};

  // Step 1: full name
  if (!meta.full_name) {
    return '/onboarding/name';
  }

  // Step 2: business info
  if (!meta.business_type) {
    return '/onboarding/business';
  }

  // All steps done — check completion flag
  if (!meta.onboarding_completed) {
    return '/onboarding/business'; // shouldn't happen, but safe fallback
  }

  return null; // onboarding complete
}

/**
 * Check if onboarding is fully completed.
 */
export function isOnboardingComplete(user) {
  return getOnboardingTarget(user) === null;
}
