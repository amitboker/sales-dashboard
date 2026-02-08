import { supabase } from './supabase';

let _sessionId = null;
function getSessionId() {
  if (!_sessionId) {
    _sessionId = sessionStorage.getItem('_sid');
    if (!_sessionId) {
      _sessionId = crypto.randomUUID();
      sessionStorage.setItem('_sid', _sessionId);
    }
  }
  return _sessionId;
}

/**
 * Track an analytics event. Fire-and-forget — never blocks, never throws.
 * @param {string} eventName - e.g. 'page_view', 'login', 'signup'
 * @param {object} [meta] - { page, feature, userId, ...extra }
 */
export function trackEvent(eventName, meta = {}) {
  if (!supabase) return;

  const { page, feature, userId, ...rest } = meta;

  const row = {
    id: crypto.randomUUID(),
    userId: userId || null,
    eventName,
    page: page || null,
    feature: feature || null,
    sessionId: getSessionId(),
    metadata: Object.keys(rest).length > 0 ? rest : null,
    createdAt: new Date().toISOString(),
  };

  supabase.from('analytics_events').insert(row).then(({ error }) => {
    if (error) console.warn('[tracking]', error.message);
  });
}
