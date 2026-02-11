import type { Route } from "./+types/home";

import Header from "~/components/header";
import SearchBar from "~/components/searchBar";
import DropdownNavigation from "~/components/dropdownNavigation";
import Scripts from "~/components/scripts";
import ChapterNavigation from "~/components/chapterNavigation";
import AITools from "~/components/aiTools";
import { BibleProvider } from "~/context/bibleContext";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bible AI" },
    { name: "description", content: "AI-assisted Bible reading" },
  ];
}

export default function Home() {
  return (
    <BibleProvider>
      <Header />
      <main className="flex flex-col items-center justify-center mt-4 px-4">
        <SearchBar />
        <DropdownNavigation />
        <Scripts />
        <ChapterNavigation />
        <AITools />
      </main>
    </BibleProvider>
  );
}
