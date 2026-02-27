import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB — OpenAI's limit

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

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const user = await verifyAuth(req);
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'AI service unavailable' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const formData = await req.formData();

  // Validate file field
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return new Response(
      JSON.stringify({ error: 'Missing audio file' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return new Response(
      JSON.stringify({ error: 'File too large (max 25MB)' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Build clean FormData — only known fields
  const cleanFormData = new FormData();
  cleanFormData.append('file', file);
  cleanFormData.append('model', 'whisper-1');
  cleanFormData.append('language', 'he');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: cleanFormData,
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
