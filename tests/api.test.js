/* global Request, Buffer */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { createServer } from "http";

// Pour reset l'état mémoire
let orders = [];

// Patch temporaire pour injecter la mémoire dans l'app
// (à remplacer par une vraie DI si besoin)
app.orders = orders;

// Utilitaires
function makeOrderBody(overrides = {}) {
  return {
    items: [
      { name: "Pizza", price: 12.5, quantity: 2 },
      { name: "Soda", price: 3, quantity: 1 },
    ],
    distance: 5,
    weight: 1,
    promoCode: null,
    hour: 15,
    dayOfWeek: 2,
    ...overrides,
  };
}

describe("API Integration", () => {
  // --- Cas supplémentaires ---
  it("POST /orders/simulate - poids élevé (frais)", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/orders/simulate")
      .send(makeOrderBody({ weight: 10 }));
    expect(res.status).toBe(200);
    expect(res.body.deliveryFee).toBeGreaterThan(0);
  });

  it("POST /orders - promo non cumulable", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/orders")
      .send(makeOrderBody({ promoCode: "PROMO20" }));
    expect(res.status).toBe(201);
    expect(res.body.discount).toBeGreaterThan(0);
  });

  it("POST /orders - promo inconnu", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/orders")
      .send(makeOrderBody({ promoCode: "INCONNU" }));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/promo/i);
  });

  it("POST /orders - hors zone", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/orders")
      .send(makeOrderBody({ distance: 20 }));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/delivery/i);
  });

  it("POST /orders - fermé", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/orders")
      .send(makeOrderBody({ hour: 2 }));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/closed/i);
  });

  it("POST /orders - mauvais type de données", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/orders")
      .send({
        items: "not-an-array",
        distance: 3,
        weight: 1,
        hour: 12,
        dayOfWeek: 2,
      });
    expect(res.status).toBe(400);
  });

  it("GET /orders/:id - id non numérique", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const get = await request(url).get("/orders/abc");
    expect(get.status).toBe(404);
  });

  it("POST /promo/validate - mauvais type de subtotal", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/promo/validate")
      .send({ code: "PROMO20", subtotal: "not-a-number" });
    expect(res.status).toBe(400);
  });

  it("POST /orders/simulate - promo sous le minimum", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/orders/simulate")
      .send(
        makeOrderBody({
          promoCode: "PROMO20",
          items: [{ name: "Soda", price: 3, quantity: 1 }],
        }),
      );
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/promo/i);
  });

  it("GET /ping - pong", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url).get("/ping");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("pong");
  });
  let server;
  beforeEach(() => {
    if (Array.isArray(app.orders)) {
      app.orders.length = 0; // Vide le tableau sans changer la référence
    }
    if ("nextId" in app) {
      app.nextId = 1;
    }
    server = createServer((req, res) => {
      const method = req.method;
      const headers = req.headers;
      const body = [];
      req.on("data", (chunk) => body.push(chunk));
      req.on("end", async () => {
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
        res.writeHead(
          fetchRes.status,
          Object.fromEntries(fetchRes.headers.entries()),
        );
        const buf = Buffer.from(await fetchRes.arrayBuffer());
        res.end(buf);
      });
    });
    server.listen(0);
  });
  afterEach(() => {
    return new Promise((resolve) => server.close(resolve));
  });

  // --- /orders/simulate ---
  it("POST /orders/simulate - commande normale", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/orders/simulate")
      .send(makeOrderBody());
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("subtotal", 28);
    expect(res.body).toHaveProperty("total");
  });
  it("POST /orders/simulate - avec code promo valide", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/orders/simulate")
      .send({
        items: [{ name: "Burger", price: 10, quantity: 2 }],
        distance: 3,
        weight: 2,
        promoCode: "PROMO20",
        hour: 12,
        dayOfWeek: 3,
      });
    expect(res.status).toBe(200);
    expect(res.body.discount).toBe(4);
    expect(res.body.total).toBeLessThan(20);
  });
  it("POST /orders/simulate - code promo expire", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/orders/simulate")
      .send({
        items: [{ name: "Burger", price: 10, quantity: 2 }],
        distance: 3,
        weight: 2,
        promoCode: "EXPIRE",
        hour: 12,
        dayOfWeek: 3,
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/promo/i);
  });
  it("POST /orders/simulate - panier vide", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/orders/simulate")
      .send({ items: [], distance: 3, weight: 1, hour: 12, dayOfWeek: 2 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/empty/i);
  });
  it("POST /orders/simulate - hors zone (>10km)", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/orders/simulate")
      .send(makeOrderBody({ distance: 15 }));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/delivery/i);
  });
  it("POST /orders/simulate - fermé (23h)", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/orders/simulate")
      .send(makeOrderBody({ hour: 23 }));
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/closed/i);
  });
  it("POST /orders/simulate - surge vendredi 20h", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/orders/simulate")
      .send(makeOrderBody({ hour: 20, dayOfWeek: 5 }));
    expect(res.status).toBe(200);
    expect(res.body.surge).toBe(1.8);
    expect(res.body.deliveryFee).toBeGreaterThan(2);
  });

  // --- /orders ---
  it("POST /orders - commande valide", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url).post("/orders").send(makeOrderBody());
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("total");
  });
  it("POST /orders - commande retrouvable via GET", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const post = await request(url).post("/orders").send(makeOrderBody());
    const id = post.body.id;
    const get = await request(url).get(`/orders/${id}`);
    expect(get.status).toBe(200);
    expect(get.body.id).toBe(id);
    expect(get.body.total).toBe(post.body.total);
  });
  it("POST /orders - deux commandes ont deux IDs différents", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const post1 = await request(url).post("/orders").send(makeOrderBody());
    const post2 = await request(url)
      .post("/orders")
      .send(
        makeOrderBody({ items: [{ name: "Burger", price: 10, quantity: 2 }] }),
      );
    expect(post1.body.id).not.toBe(post2.body.id);
  });
  it("POST /orders - commande invalide (panier vide)", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/orders")
      .send({ items: [], distance: 3, weight: 1, hour: 12, dayOfWeek: 2 });
    expect(res.status).toBe(400);
  });
  it("POST /orders - commande invalide n'est pas enregistrée", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    await request(url)
      .post("/orders")
      .send({ items: [], distance: 3, weight: 1, hour: 12, dayOfWeek: 2 });
    // Vérifie qu'aucune commande n'est enregistrée
    expect(app.orders.length).toBe(0);
  });

  // --- /orders/:id ---
  it("GET /orders/:id - id existant", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const post = await request(url).post("/orders").send(makeOrderBody());
    const id = post.body.id;
    const get = await request(url).get(`/orders/${id}`);
    expect(get.status).toBe(200);
    expect(get.body).toHaveProperty("id", id);
    expect(get.body).toHaveProperty("total");
  });
  it("GET /orders/:id - id inexistant", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const get = await request(url).get("/orders/999");
    expect(get.status).toBe(404);
  });
  it("GET /orders/:id - structure retour", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const post = await request(url).post("/orders").send(makeOrderBody());
    const id = post.body.id;
    const get = await request(url).get(`/orders/${id}`);
    expect(get.body).toHaveProperty("subtotal");
    expect(get.body).toHaveProperty("discount");
    expect(get.body).toHaveProperty("deliveryFee");
    expect(get.body).toHaveProperty("surge");
    expect(get.body).toHaveProperty("total");
  });

  // --- /promo/validate ---
  it("POST /promo/validate - code valide", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/promo/validate")
      .send({ code: "PROMO20", subtotal: 30 });
    expect(res.status).toBe(200);
    expect(res.body.discount).toBe(6);
    expect(res.body.newTotal).toBe(24);
  });
  it("POST /promo/validate - code expire", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/promo/validate")
      .send({ code: "EXPIRE", subtotal: 30 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/promo/i);
  });
  it("POST /promo/validate - sous le minimum", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/promo/validate")
      .send({ code: "PROMO20", subtotal: 10 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/promo/i);
  });
  it("POST /promo/validate - code inconnu", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/promo/validate")
      .send({ code: "INCONNU", subtotal: 30 });
    expect(res.status).toBe(404);
  });
  it("POST /promo/validate - sans code", async () => {
    const address = server.address();
    const url = `http://localhost:${address.port}`;
    const res = await request(url)
      .post("/promo/validate")
      .send({ subtotal: 30 });
    expect(res.status).toBe(400);
  });
});
