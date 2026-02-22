import type { Route } from "./+types/home";
import { useEffect, useState } from "react";

import Header from "~/components/header";
import DropdownNavigation from "~/components/dropdownNavigation";
import Scripts from "~/components/scripts";
import ChapterNavigation from "~/components/chapterNavigation";
import AITools from "~/components/aiTools";
import LoadingScreen from "~/components/loadingScreen";
import { BibleProvider, useBibleContext } from "~/context/bibleContext";
import { LanguageProvider } from "~/context/languageContext";
import { warmUpServer } from "~/services/ai";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Bible AI" },
		{ name: "description", content: "AI-assisted Bible reading" },
	];
}

function HomeContent() {
	const { chapter } = useBibleContext();

	return (
		<>
			<Header />
			<main className="flex flex-col items-center justify-center mt-4 px-4">
				<DropdownNavigation />
				<Scripts />
				<ChapterNavigation />
				{chapter ? <AITools /> : null}
			</main>
		</>
	);
}

export default function Home() {
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const initialize = async () => {
			await warmUpServer();
			setIsReady(true);
		};
		initialize();
	}, []);

	if (!isReady) return <LoadingScreen />;

	return (
		<LanguageProvider>
			<BibleProvider>
				<HomeContent />
			</BibleProvider>
		</LanguageProvider>
	);
}
