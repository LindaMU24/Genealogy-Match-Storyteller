import { Router } from 'express';
import { people } from '../data/mockData.js';
import { Person } from '../types.js';
import { importGedcomFile } from '../services/gedcomImportService.js';

export const treeRouter = Router();

let importedPeople: Person[] | null = null;

interface ImportRequestBody {
  fileName?: string;
}

treeRouter.get('/', (_req, res) => {
  res.json(importedPeople ?? people);
});

treeRouter.post('/import', async (req, res) => {
  const body = (req.body ?? {}) as ImportRequestBody;

  try {
    const result = await importGedcomFile(body.fileName);
    importedPeople = result.people;

    res.status(200).json({
      status: 'ok',
      source: result.fileName,
      totalPeople: result.people.length,
      preview: result.people.slice(0, 5)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Import failed.';
    res.status(400).json({
      status: 'error',
      message
    });
  }
});
