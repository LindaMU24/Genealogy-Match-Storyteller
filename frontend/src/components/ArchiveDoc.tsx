import { ArchiveMatch } from '../types/archive';

interface ArchiveDocProps {
	match: ArchiveMatch;
}

export const ArchiveDoc = ({ match }: ArchiveDocProps) => {
	const confidence = Math.round(match.confidence * 100);

	return (
		<article className="archive-doc">
			<header className="archive-doc-header">
				<h4>{match.title}</h4>
				<span className="confidence">{confidence}% match</span>
			</header>
			<p className="meta">
				{match.place} • {match.date} • {match.archiveType}
			</p>
			<p className="excerpt">{match.excerpt}</p>
			<p className="collection">Samling: {match.archiveCollection}</p>
		</article>
	);
};
