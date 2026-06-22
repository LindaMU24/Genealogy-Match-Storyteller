import { useState, useMemo } from 'react';
import { Person } from '../types/person';

interface SearchPeopleProps {
	people: Person[];
	onPersonSelected: (person: Person) => void;
}

export const SearchPeople = ({ people, onPersonSelected }: SearchPeopleProps) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [showDropdown, setShowDropdown] = useState(false);

	// Group people by surname for organization (deduplicate with case-insensitive matching)
	const uniqueSurnames = useMemo(() => {
		const surnameLower = new Map<string, string>(); // lowercase -> original case
		for (const person of people) {
			if (person.lastName) {
				const lower = person.lastName.toLowerCase();
				if (!surnameLower.has(lower)) {
					surnameLower.set(lower, person.lastName);
				}
			}
		}
		return Array.from(surnameLower.values()).sort();
	}, [people]);

	// Filter people based on search term
	const filteredPeople = useMemo(() => {
		if (!searchTerm.trim()) {
			return [];
		}

		const term = searchTerm.toLowerCase();
		return people
			.filter(
				(person) =>
					person.fullName.toLowerCase().includes(term) ||
					person.firstName.toLowerCase().includes(term) ||
					person.lastName.toLowerCase().includes(term)
			)
			.sort((a, b) => {
				// Prioritize exact matches
				if (a.lastName === searchTerm) return -1;
				if (b.lastName === searchTerm) return 1;
				// Then by first name match
				return a.fullName.localeCompare(b.fullName);
			})
			.slice(0, 20); // Limit to 20 results
	}, [searchTerm, people]);

	const handleSelect = (person: Person) => {
		onPersonSelected(person);
		setSearchTerm('');
		setShowDropdown(false);
	};

	return (
		<div className="search-people-container">
			<div className="search-input-wrapper">
				<input
					type="text"
					placeholder="Sök person... (namn eller efternamn)"
					value={searchTerm}
					onChange={(e) => {
						setSearchTerm(e.target.value);
						setShowDropdown(true);
					}}
					onFocus={() => setShowDropdown(true)}
					className="search-people-input"
				/>
				{searchTerm && (
					<button
						onClick={() => {
							setSearchTerm('');
							setShowDropdown(false);
						}}
						className="search-clear-btn"
						aria-label="Rensa sökning"
					>
						✕
					</button>
				)}
			</div>

			{showDropdown && (
				<div className="search-dropdown">
					{filteredPeople.length > 0 ? (
						<ul className="search-results">
							{filteredPeople.map((person) => (
								<li key={person.id}>
									<button
										onClick={() => handleSelect(person)}
										className="search-result-item"
									>
										<span className="person-name">{person.fullName}</span>
										<span className="person-dates">
											{person.birth?.date && `b. ${person.birth.date}`}
											{person.birth?.date && person.death?.date && ' • '}
											{person.death?.date && `d. ${person.death.date}`}
										</span>
									</button>
								</li>
							))}
						</ul>
					) : searchTerm.trim() ? (
						<div className="search-no-results">Ingen person hittad</div>
					) : (
						<div className="search-hint">
							<div>Skriv namn för att söka</div>
							<div className="surnames-list">
								<strong>Efternamn i trädet:</strong>
								<ul>
								{uniqueSurnames.slice(0, 15).map((surname) => (
									<li key={surname.toLowerCase()}>
											<button
												onClick={() => {
													setSearchTerm(surname);
													setShowDropdown(true);
												}}
												className="surname-button"
											>
												{surname}
											</button>
										</li>
									))}
								</ul>
							{uniqueSurnames.length > 15 && (
								<span className="more-surnames">+{uniqueSurnames.length - 15} fler</span>
								)}
							</div>
						</div>
					)}
				</div>
			)}

			{showDropdown && filteredPeople.length === 0 && !searchTerm.trim() && (
				<div
					className="search-overlay"
					onClick={() => setShowDropdown(false)}
					aria-hidden="true"
				/>
			)}
		</div>
	);
};
