import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import { calculateOrderTotal, applyPromoCode } from './utils.js';

const app = new Hono();
// Stockage mémoire des commandes
const orders = [];
let nextId = 1;
// Expose pour tests
app.orders = orders;
app.nextId = nextId;
// POST /orders/simulate
app.post('/orders/simulate', async (c) => {
  try {
    const body = await c.req.json();
    const promoCodes = [
      { code: 'PROMO20', type: 'percentage', value: 20, minOrder: 15.00, expiresAt: '2026-12-31' },
      { code: 'FIXE5', type: 'fixed', value: 5, minOrder: 10.00, expiresAt: '2026-12-31' },
      { code: 'EXPIRE', type: 'percentage', value: 10, minOrder: 10.00, expiresAt: '2024-01-01' },
    ];
    const { items, distance, weight, promoCode, hour, dayOfWeek } = body;
    const result = calculateOrderTotal(items, distance, weight, promoCode, hour, dayOfWeek, promoCodes);
    return c.json(result, 200);
  } catch (e) {
    return c.json({ error: e.message }, 400);
  }
});

// POST /orders
app.post('/orders', async (c) => {
  try {
    const body = await c.req.json();
    const promoCodes = [
      { code: 'PROMO20', type: 'percentage', value: 20, minOrder: 15.00, expiresAt: '2026-12-31' },
      { code: 'FIXE5', type: 'fixed', value: 5, minOrder: 10.00, expiresAt: '2026-12-31' },
      { code: 'EXPIRE', type: 'percentage', value: 10, minOrder: 10.00, expiresAt: '2024-01-01' },
    ];
    const { items, distance, weight, promoCode, hour, dayOfWeek } = body;
    const result = calculateOrderTotal(items, distance, weight, promoCode, hour, dayOfWeek, promoCodes);
    // Si le panier est vide ou total <= 0, refuser la commande
    if (!items || !Array.isArray(items) || items.length === 0 || result.total <= 0) {
      return c.json({ error: 'Commande invalide' }, 400);
    }
    // Utilise nextId exposé pour tests
    if ('nextId' in app) {
      if (typeof app.nextId === 'number') nextId = app.nextId;
    }
    // Trouve le prochain id disponible
    let id = nextId;
    while (orders.some(o => o.id === id)) {
      id++;
    }
    const order = { id, ...body, ...result };
    orders.push(order);
    nextId = id + 1;
    app.nextId = nextId;
    return c.json(order, 201);
  } catch (e) {
    return c.json({ error: e.message }, 400);
  }
});

// GET /orders/:id
app.get('/orders/:id', (c) => {
  const id = Number(c.req.param('id'));
  const order = orders.find(o => o.id === id);
  if (!order) return c.json({ error: 'Order not found' }, 404);
  return c.json(order, 200);
});

// POST /promo/validate
app.post('/promo/validate', async (c) => {
  try {
    const body = await c.req.json();
    const promoCodes = [
      { code: 'PROMO20', type: 'percentage', value: 20, minOrder: 15.00, expiresAt: '2026-12-31' },
      { code: 'FIXE5', type: 'fixed', value: 5, minOrder: 10.00, expiresAt: '2026-12-31' },
      { code: 'EXPIRE', type: 'percentage', value: 10, minOrder: 10.00, expiresAt: '2024-01-01' },
    ];
    const { code, subtotal } = body;
    if (!code) return c.json({ error: 'Missing code' }, 400);
    if (typeof subtotal !== 'number') return c.json({ error: 'Missing subtotal' }, 400);
    let after;
    try {
      after = applyPromoCode(subtotal, code, promoCodes);
    } catch (e) {
      if (e.message === 'Unknown promo code') return c.json({ error: e.message }, 404);
      return c.json({ error: e.message }, 400);
    }
    if (after === null) return c.json({ error: 'Promo refused' }, 400);
    return c.json({ subtotal, code, newTotal: after, discount: Math.round((subtotal - after) * 100) / 100 }, 200);
  } catch (e) {
    return c.json({ error: e.message }, 400);
  }
});

// Exemple de route
app.get('/ping', (c) => c.json({ message: 'pong' }));

// Swagger UI (corrigé)
app.get('/docs', swaggerUI({ url: '/openapi.json' }));

// OpenAPI spec minimal
app.get('/openapi.json', (c) =>
  c.json({
    openapi: '3.0.0',
    info: { title: 'TP2 API', version: '1.0.0' },
    paths: {
      '/ping': {
        get: {
          summary: 'Ping route',
          responses: { '200': { description: 'pong' } },
        },
      },
      '/orders/simulate': {
        post: {
          summary: 'Simule une commande',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' }, quantity: { type: 'number' } }, required: ['name', 'price', 'quantity'] } },
                    distance: { type: 'number' },
                    weight: { type: 'number' },
                    promoCode: { type: 'string', nullable: true },
                    hour: { type: 'number' },
                    dayOfWeek: { type: 'number' }
                  },
                  required: ['items', 'distance', 'weight', 'hour', 'dayOfWeek']
                }
              }
            }
          },
          responses: {
            '200': { description: 'Détail du prix', content: { 'application/json': { schema: { type: 'object', properties: { subtotal: { type: 'number' }, discount: { type: 'number' }, deliveryFee: { type: 'number' }, surge: { type: 'number' }, total: { type: 'number' } } } } } },
            '400': { description: 'Erreur de validation' }
          }
        }
      },
      '/orders': {
        post: {
          summary: 'Crée une commande',
          requestBody: { $ref: '#/paths/~1orders~1simulate/post/requestBody' },
          responses: {
            '201': { description: 'Commande créée', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'number' }, items: { type: 'array', items: { type: 'object' } }, distance: { type: 'number' }, weight: { type: 'number' }, promoCode: { type: 'string', nullable: true }, hour: { type: 'number' }, dayOfWeek: { type: 'number' }, subtotal: { type: 'number' }, discount: { type: 'number' }, deliveryFee: { type: 'number' }, surge: { type: 'number' }, total: { type: 'number' } } } } } },
            '400': { description: 'Erreur de validation' }
          }
        }
      },
      '/orders/{id}': {
        get: {
          summary: 'Récupère une commande par ID',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'number' } }
          ],
          responses: {
            '200': { description: 'Commande', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'number' }, items: { type: 'array', items: { type: 'object' } }, distance: { type: 'number' }, weight: { type: 'number' }, promoCode: { type: 'string', nullable: true }, hour: { type: 'number' }, dayOfWeek: { type: 'number' }, subtotal: { type: 'number' }, discount: { type: 'number' }, deliveryFee: { type: 'number' }, surge: { type: 'number' }, total: { type: 'number' } } } } } },
            '404': { description: 'Commande non trouvée' }
          }
        }
      },
      '/promo/validate': {
        post: {
          summary: 'Valide un code promo',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: { type: 'string' },
                    subtotal: { type: 'number' }
                  },
                  required: ['code', 'subtotal']
                }
              }
            }
          },
          responses: {
            '200': { description: 'Promo valide', content: { 'application/json': { schema: { type: 'object', properties: { subtotal: { type: 'number' }, code: { type: 'string' }, newTotal: { type: 'number' }, discount: { type: 'number' } } } } } },
            '400': { description: 'Erreur de validation' },
            '404': { description: 'Code promo inconnu' }
          }
        }
      }
    }
  })
);

export default app;
// Pour tests d'intégration Node.js
export const handler = app.fetch;
