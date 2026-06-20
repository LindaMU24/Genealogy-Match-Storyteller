import { TreeView } from './components/TreeView';

export default function App() {
	return (
		<div className="app-shell">
			<header className="hero">
				<p className="kicker">AI Genealogy Match & Storyteller</p>
				<h1>Utforska släkten med arkiv och AI</h1>
				<p>
					Klicka på en person i trädet för att se arkivmatchningar och en genererad berättelse baserad
					på historiska källor.
				</p>
			</header>

			<main>
				<TreeView initialPersonId="I1" />
			</main>
		</div>
	);
}
