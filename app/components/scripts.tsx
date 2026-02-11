import { useEffect, useRef } from "react";

import { useBibleContext } from "~/context/bibleContext";

export default function Scripts() {
  const { verses, isLoadingVerses, versesError, scrollOnNextVerses, setScrollOnNextVerses } =
    useBibleContext();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollOnNextVerses && verses && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setScrollOnNextVerses(false);
    }
  }, [scrollOnNextVerses, verses?.verses[0]?.chapter, setScrollOnNextVerses]);

  if (versesError) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <p className="text-center text-red-600 dark:text-red-400">{versesError}</p>
      </div>
    );
  }

  if (!verses && isLoadingVerses) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">Loading verses…</p>
      </div>
    );
  }

  if (!verses) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Select a version, book, and chapter to load verses.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto p-6 relative">
      {isLoadingVerses && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/70 flex items-center justify-center rounded-lg">
          <p className="text-gray-600 dark:text-gray-300">Loading next chapter…</p>
        </div>
      )}
      {/* Translation Info */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {verses.verses[0]?.book} {verses.verses[0]?.chapter}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {verses.translation.name} ({verses.translation.identifier.toUpperCase()})
        </p>
      </div>

      {/* Verses */}
      <div className="space-y-4">
        {verses.verses.map((verse) => (
          <div key={`${verse.book_id}-${verse.chapter}-${verse.verse}`} className="relative">
            <sup className="text-xs text-gray-400 dark:text-gray-500 font-medium mr-2">
              {verse.verse}
            </sup>
            <span className="text-gray-800 dark:text-gray-200 leading-relaxed">
              {verse.text.trim()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
