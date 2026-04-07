import { createOrder, getOrderById, simulateOrder } from "../controllers/ordersController.js";
import { Hono } from "hono";

const orders = new Hono();

orders.post("/simulate", simulateOrder);
orders.post("/", createOrder);
orders.get("/:id", getOrderById);

export default orders;
