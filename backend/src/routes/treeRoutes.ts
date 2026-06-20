import { Router } from 'express';
import { people } from '../data/mockData.js';

export const treeRouter = Router();

treeRouter.get('/', (_req, res) => {
  res.json(people);
});
