import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'local-api-chat',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end('Method not allowed');
              return;
            }

            const apiKey = env.OPENAI_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'OPENAI_API_KEY not set in .env' }));
              return;
            }

            let body = '';
            for await (const chunk of req) body += chunk;
            const parsed = JSON.parse(body);

            const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: parsed.model || 'gpt-4o-mini',
                messages: parsed.messages || [],
                stream: true,
                temperature: parsed.temperature ?? 0.3,
                max_tokens: parsed.max_tokens ?? 2048,
              }),
            });

            res.statusCode = upstream.status;
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const reader = upstream.body.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
              }
            } catch (_) {
              // client disconnected
            }
            res.end();
          });
        },
      },
    ],
    server: {
      port: 5173,
      host: true,
      strictPort: false,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
  };
});
