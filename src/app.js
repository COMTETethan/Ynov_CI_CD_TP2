
import { Hono } from "hono";
import ordersRoutes from "./routes/orders.js";
import promoRoutes from "./routes/promo.js";
import swaggerRoutes from "./routes/swagger.js";
import pingRoutes from "./routes/ping.js";

const app = new Hono();
app.route("/orders", ordersRoutes);
app.route("/promo", promoRoutes);
app.route("/", swaggerRoutes);
app.route("/", pingRoutes);

export default app;
export const handler = app.fetch;
