import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { Person } from '../types/person';

export interface FamilyTreeNode {
	name: string;
	attributes: {
		id: string;
		birth?: string;
		death?: string;
	};
	person: Person;
	children?: FamilyTreeNode[];
}

interface UseFamilyTreeResult {
	treeData: FamilyTreeNode[];
	people: Person[];
	isLoading: boolean;
	error: string | null;
}

const toNode = (person: Person, peopleMap: Map<string, Person>): FamilyTreeNode => {
	const children = person.children
		.map((childId) => peopleMap.get(childId))
		.filter((child): child is Person => Boolean(child))
		.map((child) => ({
			name: child.fullName,
			attributes: {
				id: child.id,
				birth: child.birth?.date,
				death: child.death?.date,
			},
			person: child,
		}));

	return {
		name: person.fullName,
		attributes: {
			id: person.id,
			birth: person.birth?.date,
			death: person.death?.date,
		},
		person,
		children,
	};
};

export const useFamilyTree = (initialPersonId?: string): UseFamilyTreeResult => {
	const [people, setPeople] = useState<Person[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const load = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const data = await api.getTree(initialPersonId);
				if (active) {
					setPeople(data);
				}
			} catch {
				if (active) {
					setError('Kunde inte hämta släktträd just nu.');
				}
			} finally {
				if (active) {
					setIsLoading(false);
				}
			}
		};

		void load();

		return () => {
			active = false;
		};
	}, [initialPersonId]);

	const treeData = useMemo<FamilyTreeNode[]>(() => {
		if (!people.length) {
			return [];
		}

		const peopleMap = new Map(people.map((person) => [person.id, person]));
		const root = people.find((person) => person.id === initialPersonId) ?? people[0];
		return [toNode(root, peopleMap)];
	}, [people, initialPersonId]);

	return {
		treeData,
		people,
		isLoading,
		error,
	};
};
