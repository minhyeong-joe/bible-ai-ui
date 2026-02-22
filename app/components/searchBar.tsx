import { useState, useRef, useEffect } from 'react';
import { useBibleContext } from '~/context/bibleContext';

type SearchResult = {
    bookId: string;
    bookName: string;
    chapter?: string;
};

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const { books, setBook, setScrollOnNextVerses } = useBibleContext();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        const trimmed = value.trim();
        if (!trimmed) {
            setResults([]);
            setShowResults(false);
            return;
        }

        // Split trailing number as chapter: "Gen 3" → bookQuery="Gen", chapterQuery="3"
        const chapterMatch = trimmed.match(/^(.*?)\s+(\d+)$/);
        const bookQuery = chapterMatch ? chapterMatch[1].trim() : trimmed;
        const chapterQuery = chapterMatch ? chapterMatch[2] : null;

        const normalizedBookQuery = bookQuery.toLowerCase();

        const matchedBooks = books.filter((b) => {
            return (
                b.name.toLowerCase().startsWith(normalizedBookQuery) ||
                b.id.toLowerCase().startsWith(normalizedBookQuery)
            );
        });

        const newResults: SearchResult[] = matchedBooks.slice(0, 10).map((b) => ({
            bookId: b.id,
            bookName: b.name,
            chapter: chapterQuery ?? undefined,
        }));

        setResults(newResults);
        setShowResults(newResults.length > 0);
    };

    const handleSelect = (result: SearchResult) => {
        setScrollOnNextVerses(true);
        setBook(result.bookId, result.chapter ? { pendingChapter: result.chapter } : undefined);
        setQuery(result.chapter ? `${result.bookName} ${result.chapter}` : result.bookName);
        setResults([]);
        setShowResults(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (results.length > 0) {
            handleSelect(results[0]);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-md">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={query}
                    onChange={handleQueryChange}
                    onFocus={() => results.length > 0 && setShowResults(true)}
                    placeholder="Search book or chapter (e.g. Gen 3)..."
                    className="w-full px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </form>
            {showResults && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {results.map((result) => (
                        <li
                            key={`${result.bookId}-${result.chapter ?? ''}`}
                            onMouseDown={() => handleSelect(result)}
                            className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        >
                            {result.bookName}{result.chapter ? ` ${result.chapter}` : ''}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}