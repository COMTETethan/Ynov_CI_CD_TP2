import { handle } from 'hono/adapter/node';
import app from '../src/app.js';
export default handle(app);