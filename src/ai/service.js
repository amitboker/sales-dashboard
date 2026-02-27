/**
 * AI Service Layer
 *
 * Assembles: system prompt + dashboard context + user message
 * Sends to OpenAI Chat Completions API via fetch (no SDK).
 * Streams the response for fast, progressive rendering.
 *
 * - Local dev: calls OpenAI directly using VITE_OPENAI_API_KEY from .env
 * - Production: calls /api/chat serverless proxy (key stays server-side)
 */

import { SYSTEM_PROMPT_V1 } from './prompts/system-v1';
import { buildDashboardContext } from './context';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const PROXY_API_URL = '/api/chat';
const MODEL = 'gpt-4o-mini';

function getLocalApiKey() {
  return import.meta.env.VITE_OPENAI_API_KEY || '';
}

/**
 * Build the full system message with dashboard context injected.
 */
function buildSystemMessage() {
  const context = buildDashboardContext();
  const content = SYSTEM_PROMPT_V1.replace('{{DASHBOARD_CONTEXT}}', context);
  return { role: 'system', content };
}

/**
 * Send a chat message and stream the response.
 *
 * @param {Array<{role: string, content: string}>} history - conversation history
 * @param {string} userMessage - the new user message
 * @param {(chunk: string) => void} onChunk - called with each text chunk
 * @param {AbortSignal} [signal] - optional abort signal
 * @returns {Promise<string>} the full assistant response
 */
export async function sendChatMessage(history, userMessage, onChunk, signal) {
  const localKey = getLocalApiKey();
  const useProxy = !localKey;

  const systemMsg = buildSystemMessage();
  const messages = [
    systemMsg,
    ...history,
    { role: 'user', content: userMessage },
  ];

  const requestBody = {
    model: MODEL,
    messages,
    stream: true,
    temperature: 0.3,
    max_tokens: 2048,
  };

  const url = useProxy ? PROXY_API_URL : OPENAI_API_URL;
  const headers = { 'Content-Type': 'application/json' };
  if (!useProxy) {
    headers.Authorization = `Bearer ${localKey}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
    signal,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`OpenAI API error (${res.status}): ${errorBody}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullResponse += delta;
          onChunk(delta);
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  return fullResponse;
}

/**
 * Check if the AI service is configured (API key present).
 * In production, the key lives server-side so we assume configured.
 */
export function isAIConfigured() {
  return import.meta.env.PROD || !!getLocalApiKey();
}
