export type PersonId = string;

export interface Event {
	date: string;
	place: string;
	type: 'birth' | 'death' | 'marriage' | 'burial';
	coordinates?: { lat: number; lng: number };
}

export interface Source {
	title: string;
	author?: string;
	publication?: string;
	page?: string;
	url?: string;
}

export interface Photo {
	id: string;
	url: string;
	caption?: string;
}

export interface Person {
	id: string;
	firstName: string;
	lastName: string;
	fullName: string;
	gender: 'M' | 'F' | 'O';
	birth: Event | null;
	death: Event | null;
	marriage: Event | null;
	parents: PersonId[];
	children: PersonId[];
	spouses: PersonId[];
	sources: Source[];
	notes: string[];
	photos: Photo[];
}
