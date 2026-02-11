import { useBibleContext } from "~/context/bibleContext";

export default function ChapterNavigation() {
  const {
    version,
    book,
    chapter,
    books,
    chapters,
    setChapter,
    setBook,
    setScrollOnNextVerses,
  } = useBibleContext();

  const currentBookIndex = books.findIndex((b) => b.id === book);
  const currentChapterNumber = chapter ? Number(chapter) : null;
  const firstChapterNumber = chapters.length ? chapters[0].chapter : null;
  const lastChapterNumber = chapters.length ? chapters[chapters.length - 1].chapter : null;
  const isFirstBook = currentBookIndex <= 0;
  const isLastBook = currentBookIndex === books.length - 1 && currentBookIndex !== -1;

  const prevDisabled =
    !version ||
    !book ||
    !currentChapterNumber ||
    firstChapterNumber === null ||
    (isFirstBook && currentChapterNumber <= firstChapterNumber);

  const nextDisabled =
    !version ||
    !book ||
    !currentChapterNumber ||
    lastChapterNumber === null ||
    (isLastBook && currentChapterNumber >= lastChapterNumber);

  const handlePrev = () => {
    if (prevDisabled || !currentChapterNumber || firstChapterNumber === null) {
      return;
    }

    if (currentChapterNumber > firstChapterNumber) {
      setScrollOnNextVerses(true);
      setChapter(String(currentChapterNumber - 1));
      return;
    }

    if (currentBookIndex > 0) {
      setScrollOnNextVerses(true);
      setBook(books[currentBookIndex - 1].id, { pendingChapter: "last" });
    }
  };

  const handleNext = () => {
    if (nextDisabled || !currentChapterNumber || lastChapterNumber === null) {
      return;
    }

    if (currentChapterNumber < lastChapterNumber) {
      setScrollOnNextVerses(true);
      setChapter(String(currentChapterNumber + 1));
      return;
    }

    if (currentBookIndex !== -1 && currentBookIndex < books.length - 1) {
      setScrollOnNextVerses(true);
      setBook(books[currentBookIndex + 1].id, { pendingChapter: "first" });
    }
  };

  return (
    <div className="flex gap-4 mt-8 mb-12">
      <button
        onClick={handlePrev}
        disabled={prevDisabled}
        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        <span>←</span>
        <span>Prev</span>
      </button>
      <button
        onClick={handleNext}
        disabled={nextDisabled}
        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        <span>Next</span>
        <span>→</span>
      </button>
    </div>
  );
}