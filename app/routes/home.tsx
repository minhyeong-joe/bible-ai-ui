import type { Route } from "./+types/home";
import { useEffect } from "react";

import Header from "~/components/header";
import SearchBar from "~/components/searchBar";
import DropdownNavigation from "~/components/dropdownNavigation";
import Scripts from "~/components/scripts";
import ChapterNavigation from "~/components/chapterNavigation";
import AITools from "~/components/aiTools";
import { BibleProvider, useBibleContext } from "~/context/bibleContext";
import { warmUpServer } from "~/services/ai";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bible AI" },
    { name: "description", content: "AI-assisted Bible reading" },
  ];
}

function HomeContent() {
  const { chapter } = useBibleContext();

  useEffect(() => {
      warmUpServer();
  }, []);

  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center mt-4 px-4">
        <SearchBar />
        <DropdownNavigation />
        <Scripts />
        <ChapterNavigation />
        {chapter ? <AITools /> : null}
      </main>
    </>
  );
}

export default function Home() {
  return (
    <BibleProvider>
      <HomeContent />
    </BibleProvider>
  );
}
