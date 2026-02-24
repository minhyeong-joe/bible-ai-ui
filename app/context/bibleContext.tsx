import type { ReactNode } from "react";
import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import {
	fetchBooks,
	fetchChapters,
	fetchVerses,
	fetchVersions,
	type BibleVersion,
	type Book,
	type Chapter,
	type VersesResponse,
} from "~/services/bible";

type ChapterSpecifier = "first" | "last" | number | string | null;
type SetBookOptions = { pendingChapter?: ChapterSpecifier };

interface BibleContextValue {
	version: string;
	versionName: string;
	book: string;
	chapter: string;
	versions: BibleVersion[];
	books: Book[];
	chapters: Chapter[];
	setVersion: (identifier: string, name: string) => void;
	setBook: (value: string, options?: SetBookOptions) => void;
	setChapter: (value: string) => void;
	setScrollOnNextVerses: (value: boolean) => void;
	scrollOnNextVerses: boolean;
	verses: VersesResponse | null;
	isLoadingVerses: boolean;
	versesError: string | null;
}

const BibleContext = createContext<BibleContextValue | undefined>(undefined);

const resolveChapterSpecifier = (
	specifier: ChapterSpecifier,
	available: Chapter[],
): number | null => {
	if (!specifier || available.length === 0) {
		return null;
	}

	if (specifier === "first") {
		return available[0]?.chapter ?? null;
	}

	if (specifier === "last") {
		return available[available.length - 1]?.chapter ?? null;
	}

	const numeric = typeof specifier === "string" ? Number(specifier) : specifier;
	if (typeof numeric === "number" && Number.isFinite(numeric)) {
		return numeric;
	}

	return null;
};

export function BibleProvider({ children }: { children: ReactNode }) {
	const [versionState, setVersionState] = useLocalStorage(
		"bible-ai:version",
		"gae",
	);
	const [versionNameState, setVersionNameState] = useLocalStorage(
		"bible-ai:versionName",
		"개역개정",
	);
	const [bookState, setBookState] = useState("");
	const [chapterState, setChapterState] = useState("");
	const [versions, setVersions] = useState<BibleVersion[]>([]);
	const [books, setBooks] = useState<Book[]>([]);
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [verses, setVerses] = useState<VersesResponse | null>(null);
	const [isLoadingVerses, setIsLoadingVerses] = useState(false);
	const [versesError, setVersesError] = useState<string | null>(null);
	const [scrollOnNextVerses, setScrollOnNextVerses] = useState(false);
	const pendingChapterRef = useRef<ChapterSpecifier>(null);

	const setVersion = (identifier: string, name: string) => {
		pendingChapterRef.current = null;
		if (identifier === versionState) {
			return;
		}
		setVersionState(identifier);
		setVersionNameState(name);
	};

	const setBook = (value: string, options?: SetBookOptions) => {
		pendingChapterRef.current = options?.pendingChapter ?? null;
		if (value === bookState && !options?.pendingChapter) {
			return;
		}
		setChapterState("");
		setBookState(value);
	};

	const setChapter = (value: string) => {
		pendingChapterRef.current = null;
		setChapterState(value);
	};

	useEffect(() => {
		let isMounted = true;

		const loadVersions = async () => {
			try {
				const data = await fetchVersions();
				if (!isMounted) return;
				setVersions(data.translations ?? []);
			} catch (error) {
				console.error("Error fetching Bible versions:", error);
			}
		};

		loadVersions();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (!versionState) {
			setBooks([]);
			setBookState("");
			setChapters([]);
			setChapterState("");
			return;
		}

		let isMounted = true;

		const loadBooks = async () => {
			try {
				const data = await fetchBooks(versionState);
				if (!isMounted) return;
				setBooks(data.books);
				if (bookState && !data.books.some((b) => b.id === bookState)) {
					setBookState("");
					setChapterState("");
				}
			} catch (error) {
				console.error(
					`Error fetching books for version ${versionState}:`,
					error,
				);
			}
		};

		loadBooks();

		return () => {
			isMounted = false;
		};
	}, [versionState]);

	useEffect(() => {
		if (!versionState || !bookState) {
			setChapters([]);
			return;
		}

		let isMounted = true;

		const loadChapters = async () => {
			try {
				const data = await fetchChapters(versionState, bookState);
				if (!isMounted) return;
				setChapters(data.chapters);

				const desiredChapter = pendingChapterRef.current;
				if (desiredChapter !== null) {
					const resolved = resolveChapterSpecifier(
						desiredChapter,
						data.chapters,
					);
					if (resolved !== null) {
						setChapterState(String(resolved));
					}
					pendingChapterRef.current = null;
				}
			} catch (error) {
				console.error(
					`Error fetching chapters for ${versionState}/${bookState}:`,
					error,
				);
			}
		};

		loadChapters();

		return () => {
			isMounted = false;
		};
	}, [versionState, bookState]);

	useEffect(() => {
		if (!versionState || !bookState || !chapterState) {
			if (pendingChapterRef.current === null) {
				setVerses(null);
			}
			return;
		}

		const chapterNumber = Number(chapterState);
		if (Number.isNaN(chapterNumber)) {
			return;
		}

		let isMounted = true;
		setIsLoadingVerses(true);
		setVersesError(null);

		fetchVerses(versionState, bookState, chapterNumber)
			.then((data) => {
				if (isMounted) {
					setVerses(data);
				}
			})
			.catch((error) => {
				console.error(
					`Error fetching verses for ${versionState}/${bookState}/${chapterState}:`,
					error,
				);
				if (isMounted) {
					setVersesError("Unable to load verses right now. Please try again.");
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsLoadingVerses(false);
					console.log(verses);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [versionState, bookState, chapterState]);

	const value = useMemo(
		() => ({
			version: versionState,
			versionName: versionNameState,
			book: bookState,
			chapter: chapterState,
			versions,
			books,
			chapters,
			setVersion,
			setBook,
			setChapter,
			setScrollOnNextVerses,
			scrollOnNextVerses,
			verses,
			isLoadingVerses,
			versesError,
		}),
		[
			versionState,
			versionNameState,
			bookState,
			chapterState,
			versions,
			books,
			chapters,
			scrollOnNextVerses,
			verses,
			isLoadingVerses,
			versesError,
		],
	);

	return (
		<BibleContext.Provider value={value}>{children}</BibleContext.Provider>
	);
}

export function useBibleContext() {
	const context = useContext(BibleContext);
	if (!context) {
		throw new Error("useBibleContext must be used within a BibleProvider");
	}
	return context;
}
