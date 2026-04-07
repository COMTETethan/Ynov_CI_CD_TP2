import { validatePromo } from "../controllers/promoController.js";
import { Hono } from "hono";

const promo = new Hono();

promo.post("/validate", validatePromo);

export default promo;
