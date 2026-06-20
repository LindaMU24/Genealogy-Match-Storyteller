import { useCallback, useState } from 'react';
import { api } from '../services/api';
import { Story } from '../types/story';

interface UseStoryResult {
	story: Story | null;
	isLoading: boolean;
	error: string | null;
	loadStory: () => Promise<void>;
}

export const useStory = (personId: string): UseStoryResult => {
	const [story, setStory] = useState<Story | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadStory = useCallback(async () => {
		if (!personId) {
			setStory(null);
			return;
		}

		setIsLoading(true);
		setError(null);
		try {
			const result = await api.getPersonStory(personId);
			setStory(result);
		} catch {
			setError('Kunde inte hamta AI-berattelse.');
		} finally {
			setIsLoading(false);
		}
	}, [personId]);

	return {
		story,
		isLoading,
		error,
		loadStory,
	};
};
