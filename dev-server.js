/**
 * Local dev server that mounts Vercel serverless functions as Express routes.
 * Run: node dev-server.js   (starts on port 3001)
 * Vite proxies /api/* to this server.
 */
const http = require('http');
const url = require('url');

// Load env
require('dotenv').config();

const PORT = 3001;

// Map of API routes to their handler modules
const routes = {
  '/api/designer': './api/designer.js',
  '/api/briefs': './api/briefs.js',
  '/api/rates': './api/rates.js',
  '/api/generate': './api/generate.js',
  '/api/quote': './api/quote.js',
  '/api/extract': './api/extract.js',
  '/api/send-email': './api/send-email.js',
  '/api/contract': './api/contract.js',
  '/api/portal': './api/portal.js',
  '/api/project-updates': './api/project-updates.js',
};

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // Find matching route
  const handlerPath = routes[pathname];
  if (!handlerPath) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  // Build a mock Vercel request/response
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    // Attach query and body to req
    req.query = parsed.query || {};
    try {
      req.body = body ? JSON.parse(body) : {};
    } catch {
      req.body = {};
    }

    // The real http.ServerResponse already has setHeader/writeHead.
    // Vercel handlers also call res.status().json(), so we patch those onto
    // the native res object directly.
    let statusCode = 200;
    res.status = (code) => { statusCode = code; return res; };

    const origEnd = res.end.bind(res);
    const origWriteHead = res.writeHead.bind(res);

    res.json = (data) => {
      origWriteHead(statusCode, { 'Content-Type': 'application/json' });
      origEnd(JSON.stringify(data));
    };

    // Patch end to use our statusCode
    res.end = (data) => {
      if (!res.headersSent) {
        origWriteHead(statusCode);
      }
      origEnd(data || '');
    };

    try {
      const handler = require(handlerPath);
      await handler(req, res);
    } catch (err) {
      console.error(`Error in ${pathname}:`, err);
      if (!res.headersSent) {
        origWriteHead(500, { 'Content-Type': 'application/json' });
        origEnd(JSON.stringify({ error: err.message }));
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`API dev server running on http://localhost:${PORT}`);
});
