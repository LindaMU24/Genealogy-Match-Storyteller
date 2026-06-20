import { useMemo, useState } from 'react';
import Tree from 'react-d3-tree';
import { useFamilyTree } from '../hooks/useFamilyTree';
import { Person } from '../types/person';
import { PersonCard } from './PersonCard';

interface TreeViewProps {
	initialPersonId?: string;
}

export const TreeView = ({ initialPersonId }: TreeViewProps) => {
	const { treeData, isLoading, error } = useFamilyTree(initialPersonId);
	const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

	const dimensions = useMemo(() => ({ width: 820, height: 520 }), []);

	if (isLoading) {
		return <div className="loading-box">Hamtar slakttrad...</div>;
	}

	if (error) {
		return <div className="error-box">{error}</div>;
	}

	return (
		<div className="tree-layout">
			<div className="tree-panel">
				{treeData.length ? (
					<Tree
						data={treeData}
						translate={{ x: dimensions.width / 2, y: 90 }}
						dimensions={dimensions}
						orientation="vertical"
						pathFunc="step"
						collapsible
						zoom={0.8}
						nodeSize={{ x: 220, y: 140 }}
						separation={{ siblings: 1.2, nonSiblings: 1.4 }}
						onNodeClick={(nodeDatum) => {
							const person = (nodeDatum as { person?: Person }).person;
							if (person) {
								setSelectedPerson(person);
							}
						}}
					/>
				) : (
					<div className="loading-box">Ingen trad-data tillganglig.</div>
				)}
			</div>

			{selectedPerson && <PersonCard person={selectedPerson} onClose={() => setSelectedPerson(null)} />}
		</div>
	);
};
