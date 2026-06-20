import { TreeView } from './components/TreeView';

export default function App() {
	return (
		<div className="app-shell">
			<header className="hero">
				<p className="kicker">AI Genealogy Match & Storyteller</p>
				<h1>Utforska slakten med arkiv och AI</h1>
				<p>
					Klicka pa en person i tradet for att se arkivmatchningar och en genererad berattelse baserad
					pa historiska kallor.
				</p>
			</header>

			<main>
				<TreeView initialPersonId="I1" />
			</main>
		</div>
	);
}
