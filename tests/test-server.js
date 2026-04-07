import { handler as honoHandler } from 'hono/node-server';
import app from '../src/app.js';

export default honoHandler(app);
