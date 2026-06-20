export interface EventInfo {
  date: string;
  place: string;
  type: 'birth' | 'death' | 'marriage' | 'burial';
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: 'M' | 'F' | 'O';
  birth: EventInfo | null;
  death: EventInfo | null;
  marriage: EventInfo | null;
  parents: string[];
  children: string[];
  spouses: string[];
  sources: Array<{ title: string }>;
  notes: string[];
  photos: string[];
}

export interface ArchiveMatch {
  id: string;
  personId: string;
  confidence: number;
  archiveType: 'kyrkobok' | 'folkrakning' | 'passering' | 'testament';
  title: string;
  date: string;
  place: string;
  archiveCollection: string;
  excerpt: string;
  fullText: string;
  matchedFields: Array<{
    field: 'name' | 'date' | 'place' | 'relation';
    personValue: string;
    archiveValue: string;
    similarity: number;
  }>;
  metadata: Record<string, unknown>;
}

export interface Story {
  id: string;
  personId: string;
  title: string;
  summary: string;
  content: string;
  sections: Array<{
    title: string;
    content: string;
    period: string;
    relatedArchives: string[];
  }>;
  timeline: Array<{
    date: string;
    event: string;
    description: string;
    archiveId?: string;
  }>;
  language: 'sv';
  generatedAt: string;
  model: string;
  referencedArchives: string[];
  facts: Array<{
    type: 'birth' | 'death' | 'marriage' | 'occupation' | 'location';
    statement: string;
    source: string;
    confidence: number;
  }>;
}
