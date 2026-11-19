interface Env {
  GEMINI_API_KEY?: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
}

interface ChatItem {
  role: 'user' | 'model';
  content: string;
}

const SYSTEM_INSTRUCTION = `You are Zenvo AI, the helpful shopping and customer-support assistant for Zenvo Marketplace in Pakistan.
You can communicate in Urdu, Roman Urdu, and English. Be polite, concise, and practical.
Help visitors understand shopping, orders, product images, and general website navigation.
Never reveal, guess, or invent passwords, private account details, or administrator credentials.
If someone needs administrator access, direct them to use the official sign-in process with their own authorized account.
Do not claim an order or payment has been completed unless the website confirms it.`;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

async function handleAssistant(request: Request, env: Env): Promise<Response> {
  let payload: { message?: unknown; history?: unknown };

  try {
    const rawBody = await request.text();
    if (rawBody.length > 20_000) return json({ error: 'Request is too large.' }, 413);
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: 'Invalid JSON request.' }, 400);
  }

  if (typeof payload.message !== 'string' || !payload.message.trim()) {
    return json({ error: 'Message is required.' }, 400);
  }

  const message = payload.message.trim().slice(0, 4000);
  const history: ChatItem[] = Array.isArray(payload.history)
    ? payload.history.slice(-6).flatMap((item: any) => {
        if (
          item &&
          (item.role === 'user' || item.role === 'model') &&
          typeof item.content === 'string'
        ) {
          return [{ role: item.role, content: item.content.slice(0, 3000) }];
        }
        return [];
      })
    : [];

  if (!env.GEMINI_API_KEY) {
    return json({ error: 'AI service is not configured yet.' }, 503);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const endpoint = new URL(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    );
    endpoint.searchParams.set('key', env.GEMINI_API_KEY);

    const contents = [
      ...history.map((item) => ({
        role: item.role,
        parts: [{ text: item.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const upstream = await fetch(endpoint.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents,
        generationConfig: { maxOutputTokens: 700, temperature: 0.6 },
      }),
      signal: controller.signal,
    });

    if (!upstream.ok) {
      return json({ error: 'AI provider request failed. Please try again later.' }, 502);
    }

    const result: any = await upstream.json();
    const reply = result?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || '')
      .join('')
      .trim();

    if (!reply) return json({ error: 'AI did not return a response.' }, 502);
    return json({ reply });
  } catch {
    return json({ error: 'AI service timed out or is temporarily unavailable.' }, 502);
  } finally {
    clearTimeout(timeout);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/health' && request.method === 'GET') {
      return json({ status: 'ok', platform: 'cloudflare-workers' });
    }

    if (url.pathname === '/api/ai/assistant') {
      if (request.method !== 'POST') {
        return json({ error: 'Method not allowed.' }, 405);
      }
      return handleAssistant(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
