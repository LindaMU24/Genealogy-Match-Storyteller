import { ArchiveMatch } from '../types/archive';
import { Person } from '../types/person';
import { Story } from '../types/story';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_PEOPLE: Person[] = [
	{
		id: 'I1',
		firstName: 'Johan',
		lastName: 'Andersson',
		fullName: 'Johan Andersson',
		gender: 'M',
		birth: { date: '1853-03-15', place: 'Västra Eneby', type: 'birth' },
		death: { date: '1920-11-02', place: 'Kisa', type: 'death' },
		marriage: null,
		parents: ['I2', 'I3'],
		children: ['I4'],
		spouses: ['I5'],
		sources: [{ title: 'Ancestry export' }],
		notes: ['Jordbrukare enligt husförhörslängd.'],
		photos: [],
	},
	{
		id: 'I2',
		firstName: 'Anders',
		lastName: 'Johansson',
		fullName: 'Anders Johansson',
		gender: 'M',
		birth: { date: '1824-07-08', place: 'Västra Eneby', type: 'birth' },
		death: null,
		marriage: null,
		parents: [],
		children: ['I1'],
		spouses: ['I3'],
		sources: [{ title: 'Ancestry export' }],
		notes: [],
		photos: [],
	},
	{
		id: 'I3',
		firstName: 'Anna',
		lastName: 'Persdotter',
		fullName: 'Anna Persdotter',
		gender: 'F',
		birth: { date: '1830-01-12', place: 'Västra Eneby', type: 'birth' },
		death: null,
		marriage: null,
		parents: [],
		children: ['I1'],
		spouses: ['I2'],
		sources: [{ title: 'Ancestry export' }],
		notes: [],
		photos: [],
	},
	{
		id: 'I4',
		firstName: 'Karl',
		lastName: 'Johansson',
		fullName: 'Karl Johansson',
		gender: 'M',
		birth: { date: '1878-09-24', place: 'Kisa', type: 'birth' },
		death: null,
		marriage: null,
		parents: ['I1', 'I5'],
		children: [],
		spouses: [],
		sources: [{ title: 'Ancestry export' }],
		notes: [],
		photos: [],
	},
	{
		id: 'I5',
		firstName: 'Maria',
		lastName: 'Larsdotter',
		fullName: 'Maria Larsdotter',
		gender: 'F',
		birth: { date: '1858-04-03', place: 'Horn', type: 'birth' },
		death: null,
		marriage: { date: '1877-06-09', place: 'Kisa', type: 'marriage' },
		parents: [],
		children: ['I4'],
		spouses: ['I1'],
		sources: [{ title: 'Ancestry export' }],
		notes: [],
		photos: [],
	},
];

const MOCK_MATCHES: ArchiveMatch[] = [
	{
		id: 'RA_456789',
		personId: 'I1',
		confidence: 0.92,
		archiveType: 'kyrkobok',
		title: 'Födelsebok 1853-1862, Västra Eneby',
		date: '1853-03-15',
		place: 'Västra Eneby',
		archiveCollection: 'HA, HA0101',
		excerpt: 'Johan Andersson, född 15 mars 1853 i Västra Eneby.',
		fullText: 'Transkriberad text för dop- och födelsebok.',
		matchedFields: [
			{
				field: 'name',
				personValue: 'Johan Andersson',
				archiveValue: 'Johan Andersson',
				similarity: 1,
			},
			{
				field: 'date',
				personValue: '1853-03-15',
				archiveValue: '1853-03-15',
				similarity: 1,
			},
		],
		metadata: {},
	},
	{
		id: 'RA_981245',
		personId: 'I1',
		confidence: 0.84,
		archiveType: 'folkrakning',
		title: 'Folkräkning 1890, Kisa socken',
		date: '1890-01-01',
		place: 'Kisa',
		archiveCollection: 'SE/RA/730001',
		excerpt: 'Johan Andersson, hemmansägare med hustru Maria och son Karl.',
		fullText: 'Transkriberad text ur folkräkningen 1890.',
		matchedFields: [
			{
				field: 'place',
				personValue: 'Kisa',
				archiveValue: 'Kisa socken',
				similarity: 0.89,
			},
		],
		metadata: {},
	},
];

const MOCK_STORIES: Story[] = [
	{
		id: 'story_xyz789',
		personId: 'I1',
		title: 'Johan Andersson: Ett liv i Småland',
		summary:
			'Johan Andersson (1853-1920) levde ett liv som jordbrukare i Västra Eneby och Kisa, starkt förankrat i 1800-talets landsbygd.',
		content:
			'Johan Andersson föddes våren 1853 i Västra Eneby. Arkivuppgifter visar hur han senare slog rot i Kisa och byggde familj med Maria Larsdotter. Genom kyrkoböcker och folkräkningar träder bilden fram av ett arbetsamt liv där jord, hushåll och släkt stod i centrum.',
		sections: [
			{
				title: 'Barndom',
				content: 'Födelsen registreras i kyrkoboken i Västra Eneby.',
				period: '1853-1870',
				relatedArchives: ['RA_456789'],
			},
			{
				title: 'Familjeliv i Kisa',
				content: 'Folkräkningen visar hushållet med hustru och barn.',
				period: '1877-1900',
				relatedArchives: ['RA_981245'],
			},
		],
		timeline: [
			{
				date: '1853-03-15',
				event: 'Födelse',
				description: 'Föddes i Västra Eneby.',
				archiveId: 'RA_456789',
			},
			{
				date: '1890-01-01',
				event: 'Folkräkning',
				description: 'Registrerad i Kisa med familj.',
				archiveId: 'RA_981245',
			},
		],
		language: 'sv',
		generatedAt: '2026-06-20T12:00:00Z',
		model: 'mock-story-model-v1',
		referencedArchives: ['RA_456789', 'RA_981245'],
		facts: [
			{
				type: 'birth',
				statement: 'Född 15 mars 1853 i Västra Eneby.',
				source: 'Födelsebok 1853-1862, Västra Eneby',
				confidence: 0.98,
			},
			{
				type: 'location',
				statement: 'Bosatt i Kisa kring 1890.',
				source: 'Folkräkning 1890, Kisa socken',
				confidence: 0.85,
			},
		],
	},
];

const byPerson = <T extends { personId: string }>(items: T[], personId: string) =>
	items.filter((item) => item.personId === personId);

export const api = {
	async getTree(initialPersonId?: string): Promise<Person[]> {
		await wait(250);
		if (!initialPersonId) {
			return MOCK_PEOPLE;
		}

		const selected = MOCK_PEOPLE.find((person) => person.id === initialPersonId);
		if (!selected) {
			return MOCK_PEOPLE;
		}

		const relatedIds = new Set([
			selected.id,
			...selected.parents,
			...selected.children,
			...selected.spouses,
		]);

		return MOCK_PEOPLE.filter((person) => relatedIds.has(person.id));
	},

	async getPersonMatches(personId: string): Promise<ArchiveMatch[]> {
		await wait(300);
		return byPerson(MOCK_MATCHES, personId);
	},

	async getPersonStory(personId: string): Promise<Story | null> {
		await wait(350);
		return MOCK_STORIES.find((story) => story.personId === personId) ?? null;
	},

	async searchArchive(term: string): Promise<ArchiveMatch[]> {
		await wait(280);
		const normalizedTerm = term.trim().toLowerCase();
		if (!normalizedTerm) {
			return [];
		}

		return MOCK_MATCHES.filter((match) => {
			const haystack = `${match.title} ${match.place} ${match.excerpt}`.toLowerCase();
			return haystack.includes(normalizedTerm);
		});
	},
};
