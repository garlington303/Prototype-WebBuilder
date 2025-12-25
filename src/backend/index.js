import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5174;

// Enable CORS for all origins (use a stricter origin list in production)
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/echo', (req, res) => {
  res.json({ success: true, data: req.body });
});

// Simple proxy to local Ollama server to avoid browser CORS issues.
app.use('/ollama', async (req, res) => {
  try {
    const targetBase = 'http://127.0.0.1:11434';
    const targetPath = req.originalUrl.replace(/^\/ollama/, '');
    const url = `${targetBase}${targetPath}`;

    const headers = { ...req.headers };
    // Remove host to avoid mismatch
    delete headers.host;

    const fetchOptions = {
      method: req.method,
      headers,
      // body will be set only for non-GET/HEAD
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // If express.json() parsed the body, use that; otherwise pipe raw.
      if (req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = JSON.stringify(req.body);
        // Ensure content-type
        fetchOptions.headers = { ...fetchOptions.headers, 'content-type': 'application/json' };
      } else {
        // Fallback: pipe the raw request
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        if (chunks.length > 0) fetchOptions.body = Buffer.concat(chunks);
      }
    }

    const proxied = await fetch(url, fetchOptions);

    res.status(proxied.status);
    proxied.headers.forEach((v, k) => res.setHeader(k, v));
    const body = await proxied.arrayBuffer();
    res.send(Buffer.from(body));
  } catch (err) {
    console.error('Ollama proxy error:', err);
    res.status(502).json({ success: false, error: 'Failed to proxy to Ollama' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});

export default app;
