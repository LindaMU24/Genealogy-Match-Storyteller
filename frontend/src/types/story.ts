export interface StorySection {
	title: string;
	content: string;
	period: string;
	relatedArchives: string[];
}

export interface TimelineEvent {
	date: string;
	event: string;
	description: string;
	archiveId?: string;
}

export interface Fact {
	type: 'birth' | 'death' | 'marriage' | 'occupation' | 'location';
	statement: string;
	source: string;
	confidence: number;
}

export interface Story {
	id: string;
	personId: string;
	title: string;
	content: string;
	summary: string;
	sections: StorySection[];
	timeline: TimelineEvent[];
	language: 'sv';
	generatedAt: string;
	model: string;
	referencedArchives: string[];
	facts: Fact[];
}
