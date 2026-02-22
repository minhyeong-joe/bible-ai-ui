import { useBibleContext } from "~/context/bibleContext";
import type { Book, Chapter } from "~/services/bible";
import SearchableSelect from "~/components/searchableSelect";

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

    const selectedBook = books.find((b) => b.id === book);
    const selectedChapter = chapters.find((ch) => String(ch.chapter) === chapter);

    return (
        <div className="dropdowns mt-6 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <select
                className="w-4/5 sm:w-full mb-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={versions.length ? version : ""}
                disabled={!versions.length}
                onChange={(e) => {
                    setScrollOnNextVerses(false);
                    const selectedVersion = versions.find((v) => v.identifier === e.target.value);
                    if (selectedVersion) {
                        setVersion(selectedVersion.identifier, selectedVersion.name);
                    }
                }}
            >
                <option value="" disabled>Select Bible Version</option>
                {versions.map((v) => (
                    <option key={v.identifier} value={v.identifier}>
                        [{v.identifier.toUpperCase()}] {v.name}
                    </option>
                ))}
            </select>

            <SearchableSelect<Book>
                value={book}
                displayValue={selectedBook?.name ?? ""}
                placeholder="Search book..."
                disabled={!version || !books.length}
                items={books}
                getKey={(b) => b.id}
                getLabel={(b) => b.name}
                filterFn={(b, q) =>
                    b.name.toLowerCase().includes(q.toLowerCase()) ||
                    b.id.toLowerCase().includes(q.toLowerCase())
                }
                onSelect={(b) => {
                    setScrollOnNextVerses(false);
                    setBook(b.id);
                }}
            />

            <SearchableSelect<Chapter>
                value={chapter}
                displayValue={selectedChapter ? String(selectedChapter.chapter) : ""}
                placeholder="Search chapter..."
                disabled={!book || !chapters.length}
                items={chapters}
                getKey={(ch) => String(ch.chapter)}
                getLabel={(ch) => String(ch.chapter)}
                filterFn={(ch, q) => String(ch.chapter).startsWith(q)}
                onSelect={(ch) => {
                    setScrollOnNextVerses(false);
                    setChapter(String(ch.chapter));
                }}
            />
        </div>
    );
}
