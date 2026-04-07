import { swaggerUI } from "@hono/swagger-ui";
import { getOpenApiSpec } from "../controllers/swaggerController.js";
import { Hono } from "hono";

const swagger = new Hono();

swagger.get("/docs", swaggerUI({ url: "/openapi.json" }));
swagger.get("/openapi.json", getOpenApiSpec);

export default swagger;
