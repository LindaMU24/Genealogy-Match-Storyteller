import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Person } from '../types.js';

interface GedcomEventDraft {
  date?: string;
  place?: string;
}

interface GedcomPersonDraft {
  id: string;
  nameRaw?: string;
  sex?: string;
  birth?: GedcomEventDraft;
  death?: GedcomEventDraft;
}

interface GedcomFamilyDraft {
  husbandId?: string;
  wifeId?: string;
  childrenIds: string[];
}

interface ImportResult {
  fileName: string;
  people: Person[];
}

const IMPORTS_DIR = path.resolve(process.cwd(), 'data', 'imports');

const addUnique = (target: string[], value?: string) => {
  if (!value) {
    return;
  }
  if (!target.includes(value)) {
    target.push(value);
  }
};

const parseName = (nameRaw: string | undefined) => {
  if (!nameRaw) {
    return { firstName: 'Unknown', lastName: '', fullName: 'Unknown' };
  }

  const normalized = nameRaw.replace(/\//g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return { firstName: 'Unknown', lastName: '', fullName: 'Unknown' };
  }

  const parts = normalized.split(' ');
  const firstName = parts[0] ?? 'Unknown';
  const lastName = parts.slice(1).join(' ');
  return {
    firstName,
    lastName,
    fullName: normalized
  };
};

const toPerson = (draft: GedcomPersonDraft): Person => {
  const parsedName = parseName(draft.nameRaw);

  return {
    id: draft.id,
    firstName: parsedName.firstName,
    lastName: parsedName.lastName,
    fullName: parsedName.fullName,
    gender: draft.sex === 'M' || draft.sex === 'F' ? draft.sex : 'O',
    birth:
      draft.birth && (draft.birth.date || draft.birth.place)
        ? {
            date: draft.birth.date ?? '',
            place: draft.birth.place ?? '',
            type: 'birth'
          }
        : null,
    death:
      draft.death && (draft.death.date || draft.death.place)
        ? {
            date: draft.death.date ?? '',
            place: draft.death.place ?? '',
            type: 'death'
          }
        : null,
    marriage: null,
    parents: [],
    children: [],
    spouses: [],
    sources: [{ title: 'GEDCOM import' }],
    notes: [],
    photos: []
  };
};

