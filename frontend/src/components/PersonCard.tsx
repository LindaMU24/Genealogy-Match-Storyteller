import { useEffect } from 'react';
import { usePersonMatch } from '../hooks/usePersonMatch';
import { useStory } from '../hooks/useStory';
import { Person } from '../types/person';
import { ArchiveDoc } from './ArchiveDoc';
import { SearchBar } from './SearchBar';

interface PersonCardProps {
	person: Person;
	onClose: () => void;
	allPeople?: Person[];
}

export const PersonCard = ({ person, onClose, allPeople = [] }: PersonCardProps) => {
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

	const parentMap = new Map(allPeople.map((p) => [p.id, p]));
	const parents = person.parents
		.map((parentId) => parentMap.get(parentId))
		.filter((p): p is Person => Boolean(p));
	const children = person.children
		.map((childId) => parentMap.get(childId))
		.filter((p): p is Person => Boolean(p));
	const spouses = person.spouses
		.map((spouseId) => parentMap.get(spouseId))
		.filter((p): p is Person => Boolean(p));

	return (
		<aside className="person-card" aria-label="Persondetaljer">
			<button onClick={onClose} className="close-btn" aria-label="Stäng">
				x
			</button>

			<h2>{person.fullName}</h2>

			<div className="vital-info">
				<p>
					{person.birth ? (
						<>
							Född: {person.birth.date}
							{person.birth.place && ` i ${person.birth.place}`}
						</>
					) : (
						'Födelsedata saknas'
					)}
				</p>
				<p>{person.death ? `Död: ${person.death.date} i ${person.death.place}` : '✓ Levande'}</p>
			</div>

			{parents.length > 0 && (
				<div className="relatives-section">
					<h4>Föräldrar</h4>
					<ul className="relatives-list">
						{parents.map((parent) => (
							<li key={parent.id}>{parent.fullName}</li>
						))}
					</ul>
				</div>
			)}

			{spouses.length > 0 && (
				<div className="relatives-section">
					<h4>Partner</h4>
					<ul className="relatives-list">
						{spouses.map((spouse) => (
							<li key={spouse.id}>{spouse.fullName}</li>
						))}
					</ul>
				</div>
			)}

			{children.length > 0 && (
				<div className="relatives-section">
					<h4>Barn</h4>
					<ul className="relatives-list">
						{children.map((child) => (
							<li key={child.id}>{child.fullName}</li>
						))}
					</ul>
				</div>
			)}

			<section className="story-section">
				<h3>AI-berättelse</h3>
				{storyLoading && <div>Genererar berättelse...</div>}
				{storyError && <div className="error-text">{storyError}</div>}
				{!storyLoading && !story && <p>Ingen berättelse tillgänglig ännu.</p>}
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
				<SearchBar onSearch={(query) => void searchArchive(query)} placeholder="Sök i arkiv för vald person" />
				{matchingLoading && <div>Söker arkiv...</div>}
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
