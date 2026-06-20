import { useEffect } from 'react';
import { usePersonMatch } from '../hooks/usePersonMatch';
import { useStory } from '../hooks/useStory';
import { Person } from '../types/person';
import { ArchiveDoc } from './ArchiveDoc';
import { SearchBar } from './SearchBar';

interface PersonCardProps {
	person: Person;
	onClose: () => void;
}

export const PersonCard = ({ person, onClose }: PersonCardProps) => {
	const {
		matches,
		loadMatches,
		searchArchive,
		isLoading: matchingLoading,
		error: matchingError,
	} = usePersonMatch(person.id);
	const { story, loadStory, isLoading: storyLoading, error: storyError } = useStory(person.id);

	useEffect(() => {
		void loadMatches();
		void loadStory();
	}, [loadMatches, loadStory]);

	return (
		<aside className="person-card" aria-label="Persondetaljer">
			<button onClick={onClose} className="close-btn" aria-label="Stang">
				x
			</button>

			<h2>{person.fullName}</h2>

			<div className="vital-info">
				<p>{person.birth ? `Fodd: ${person.birth.date} i ${person.birth.place}` : 'Fodelsedata saknas'}</p>
				<p>{person.death ? `Dod: ${person.death.date} i ${person.death.place}` : 'Dodsdata saknas'}</p>
			</div>

			<section className="story-section">
				<h3>AI-berattelse</h3>
				{storyLoading && <div>Genererar berattelse...</div>}
				{storyError && <div className="error-text">{storyError}</div>}
				{!storyLoading && !story && <p>Ingen berattelse tillganglig annu.</p>}
				{story && (
					<div className="story-content">
						<h4>{story.title}</h4>
						<p className="summary">{story.summary}</p>
						<p>{story.content}</p>
					</div>
				)}
			</section>

			<section className="archives-section">
				<h3>Arkivdokument</h3>
				<SearchBar onSearch={(query) => void searchArchive(query)} placeholder="Sok i arkiv for vald person" />
				{matchingLoading && <div>Soker arkiv...</div>}
				{matchingError && <div className="error-text">{matchingError}</div>}
				{!matchingLoading && matches.length === 0 && <p>Inga arkivmatchningar hittades.</p>}
				<div className="archive-list">
					{matches.map((match) => (
						<ArchiveDoc match={match} key={match.id} />
					))}
				</div>
			</section>
		</aside>
	);
};
