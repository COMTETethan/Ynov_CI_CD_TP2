import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { createServer } from 'http';

// Pour reset l'état mémoire
let orders = [];

// Patch temporaire pour injecter la mémoire dans l'app
// (à remplacer par une vraie DI si besoin)
app.orders = orders;

// Utilitaires
function makeOrderBody(overrides = {}) {
  return {
    items: [
      { name: 'Pizza', price: 12.5, quantity: 2 },
      { name: 'Soda', price: 3, quantity: 1 }
    ],
    distance: 5,
    weight: 1,
    promoCode: null,
    hour: 15,
    dayOfWeek: 2,
    ...overrides
  };
}

describe('API Integration', () => {
  let server;
  beforeEach(() => {
    app.orders = [];
    server = createServer((req, res) => {
      const method = req.method;
      const headers = req.headers;
      const body = [];
      req.on('data', chunk => body.push(chunk));
      req.on('end', async () => {
        // Reconstruire l'URL absolue
        const address = server.address();
        const url = `http://localhost:${address.port}${req.url}`;
        // Créer un objet Request Web standard
        const webReq = new Request(url, {
          method,
          headers,
          body: body.length ? Buffer.concat(body) : undefined,
        });
        const fetchRes = await app.fetch(webReq);
        res.writeHead(fetchRes.status, Object.fromEntries(fetchRes.headers.entries()));
        const buf = Buffer.from(await fetchRes.arrayBuffer());
        res.end(buf);
      });
    });
    server.listen(0);
  });
  afterEach(() => {
    return new Promise((resolve) => server.close(resolve));
  });

  it('POST /orders/simulate - commande normale', async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post('/orders/simulate')
      .send(makeOrderBody());
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('subtotal', 28);
    expect(res.body).toHaveProperty('total');
  });
});
