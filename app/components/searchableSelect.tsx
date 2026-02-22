import { useState, useRef, useEffect } from "react";

export type SearchableSelectProps<T> = {
    value: string;
    displayValue: string;
    placeholder: string;
    disabled?: boolean;
    items: T[];
    getKey: (item: T) => string;
    getLabel: (item: T) => string;
    filterFn: (item: T, query: string) => boolean;
    onSelect: (item: T) => void;
};

export default function SearchableSelect<T>({
    value,
    displayValue,
    placeholder,
    disabled,
    items,
    getKey,
    getLabel,
    filterFn,
    onSelect,
}: SearchableSelectProps<T>) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (!open) setQuery("");
        setHighlightedIndex(-1);
    }, [displayValue, open]);

    useEffect(() => {
        setHighlightedIndex(-1);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const el = listRef.current.children[highlightedIndex] as HTMLElement;
            el?.scrollIntoView({ block: "nearest" });
        }
    }, [highlightedIndex]);

    const filtered = query
        ? items.filter((item) => filterFn(item, query))
        : items;

    const inputDisplay = open ? query : displayValue;

    const selectItem = (item: T) => {
        onSelect(item);
        setQuery("");
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!open || disabled) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const target = highlightedIndex >= 0 ? filtered[highlightedIndex] : filtered[0];
            if (target) selectItem(target);
        } else if (e.key === "Escape") {
            setOpen(false);
            setQuery("");
        }
    };

    return (
        <div ref={containerRef} className="relative w-4/5 sm:w-full">
            <input
                type="text"
                value={inputDisplay}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { if (!disabled) setOpen(true); }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {open && !disabled && filtered.length > 0 && (
                <ul ref={listRef} className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filtered.map((item, index) => (
                        <li
                            key={getKey(item)}
                            onMouseDown={() => selectItem(item)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            className={`px-3 py-2 cursor-pointer text-sm text-gray-900 dark:text-white ${
                                index === highlightedIndex
                                    ? "bg-blue-100 dark:bg-blue-600"
                                    : getKey(item) === value
                                    ? "bg-blue-50 dark:bg-gray-700 font-medium"
                                    : "hover:bg-blue-50 dark:hover:bg-gray-700"
                            }`}
                        >
                            {getLabel(item)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
