import { api } from './services/api';
import { Person } from './types/person';

export interface FamilyTreeNode {
	name: string;
	person: Person;
	children?: FamilyTreeNode[];
}

const toNode = (
	person: Person,
	peopleMap: Map<string, Person>,
	maxDepth: number = 2,
	depth: number = 0
): FamilyTreeNode => {
	const children: FamilyTreeNode[] = [];
	if (depth < maxDepth) {
		for (const parentId of person.parents) {
			const parent = peopleMap.get(parentId);
			if (parent) {
				children.push(toNode(parent, peopleMap, maxDepth, depth + 1));
			}
		}
	}
	for (const childId of person.children) {
		const child = peopleMap.get(childId);
		if (child) {
			children.push(toNode(child, peopleMap, depth < maxDepth ? maxDepth + 1 : maxDepth, depth + 1));
		}
	}
	return {
		name: person.fullName,
		person,
		children: children.length > 0 ? children : undefined,
	};
};

const countNodes = (node: FamilyTreeNode): number => {
	return 1 + (node.children?.reduce((sum, child) => sum + countNodes(child), 0) ?? 0);
};

// Test
(async () => {
	const people = await api.getTree();
	const map = new Map(people.map(p => [p.id, p]));
	const root = people.find(p => p.fullName.includes('Linda')) ?? people[0];
	const tree = toNode(root, map, 2);
	console.log(`Root: ${tree.name}`);
	console.log(`Total nodes in tree: ${countNodes(tree)}`);
	console.log(`Direct children: ${tree.children?.length ?? 0}`);
})();
