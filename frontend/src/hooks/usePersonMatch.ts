import { useCallback, useState } from 'react';
import { api } from '../services/api';
import { ArchiveMatch } from '../types/archive';

interface UsePersonMatchResult {
	matches: ArchiveMatch[];
	isLoading: boolean;
	error: string | null;
	loadMatches: () => Promise<void>;
	searchArchive: (term: string) => Promise<void>;
}

export const usePersonMatch = (personId: string): UsePersonMatchResult => {
	const [matches, setMatches] = useState<ArchiveMatch[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadMatches = useCallback(async () => {
		if (!personId) {
			setMatches([]);
			return;
		}

		setIsLoading(true);
		setError(null);
		try {
			const data = await api.getPersonMatches(personId);
			setMatches(data);
		} catch {
			setError('Kunde inte hamta arkivmatchningar.');
		} finally {
			setIsLoading(false);
		}
	}, [personId]);

	const searchArchive = useCallback(async (term: string) => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await api.searchArchive(term, personId);
			setMatches(data);
		} catch {
			setError('Kunde inte soka i arkivet.');
		} finally {
			setIsLoading(false);
		}
	}, [personId]);

	return {
		matches,
		isLoading,
		error,
		loadMatches,
		searchArchive,
	};
};
