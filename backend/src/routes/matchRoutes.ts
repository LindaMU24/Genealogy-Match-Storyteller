import { Router } from 'express';
import { matches } from '../data/mockData.js';

export const matchRouter = Router();

matchRouter.get('/person/:id', (req, res) => {
  const personId = req.params.id;
  const personMatches = matches.filter((match) => match.personId === personId);

  res.json({
    personId,
    matches: personMatches,
    totalMatches: personMatches.length
  });
});
