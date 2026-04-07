export function getOpenApiSpec(c) {
  return c.json({
    openapi: "3.0.0",
    info: { title: "TP2 API", version: "1.0.0" },
    paths: {
      "/ping": {
        get: {
          summary: "Ping route",
          responses: { 200: { description: "pong" } },
        },
      },
      "/orders/simulate": {
        post: {
          summary: "Simule une commande",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          price: { type: "number" },
                          quantity: { type: "number" },
                        },
                        required: ["name", "price", "quantity"],
                      },
                    },
                    distance: { type: "number" },
                    weight: { type: "number" },
                    promoCode: { type: "string", nullable: true },
                    hour: { type: "number" },
                    dayOfWeek: { type: "number" },
                  },
                  required: [
                    "items",
                    "distance",
                    "weight",
                    "hour",
                    "dayOfWeek",
                  ],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Détail du prix",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      subtotal: { type: "number" },
                      discount: { type: "number" },
                      deliveryFee: { type: "number" },
                      surge: { type: "number" },
                      total: { type: "number" },
                    },
                  },
                },
              },
            },
            400: { description: "Erreur de validation" },
          },
        },
      },
      "/orders": {
        post: {
          summary: "Crée une commande",
          requestBody: { $ref: "#/paths/~1orders~1simulate/post/requestBody" },
          responses: {
            201: {
              description: "Commande créée",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      items: { type: "array", items: { type: "object" } },
                      distance: { type: "number" },
                      weight: { type: "number" },
                      promoCode: { type: "string", nullable: true },
                      hour: { type: "number" },
                      dayOfWeek: { type: "number" },
                      subtotal: { type: "number" },
                      discount: { type: "number" },
                      deliveryFee: { type: "number" },
                      surge: { type: "number" },
                      total: { type: "number" },
                    },
                  },
                },
              },
            },
            400: { description: "Erreur de validation" },
          },
        },
      },
      "/orders/{id}": {
        get: {
          summary: "Récupère une commande par ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "number" },
            },
          ],
          responses: {
            200: {
              description: "Commande",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "number" },
                      items: { type: "array", items: { type: "object" } },
                      distance: { type: "number" },
                      weight: { type: "number" },
                      promoCode: { type: "string", nullable: true },
                      hour: { type: "number" },
                      dayOfWeek: { type: "number" },
                      subtotal: { type: "number" },
                      discount: { type: "number" },
                      deliveryFee: { type: "number" },
                      surge: { type: "number" },
                      total: { type: "number" },
                    },
                  },
                },
              },
            },
            404: { description: "Commande non trouvée" },
          },
        },
      },
      "/promo/validate": {
        post: {
          summary: "Valide un code promo",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "string" },
                    subtotal: { type: "number" },
                  },
                  required: ["code", "subtotal"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Promo valide",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      subtotal: { type: "number" },
                      code: { type: "string" },
                      newTotal: { type: "number" },
                      discount: { type: "number" },
                    },
                  },
                },
              },
            },
            400: { description: "Erreur de validation" },
            404: { description: "Code promo inconnu" },
          },
        },
      },
    },
  });
}
