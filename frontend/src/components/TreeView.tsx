import { useMemo, useState } from 'react';
import { useFamilyTree } from '../hooks/useFamilyTree';
import { layoutFamilyGraph, normalizeFamilyGraph } from '../layout/layoutFamilyGraph';
import { Person } from '../types/person';
import { PersonCard } from './PersonCard';
import { SearchPeople } from './SearchPeople';

const CARD_WIDTH = 148;
const CARD_HEIGHT = 78;

interface TreeViewProps {
	initialPersonId?: string;
}

export const TreeView = ({ initialPersonId }: TreeViewProps) => {
	const { people, rootPersonId, isLoading, error } = useFamilyTree(initialPersonId);
	const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

	const normalizedGraph = useMemo(() => normalizeFamilyGraph(people), [people]);

	const layout = useMemo(() => {
		if (!rootPersonId) {
			return null;
		}

		return layoutFamilyGraph(normalizedGraph.persons, normalizedGraph.families, rootPersonId, people);
	}, [normalizedGraph, rootPersonId, people]);

	const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);

	const formatYears = (person: Person): string => {
		const birthMatch = person.birth?.date?.match(/(\d{4})/);
		const deathMatch = person.death?.date?.match(/(\d{4})/);
		const birthYear = birthMatch?.[1];
		const deathYear = deathMatch?.[1] ?? (person.death ? undefined : 'Nu');

		if (birthYear && deathYear) {
			return `${birthYear}-${deathYear}`;
		}

		if (birthYear) {
			return `${birthYear}-`;
		}

		if (deathMatch?.[1]) {
			return `d. ${deathMatch[1]}`;
		}

		return '';
	};

	const displayName = (person: Person): string => {
		const fromParts = `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim();
		return fromParts || person.fullName || person.id;
	};

	const initialsForPerson = (person: Person): string => {
		const name = displayName(person);
		const parts = name.split(/\s+/).filter(Boolean);
		const first = parts[0]?.[0] ?? '';
		const second = parts[1]?.[0] ?? '';
		return `${first}${second}`.toUpperCase();
	};

	const splitNameTwoLines = (person: Person): [string, string] => {
		const full = displayName(person);
		if (full.length <= 22) {
			return [full, ''];
		}

		const words = full.split(/\s+/).filter(Boolean);
		if (words.length < 2) {
			return [full.slice(0, 22), full.slice(22, 44)];
		}

		let firstLine = '';
		let index = 0;
		while (index < words.length) {
			const candidate = firstLine ? `${firstLine} ${words[index]}` : words[index];
			if (candidate.length > 22) {
				break;
			}
			firstLine = candidate;
			index += 1;
		}

		if (!firstLine) {
			firstLine = words[0];
			index = 1;
		}

		const secondLine = words.slice(index).join(' ');
		return [firstLine, secondLine.slice(0, 24)];
	};

	if (isLoading) {
		return <div className="loading-box">Hämtar släktträd...</div>;
	}

	if (error) {
		return <div className="error-box">{error}</div>;
	}

	return (
		<div className="tree-layout">
			<div className="tree-panel">
				{!isLoading && !error && people.length > 0 && (
					<SearchPeople people={people} onPersonSelected={setSelectedPerson} />
				)}
				<p className="tree-hint">Klicka på en nod eller sök för att öppna personkortet.</p>
				{layout && layout.people.length ? (
					<div className="family-graph-scroll">
						<svg
							className="family-graph-svg"
							width={layout.width}
							height={layout.height}
							viewBox={`0 0 ${layout.width} ${layout.height}`}
						>
							{layout.lines.map((line) => (
								<line
									key={line.id}
									x1={line.x1}
									y1={line.y1}
									x2={line.x2}
									y2={line.y2}
									className={`family-line family-line-${line.type}`}
								/>
							))}

							{layout.people.map((node) => {
								const person = peopleById.get(node.id);
								if (!person) {
									return null;
								}

								const genderClass =
									person.gender === 'M'
										? 'person-card-male'
										: person.gender === 'F'
											? 'person-card-female'
											: 'person-card-other';
								const selectedClass = selectedPerson?.id === person.id ? 'person-card-selected' : '';
								const initials = initialsForPerson(person);
								const [nameLine1, nameLine2] = splitNameTwoLines(person);

								return (
									<g
										key={person.id}
										className="person-card-node"
										transform={`translate(${node.x}, ${node.y})`}
										onClick={() => setSelectedPerson(person)}
									>
										<rect className={`person-card-rect ${genderClass} ${selectedClass}`} width={CARD_WIDTH} height={CARD_HEIGHT} rx={12} />
										<circle className="person-avatar-bg" cx={16} cy={15} r={9} />
										<text x={16} y={19} textAnchor="middle" className="person-avatar-text">
											{initials || '?'}
										</text>
										<text x={10} y={36} className="person-name-label">
											{nameLine1}
										</text>
										{nameLine2 && (
											<text x={10} y={50} className="person-name-label">
												{nameLine2}
											</text>
										)}
										<text x={10} y={68} className="person-years-label">
											{formatYears(person)}
										</text>
									</g>
								);
							})}
						</svg>
					</div>
				) : (
					<div className="loading-box">Ingen träd-data tillgänglig.</div>
				)}
			</div>

			{selectedPerson && <PersonCard person={selectedPerson} onClose={() => setSelectedPerson(null)} allPeople={people} />}
		</div>
	);
};
