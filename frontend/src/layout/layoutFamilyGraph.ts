import { Person as ApiPerson } from '../types/person';

export type PersonId = string;

export interface Person {
  id: PersonId;
  name: string;
  birthYear?: number;
  deathYear?: number;
  gender?: 'm' | 'f' | 'u';
}

export interface FamilyUnit {
  id: string;
  partners: PersonId[];
  children: PersonId[];
  parentFamilyId?: string;
}

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  type: 'person' | 'couple' | 'connector';
}

export interface RelationLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'partner' | 'vertical' | 'sibling';
}

export interface PositionedPerson {
  id: string;
  x: number;
  y: number;
  generation: number;
}

export interface FamilyGraphLayout {
  nodes: NodePosition[];
  people: PositionedPerson[];
  lines: RelationLine[];
  familyCenters: Map<string, number>;
  generations: Map<string, number>;
  width: number;
  height: number;
}

export interface NormalizedFamilyGraph {
  persons: Person[];
  families: FamilyUnit[];
}

export const CARD_WIDTH = 148;
export const CARD_HEIGHT = 78;

const PARTNER_GAP = 24;
const CHILD_GAP = 24;
const ROW_GAP = 110;
const MARGIN_X = 42;
const MARGIN_Y = 44;

const parseYear = (value?: string): number | undefined => {
  if (!value) {
    return undefined;
  }

  const match = value.match(/(\d{4})/);
  if (!match) {
    return undefined;
  }

  return Number.parseInt(match[1], 10);
};

const toGraphGender = (gender: ApiPerson['gender']): Person['gender'] => {
  if (gender === 'M') {
    return 'm';
  }
  if (gender === 'F') {
    return 'f';
  }
  return 'u';
};

const sortPeopleStable = (a: Person, b: Person): number => {
  const yearA = a.birthYear ?? Number.MAX_SAFE_INTEGER;
  const yearB = b.birthYear ?? Number.MAX_SAFE_INTEGER;
  if (yearA !== yearB) {
    return yearA - yearB;
  }

  return a.name.localeCompare(b.name, 'sv');
};

const pairKey = (ids: PersonId[]): string => ids.slice().sort().join('|');

const unique = <T,>(items: T[]): T[] => Array.from(new Set(items));

