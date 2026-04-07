import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';

const app = new Hono();

// Exemple de route
app.get('/ping', (c) => c.json({ message: 'pong' }));

// Swagger UI
app.route('/docs', swaggerUI({
  url: '/openapi.json',
}));

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
    },
  })
);

export default app;
