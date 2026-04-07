/* eslint-disable no-undef */
import { serve } from '@hono/node-server';
import app from './app.js';

const port = process.env.PORT || 3000;

serve({
  fetch: app.fetch,
  port,
});

console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
