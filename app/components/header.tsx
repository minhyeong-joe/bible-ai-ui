import {
	LANGUAGES,
	UI_TEXT,
	useLanguageContext,
} from "~/context/languageContext";

export default function Header() {
	const { language, setLanguage } = useLanguageContext();

	return (
		<div className="flex flex-col items-center justify-center py-8 px-4 bg-blue-100 dark:bg-slate-800">
			<img src="/img/logo.png" alt="Bible AI Logo" className="h-24 w-24 mb-4" />
			<h1 className="text-4xl text-center font-bold mb-4 text-gray-900 dark:text-white">
				{UI_TEXT.header.title[language]}
			</h1>
			<p className="text-lg text-gray-500 mb-6 text-center">
				{UI_TEXT.header.description[language]}
			</p>
			<div className="flex gap-2">
				{LANGUAGES.map((lang) => (
					<button
						key={lang}
						onClick={() => setLanguage(lang)}
						className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
							language === lang
								? "bg-blue-500 text-white"
								: "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
						}`}
					>
						{lang}
					</button>
				))}
			</div>
		</div>
	);
}
