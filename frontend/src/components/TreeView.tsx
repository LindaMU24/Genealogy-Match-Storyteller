import { useEffect, useMemo, useRef, useState } from 'react';
import Tree from 'react-d3-tree';
import { useFamilyTree } from '../hooks/useFamilyTree';
import { Person } from '../types/person';
import { PersonCard } from './PersonCard';

interface TreeViewProps {
	initialPersonId?: string;
}

export const TreeView = ({ initialPersonId }: TreeViewProps) => {
	const { treeData, people, isLoading, error } = useFamilyTree(initialPersonId);
	const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
	const treePanelRef = useRef<HTMLDivElement | null>(null);
	const [panelSize, setPanelSize] = useState({ width: 820, height: 560 });

	useEffect(() => {
		const element = treePanelRef.current;
		if (!element) {
			return;
		}

		const updateSize = () => {
			const rect = element.getBoundingClientRect();
			setPanelSize({
				width: Math.max(Math.floor(rect.width), 360),
				height: Math.max(Math.floor(rect.height), 420),
			});
		};

		updateSize();
		const observer = new ResizeObserver(updateSize);
		observer.observe(element);

		return () => observer.disconnect();
	}, []);

	const dimensions = useMemo(
		() => ({
			width: Math.max(panelSize.width - 20, 340),
			height: Math.max(panelSize.height - 20, 400),
		}),
		[panelSize],
	);

	const resolvePersonFromNode = (nodeDatum: unknown): Person | null => {
		const typedNode = nodeDatum as {
			person?: Person;
			data?: { person?: Person; attributes?: { id?: string } };
			attributes?: { id?: string };
		};

		const id = typedNode.attributes?.id ?? typedNode.data?.attributes?.id;
		return typedNode.person ?? typedNode.data?.person ?? people.find((person) => person.id === id) ?? null;
	};

	const selectNode = (nodeDatum: unknown) => {
		const person = resolvePersonFromNode(nodeDatum);
		if (person) {
			setSelectedPerson(person);
		}
	};

	if (isLoading) {
		return <div className="loading-box">Hämtar släktträd...</div>;
	}

	if (error) {
		return <div className="error-box">{error}</div>;
	}

	return (
		<div className="tree-layout">
			<div className="tree-panel" ref={treePanelRef}>
				<p className="tree-hint">Klicka på en nod för att öppna personkortet.</p>
				{treeData.length ? (
					<Tree
						data={treeData}
						translate={{ x: dimensions.width / 2, y: 88 }}
						dimensions={dimensions}
						orientation="vertical"
						pathFunc="step"
						collapsible={false}
						zoom={0.8}
						nodeSize={{ x: 220, y: 140 }}
						separation={{ siblings: 1.2, nonSiblings: 1.4 }}
						onNodeClick={selectNode}
						renderCustomNodeElement={({ nodeDatum }) => {
							const person = resolvePersonFromNode(nodeDatum);
							const isSelected = person?.id === selectedPerson?.id;
							const nodeName = String((nodeDatum as { name?: string }).name ?? '');

							return (
								<g
									className="tree-node-clickable"
									onClick={(event) => {
										event.stopPropagation();
										selectNode(nodeDatum);
									}}
								>
									<circle r={30} className="tree-node-hit-area" />
									<circle r={18} className={isSelected ? 'tree-node-core selected' : 'tree-node-core'} />
									<text dy={42} textAnchor="middle" className="tree-node-label">
										{nodeName}
									</text>
								</g>
							);
						}}
					/>
				) : (
					<div className="loading-box">Ingen träd-data tillgänglig.</div>
				)}
			</div>

			{selectedPerson && <PersonCard person={selectedPerson} onClose={() => setSelectedPerson(null)} />}
		</div>
	);
};
