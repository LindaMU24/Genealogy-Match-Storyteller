import { FormEvent, useState } from 'react';

interface SearchBarProps {
	onSearch: (query: string) => void;
	placeholder?: string;
}

export const SearchBar = ({ onSearch, placeholder }: SearchBarProps) => {
	const [query, setQuery] = useState('');

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onSearch(query.trim());
	};

	return (
		<form className="search-bar" onSubmit={handleSubmit}>
			<input
				type="search"
				value={query}
				onChange={(event) => setQuery(event.target.value)}
				placeholder={placeholder ?? 'Sök i Riksarkivet...'}
				aria-label="Sök i arkiv"
			/>
			<button type="submit">Sök</button>
		</form>
	);
};