const parseGedcom = (content: string): Person[] => {
  const lines = content.split(/\r?\n/);

  const personDrafts = new Map<string, GedcomPersonDraft>();
  const familyDrafts = new Map<string, GedcomFamilyDraft>();

  let activePersonId: string | null = null;
  let activeFamilyId: string | null = null;
  let activeEvent: 'birth' | 'death' | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    const personStartMatch = line.match(/^0\s+@([^@]+)@\s+INDI$/);
    if (personStartMatch) {
      activePersonId = personStartMatch[1];
      activeFamilyId = null;
      activeEvent = null;

      if (!personDrafts.has(activePersonId)) {
        personDrafts.set(activePersonId, { id: activePersonId });
      }
      continue;
    }

    const familyStartMatch = line.match(/^0\s+@([^@]+)@\s+FAM$/);
    if (familyStartMatch) {
      activeFamilyId = familyStartMatch[1];
      activePersonId = null;
      activeEvent = null;

      if (!familyDrafts.has(activeFamilyId)) {
        familyDrafts.set(activeFamilyId, { childrenIds: [] });
      }
      continue;
    }

    if (line.startsWith('0 ')) {
      activePersonId = null;
      activeFamilyId = null;
      activeEvent = null;
      continue;
    }

    if (activePersonId) {
      const draft = personDrafts.get(activePersonId);
      if (!draft) {
        continue;
      }

      const nameMatch = line.match(/^1\s+NAME\s+(.+)$/);
      if (nameMatch) {
        draft.nameRaw = nameMatch[1];
        continue;
      }

      const sexMatch = line.match(/^1\s+SEX\s+([MFOU])$/);
      if (sexMatch) {
        draft.sex = sexMatch[1];
        continue;
      }

      if (/^1\s+BIRT$/.test(line)) {
        activeEvent = 'birth';
        draft.birth = draft.birth ?? {};
        continue;
      }

      if (/^1\s+DEAT$/.test(line)) {
        activeEvent = 'death';
        draft.death = draft.death ?? {};
        continue;
      }

      const dateMatch = line.match(/^2\s+DATE\s+(.+)$/);
      if (dateMatch && activeEvent) {
        if (activeEvent === 'birth') {
          draft.birth = draft.birth ?? {};
          draft.birth.date = dateMatch[1];
        } else {
          draft.death = draft.death ?? {};
          draft.death.date = dateMatch[1];
        }
        continue;
      }

      const placeMatch = line.match(/^2\s+PLAC\s+(.+)$/);
      if (placeMatch && activeEvent) {
        if (activeEvent === 'birth') {
          draft.birth = draft.birth ?? {};
          draft.birth.place = placeMatch[1];
        } else {
          draft.death = draft.death ?? {};
          draft.death.place = placeMatch[1];
        }
        continue;
      }

      if (/^1\s+/.test(line)) {
        activeEvent = null;
      }

      continue;
    }

    if (activeFamilyId) {
      const family = familyDrafts.get(activeFamilyId);
      if (!family) {
        continue;
      }

      const husbandMatch = line.match(/^1\s+HUSB\s+@([^@]+)@$/);
      if (husbandMatch) {
        family.husbandId = husbandMatch[1];
        continue;
      }

      const wifeMatch = line.match(/^1\s+WIFE\s+@([^@]+)@$/);
      if (wifeMatch) {
        family.wifeId = wifeMatch[1];
        continue;
      }

      const childMatch = line.match(/^1\s+CHIL\s+@([^@]+)@$/);
      if (childMatch) {
        addUnique(family.childrenIds, childMatch[1]);
        continue;
      }
    }
  }

  const peopleMap = new Map<string, Person>();
  for (const draft of personDrafts.values()) {
    peopleMap.set(draft.id, toPerson(draft));
  }

  for (const family of familyDrafts.values()) {
    const husband = family.husbandId ? peopleMap.get(family.husbandId) : undefined;
    const wife = family.wifeId ? peopleMap.get(family.wifeId) : undefined;

    if (husband && wife) {
      addUnique(husband.spouses, wife.id);
      addUnique(wife.spouses, husband.id);
    }

    for (const childId of family.childrenIds) {
      const child = peopleMap.get(childId);
      if (!child) {
        continue;
      }

      if (husband) {
        addUnique(child.parents, husband.id);
        addUnique(husband.children, child.id);
      }

      if (wife) {
        addUnique(child.parents, wife.id);
        addUnique(wife.children, child.id);
      }
    }
  }

  return Array.from(peopleMap.values());
};

const findDefaultGedcom = async (): Promise<string | null> => {
  const files = await readdir(IMPORTS_DIR, { withFileTypes: true });
  const entry = files.find((file) => file.isFile() && /\.(ged|gedcom)$/i.test(file.name));
  return entry?.name ?? null;
};

export const importGedcomFile = async (requestedFileName?: string): Promise<ImportResult> => {
  const fileName = requestedFileName ?? (await findDefaultGedcom());

  if (!fileName) {
    throw new Error('No GEDCOM file found in backend/data/imports.');
  }

  if (!/\.(ged|gedcom)$/i.test(fileName)) {
    throw new Error('Only .ged and .gedcom files are allowed.');
  }

  const fullPath = path.resolve(IMPORTS_DIR, fileName);
  const content = await readFile(fullPath, 'utf8');
  const parsedPeople = parseGedcom(content);

  if (!parsedPeople.length) {
    throw new Error('No individuals found in GEDCOM file.');
  }

  return {
    fileName,
    people: parsedPeople
  };
};
