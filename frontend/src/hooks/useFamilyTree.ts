import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { Person } from '../types/person';

interface UseFamilyTreeResult {
	people: Person[];
	rootPersonId: string | null;
	isLoading: boolean;
	error: string | null;
}

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

	const rootPersonId = useMemo<string | null>(() => {
		if (!people.length) {
			return null;
		}

		const explicitRoot = initialPersonId ? people.find((person) => person.id === initialPersonId) : null;
		return explicitRoot?.id ?? people[0].id;
	}, [people, initialPersonId]);

	return {
		people,
		rootPersonId,
		isLoading,
		error,
	};
};
