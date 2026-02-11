interface Translation {
  identifier: string;
  name: string;
  language: string;
  language_code: string;
  license: string;
}

interface Verse {
  book_id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface ScriptureData {
  translation: Translation;
  verses: Verse[];
}

interface ScriptsProps {
  data: ScriptureData;
}

export default function Scripts({ script }: ScriptsProps | undefined) {
  if (!script) return null;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Translation Info */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {script.verses[0]?.book} {script.verses[0]?.chapter}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {script.translation.name} ({script.translation.identifier.toUpperCase()})
        </p>
      </div>

      {/* Verses */}
      <div className="space-y-4">
        {script.verses.map((verse) => (
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
