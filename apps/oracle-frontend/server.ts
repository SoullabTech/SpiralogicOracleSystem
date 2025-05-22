import express from 'express';
import fs from 'fs';
import path from 'path';
import { render } from './dist-ssr/entry-server';

const app = express();
const PORT = process.env.PORT || 5173;

// Serve static assets from client build
app.use(
  '/assets',
  express.static(path.resolve(__dirname, 'dist', 'assets'))
);

// Handle all GET requests
app.get('*', async (req, res) => {
  const indexHtml = fs.readFileSync(path.resolve(__dirname, 'dist', 'index.html'), 'utf-8');
  const { html } = render(req.url);

  const finalHtml = indexHtml.replace(`<!--app-html-->`, html);
  res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
});

app.listen(PORT, () => {
  console.log(`SSR server running at http://localhost:${PORT}`);
});
