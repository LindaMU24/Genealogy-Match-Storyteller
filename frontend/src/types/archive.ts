export interface MatchedField {
	field: 'name' | 'date' | 'place' | 'relation';
	personValue: string;
	archiveValue: string;
	similarity: number;
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
	imageUrl?: string;
	matchedFields: MatchedField[];
	metadata: Record<string, unknown>;
}
