import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const VALID_PROVIDERS = new Set(['gohighlevel', 'monday', 'powerlink', 'hubspot']);
const MAX_API_KEY_LENGTH = 512;

const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

async function verifyAuth(req) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

function getServiceClient() {
  const key = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !key) return null;
  return createClient(SUPABASE_URL, key);
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return jsonResponse({ error: 'Server configuration error' }, 500);
  }

  const user = await verifyAuth(req);
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { provider, apiKey } = body;

  if (!provider || !VALID_PROVIDERS.has(provider)) {
    return jsonResponse({ error: 'Invalid provider' }, 400);
  }

  if (!apiKey || typeof apiKey !== 'string' || apiKey.length > MAX_API_KEY_LENGTH) {
    return jsonResponse({ error: 'Invalid API key' }, 400);
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return jsonResponse({ error: 'Server configuration error' }, 500);
  }

  // Look up client by email
  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('id')
    .eq('email', user.email)
    .single();

  if (clientErr || !client) {
    return jsonResponse({ error: 'Client account not found. Complete onboarding first.' }, 404);
  }

  // Upsert integration (one per client+provider)
  const { data: integration, error: upsertErr } = await supabase
    .from('integrations')
    .upsert(
      {
        provider,
        apiKey: apiKey.trim(),
        status: 'connected',
        config: {},
        clientId: client.id,
        updatedAt: new Date().toISOString(),
      },
      { onConflict: 'clientId,provider' }
    )
    .select('id, provider, status, createdAt, updatedAt')
    .single();

  if (upsertErr) {
    return jsonResponse({ error: 'Failed to save integration' }, 500);
  }

  return jsonResponse({
    ok: true,
    integration: {
      id: integration.id,
      provider: integration.provider,
      status: integration.status,
    },
  });
}
