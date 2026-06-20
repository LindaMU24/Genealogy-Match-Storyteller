import { Router } from 'express';
import { stories } from '../data/mockData.js';

export const storyRouter = Router();

storyRouter.get('/person/:id', (req, res) => {
  const personId = req.params.id;
  const story = stories.find((item) => item.personId === personId);

  if (!story) {
    res.status(404).json({
      message: 'Ingen story hittades för personen.'
    });
    return;
  }

  res.json(story);
});
