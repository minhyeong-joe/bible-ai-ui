export default function ChapterNavigation() {
    return (
        <div className="flex gap-4 mt-8 mb-12">
          <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer">
            <span>←</span>
            <span>Prev</span>
          </button>
          <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer">
            <span>Next</span>
            <span>→</span>
          </button>
        </div>
    );
}