export const normalizeFamilyGraph = (apiPeople: ApiPerson[]): NormalizedFamilyGraph => {
  const persons: Person[] = apiPeople
    .map((person) => ({
      id: person.id,
      name: person.fullName,
      birthYear: parseYear(person.birth?.date ?? undefined),
      deathYear: parseYear(person.death?.date ?? undefined),
      gender: toGraphGender(person.gender),
    }))
    .sort(sortPeopleStable);

  const parentFamilies = new Map<string, FamilyUnit>();

  for (const child of apiPeople) {
    const parentIds = Array.isArray(child.parents) ? child.parents : [];
    if (!parentIds.length) {
      continue;
    }

    const sortedParents = unique(parentIds).sort();
    const id = `fam:${pairKey(sortedParents)}`;
    const existing = parentFamilies.get(id);

    if (existing) {
      existing.children = unique([...existing.children, child.id]).sort();
      continue;
    }

    parentFamilies.set(id, {
      id,
      partners: sortedParents,
      children: [child.id],
    });
  }

  for (const person of apiPeople) {
    const spouseIds = Array.isArray(person.spouses) ? person.spouses : [];
    for (const spouseId of spouseIds) {
      const partners = unique([person.id, spouseId]).sort();
      const id = `fam:${pairKey(partners)}`;

      if (!parentFamilies.has(id)) {
        parentFamilies.set(id, {
          id,
          partners,
          children: [],
        });
      }
    }
  }

  const childToFamily = new Map<PersonId, FamilyUnit>();
  for (const family of parentFamilies.values()) {
    for (const childId of family.children) {
      if (!childToFamily.has(childId)) {
        childToFamily.set(childId, family);
      }
    }
  }

  const families = Array.from(parentFamilies.values())
    .map((family) => {
      const parentFamilyId = family.partners
        .map((partnerId) => childToFamily.get(partnerId)?.id)
        .find(Boolean);

      return {
        ...family,
        parentFamilyId,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  return { persons, families };
};

const findFamilyByChild = (families: FamilyUnit[]): Map<PersonId, FamilyUnit> => {
  const byChild = new Map<PersonId, FamilyUnit>();
  for (const family of families) {
    for (const childId of family.children) {
      if (!byChild.has(childId)) {
        byChild.set(childId, family);
      }
    }
  }
  return byChild;
};

const findRootFamily = (
  focusPersonId: string,
  families: FamilyUnit[],
  rawPeopleById: Map<PersonId, ApiPerson>
): FamilyUnit | null => {
  const focus = rawPeopleById.get(focusPersonId);
  if (!focus) {
    return null;
  }

  const spouseIds = Array.isArray(focus.spouses) ? focus.spouses : [];
  const preferredPartner = spouseIds[0];

  const rankedCandidates = families
    .filter((family) => family.partners.includes(focusPersonId))
    .map((family) => ({
      family,
      score: (preferredPartner && family.partners.includes(preferredPartner) ? 1000 : 0) + family.children.length,
    }))
    .sort((a, b) => b.score - a.score);

  const candidate = rankedCandidates[0]?.family;
  if (candidate) {
    return candidate;
  }

  const spouseId = preferredPartner;
  const partners = spouseId ? unique([focusPersonId, spouseId]).sort() : [focusPersonId];
  const childIds = Array.isArray(focus.children) ? focus.children : [];

  return {
    id: `fam:root:${partners.join('|')}`,
    partners,
    children: childIds.slice().sort(),
  };
};

const placeUnitsForRow = (
  units: Array<{ familyId: string; width: number; desiredCenter: number }>
): Map<string, number> => {
  const sorted = units.slice().sort((a, b) => a.desiredCenter - b.desiredCenter);
  const centers = new Map<string, number>();

  let rightEdge = MARGIN_X;
  for (const unit of sorted) {
    let left = unit.desiredCenter - unit.width / 2;
    if (left < rightEdge) {
      left = rightEdge;
    }
    const center = left + unit.width / 2;
    centers.set(unit.familyId, center);
    rightEdge = left + unit.width + 64;
  }

  return centers;
};

export const layoutFamilyGraph = (
  persons: Person[],
  families: FamilyUnit[],
  focusPersonId: string,
  rawPeople: ApiPerson[]
): FamilyGraphLayout => {
  const rawPeopleById = new Map(rawPeople.map((person) => [person.id, person]));
  const peopleById = new Map(persons.map((person) => [person.id, person]));
  const familyByChild = findFamilyByChild(families);

  const rootFamily = findRootFamily(focusPersonId, families, rawPeopleById);
  if (!rootFamily) {
    return {
      nodes: [],
      people: [],
      lines: [],
      familyCenters: new Map(),
      generations: new Map(),
      width: 0,
      height: 0,
    };
  }

  const positions = new Map<string, { x: number; y: number }>();
  const nodes: NodePosition[] = [];
  const lines: RelationLine[] = [];
  const familyCenters = new Map<string, number>();
  const generations = new Map<string, number>();

  const parentRowY = MARGIN_Y;
  const coupleRowY = MARGIN_Y + ROW_GAP;
  const childRowY = MARGIN_Y + ROW_GAP * 2;

  const rootPartners = rootFamily.partners
    .filter((id) => rawPeopleById.has(id))
    .sort((left, right) => {
      const leftPerson = peopleById.get(left);
      const rightPerson = peopleById.get(right);
      if (!leftPerson || !rightPerson) {
        return left.localeCompare(right);
      }
      return sortPeopleStable(leftPerson, rightPerson);
    });

  const rootWidth = rootPartners.length * CARD_WIDTH + Math.max(rootPartners.length - 1, 0) * PARTNER_GAP;
  const rootCenter = MARGIN_X + 400;
  const rootLeft = rootCenter - rootWidth / 2;

  for (let i = 0; i < rootPartners.length; i += 1) {
    const id = rootPartners[i];
    const x = rootLeft + i * (CARD_WIDTH + PARTNER_GAP);
    positions.set(id, { x, y: coupleRowY });
    nodes.push({ id, x, y: coupleRowY, type: 'person' });
    generations.set(id, 0);
  }

  familyCenters.set(rootFamily.id, rootCenter);
  nodes.push({ id: `couple:${rootFamily.id}`, x: rootCenter, y: coupleRowY + CARD_HEIGHT / 2, type: 'couple' });

  if (rootPartners.length > 1) {
    const left = positions.get(rootPartners[0]);
    const right = positions.get(rootPartners[rootPartners.length - 1]);
    if (left && right) {
      lines.push({
        id: `partner:${rootFamily.id}`,
        x1: left.x + CARD_WIDTH / 2,
        y1: coupleRowY + CARD_HEIGHT / 2,
        x2: right.x + CARD_WIDTH / 2,
        y2: coupleRowY + CARD_HEIGHT / 2,
        type: 'partner',
      });
    }
  }

  const rootChildren = rootFamily.children
    .filter((childId) => rawPeopleById.has(childId))
    .sort((left, right) => {
      const leftPerson = peopleById.get(left);
      const rightPerson = peopleById.get(right);
      if (!leftPerson || !rightPerson) {
        return left.localeCompare(right);
      }
      return sortPeopleStable(leftPerson, rightPerson);
    });

  const childrenWidth = rootChildren.length * CARD_WIDTH + Math.max(rootChildren.length - 1, 0) * CHILD_GAP;
  const childrenLeft = rootCenter - childrenWidth / 2;

  for (let i = 0; i < rootChildren.length; i += 1) {
    const id = rootChildren[i];
    const x = childrenLeft + i * (CARD_WIDTH + CHILD_GAP);
    positions.set(id, { x, y: childRowY });
    nodes.push({ id, x, y: childRowY, type: 'person' });
    generations.set(id, 1);
  }

  const sortedRootChildren = rootChildren;

  const parentFamilies: Array<{ family: FamilyUnit; childId: PersonId }> = [];
  for (const partnerId of rootPartners) {
    const family = familyByChild.get(partnerId);
    if (family) {
      parentFamilies.push({ family, childId: partnerId });
    }
  }

  const parentUnits = parentFamilies
    .map((entry) => {
      const partnerIds = entry.family.partners
        .filter((id) => rawPeopleById.has(id))
        .sort((left, right) => {
          const leftPerson = peopleById.get(left);
          const rightPerson = peopleById.get(right);
          if (!leftPerson || !rightPerson) {
            return left.localeCompare(right);
          }
          return sortPeopleStable(leftPerson, rightPerson);
        });

      if (!partnerIds.length) {
        return null;
      }

      const childPos = positions.get(entry.childId);
      const childCenter = childPos ? childPos.x + CARD_WIDTH / 2 : rootCenter;
      const direction = childCenter < rootCenter ? -1 : 1;
      const desiredCenter = childCenter + direction * 120;
      const width = partnerIds.length * CARD_WIDTH + Math.max(partnerIds.length - 1, 0) * PARTNER_GAP;

      return {
        familyId: entry.family.id,
        childId: entry.childId,
        partnerIds,
        width,
        desiredCenter,
      };
    })
    .filter(
      (unit): unit is { familyId: string; childId: PersonId; partnerIds: PersonId[]; width: number; desiredCenter: number } =>
        Boolean(unit)
    );

  const parentCenters = placeUnitsForRow(parentUnits);

  for (const unit of parentUnits) {
    const center = parentCenters.get(unit.familyId);
    if (center === undefined) {
      continue;
    }

    const left = center - unit.width / 2;
    familyCenters.set(unit.familyId, center);

    for (let i = 0; i < unit.partnerIds.length; i += 1) {
      const id = unit.partnerIds[i];
      const x = left + i * (CARD_WIDTH + PARTNER_GAP);
      positions.set(id, { x, y: parentRowY });
      nodes.push({ id, x, y: parentRowY, type: 'person' });
      generations.set(id, -1);
    }

    nodes.push({ id: `couple:${unit.familyId}`, x: center, y: parentRowY + CARD_HEIGHT / 2, type: 'couple' });

    if (unit.partnerIds.length > 1) {
      const first = positions.get(unit.partnerIds[0]);
      const last = positions.get(unit.partnerIds[unit.partnerIds.length - 1]);
      if (first && last) {
        lines.push({
          id: `partner:${unit.familyId}`,
          x1: first.x + CARD_WIDTH / 2,
          y1: parentRowY + CARD_HEIGHT / 2,
          x2: last.x + CARD_WIDTH / 2,
          y2: parentRowY + CARD_HEIGHT / 2,
          type: 'partner',
        });
      }
    }

    // Create elbow lines from this parent family to its child
    const elbowY = coupleRowY - 20;

    const childPos = positions.get(unit.childId);
    if (!childPos) {
      continue;
    }

    const childCenterX = childPos.x + CARD_WIDTH / 2;

    if (center !== childCenterX) {
      lines.push({
        id: `vertical:up:${unit.familyId}:${unit.childId}`,
        x1: center,
        y1: parentRowY + CARD_HEIGHT / 2,
        x2: center,
        y2: elbowY,
        type: 'vertical',
      });

      lines.push({
        id: `sibling:up:${unit.familyId}:${unit.childId}`,
        x1: Math.min(center, childCenterX),
        y1: elbowY,
        x2: Math.max(center, childCenterX),
        y2: elbowY,
        type: 'sibling',
      });

      lines.push({
        id: `vertical:down:${unit.familyId}:${unit.childId}`,
        x1: childCenterX,
        y1: elbowY,
        x2: childCenterX,
        y2: coupleRowY,
        type: 'vertical',
      });
    }
  }

  const childCenters = sortedRootChildren
    .map((id) => positions.get(id))
    .filter((pos): pos is { x: number; y: number } => Boolean(pos))
    .map((pos) => pos.x + CARD_WIDTH / 2)
    .sort((a, b) => a - b);

  if (childCenters.length) {
    const branchY = coupleRowY + CARD_HEIGHT + 12;
    lines.push({
      id: `vertical:root:${rootFamily.id}`,
      x1: rootCenter,
      y1: coupleRowY + CARD_HEIGHT / 2,
      x2: rootCenter,
      y2: branchY,
      type: 'vertical',
    });

    if (childCenters.length > 1) {
      lines.push({
        id: `sibling:${rootFamily.id}`,
        x1: childCenters[0],
        y1: branchY,
        x2: childCenters[childCenters.length - 1],
        y2: branchY,
        type: 'sibling',
      });
    }

    for (const childId of sortedRootChildren) {
      const pos = positions.get(childId);
      if (!pos) {
        continue;
      }

      const centerX = pos.x + CARD_WIDTH / 2;
      lines.push({
        id: `vertical:child:${rootFamily.id}:${childId}`,
        x1: centerX,
        y1: branchY,
        x2: centerX,
        y2: pos.y,
        type: 'vertical',
      });
    }
  }

  const allX = Array.from(positions.values()).map((pos) => pos.x + CARD_WIDTH);
  const allY = Array.from(positions.values()).map((pos) => pos.y + CARD_HEIGHT);

  const width = Math.max(...allX, 880) + MARGIN_X;
  const height = Math.max(...allY, 420) + MARGIN_Y;

  const people: PositionedPerson[] = Array.from(positions.entries()).map(([id, pos]) => ({
    id,
    x: pos.x,
    y: pos.y,
    generation: generations.get(id) ?? 0,
  }));

  return {
    nodes,
    people,
    lines,
    familyCenters,
    generations,
    width,
    height,
  };
};
