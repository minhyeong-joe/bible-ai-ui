import { useBibleContext } from "~/context/bibleContext";

export default function DropdownNavigation() {
    const {
        versions,
        books,
        chapters,
        version,
        book,
        chapter,
        setVersion,
        setBook,
        setChapter,
        setScrollOnNextVerses,
    } = useBibleContext();

  
  return (
    <div className="dropdowns mt-6 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <select 
            className="w-4/5 sm:w-full mb-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={versions.length ? version : ""}
            disabled={!versions.length}
            onChange={(e) => {
                setScrollOnNextVerses(false);
                setVersion(e.target.value);
            }}
        >
            <option value="" disabled>
                Select Bible Version
            </option>
            {versions.map((v) => (
                <option key={v.identifier} value={v.identifier}>
                    [{v.identifier.toUpperCase()}] {v.name}
                </option>
            ))}
        </select>
        <select 
            className="w-4/5 sm:w-full mb-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={book} 
            onChange={(e) => {
                setScrollOnNextVerses(false);
                setBook(e.target.value);
            }}
            disabled={!version || !books.length}
        >
            <option value="">Select Book</option>
            {books.map((book) => (
            <option key={book.id} value={book.id}>
                {book.name}
            </option>
            ))}
        </select>
        <select 
            className="w-4/5 sm:w-full mb-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={chapter}
            onChange={(e) => {
                setScrollOnNextVerses(false);
                setChapter(e.target.value);
            }}
            disabled={!book || !chapters.length}
        >
            <option value="">Select Chapter</option>
            {chapters.map((ch) => (
            <option key={ch.chapter} value={ch.chapter}>
                {ch.chapter}
            </option>
            ))}
        </select>
    </div>
  );
}
