import cors from 'cors';
import express from 'express';
import { matchRouter } from './routes/matchRoutes.js';
import { storyRouter } from './routes/storyRoutes.js';
import { treeRouter } from './routes/treeRoutes.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'genealogy-backend' });
});

app.use('/api/tree', treeRouter);
app.use('/api/match', matchRouter);
app.use('/api/story', storyRouter);
