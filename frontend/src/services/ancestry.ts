export interface GedcomImportResult {
	fileName: string;
	importedAt: string;
	peopleCount: number;
}

export async function importGedcom(file: File): Promise<GedcomImportResult> {
	// Placeholder until backend upload endpoint is wired.
	return {
		fileName: file.name,
		importedAt: new Date().toISOString(),
		peopleCount: 0,
	};
}
