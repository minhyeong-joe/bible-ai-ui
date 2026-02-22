import { useState, useEffect } from "react";
import { useBibleContext } from "~/context/bibleContext";
import { getContextResponse, getReflectionResponse } from "~/services/ai";
import { UI_TEXT, useLanguageContext } from "~/context/languageContext";
import ReactMarkdown from "react-markdown";

type TabType = "context" | "reflection" | null;

// Fix markdown formatting issues from AI responses
function normalizeMarkdown(text: string): string {
	return (
		text
			// Fix escaped bullet points and dashes
			.replace(/\\-/g, "-")
			.replace(/\\\*/g, "*")
			// Fix bullet points with title on next line: "- \nTitle" -> "- Title"
			.replace(/^-\s*\n+(.+)/gm, "- $1")
			// Ensure proper spacing after list items
			.replace(/^- (.+)$/gm, "- $1\n")
	);
}

export default function AITools() {
	const [activeTab, setActiveTab] = useState<TabType>(null);
	const { language: selectedLanguage } = useLanguageContext();
	const [contextContent, setContextContent] = useState<string>("");
	const [reflectionContent, setReflectionContent] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { book, chapter, versionName } = useBibleContext();

	// Clear content when chapter or language changes
	useEffect(() => {
		setContextContent("");
		setReflectionContent("");
		setActiveTab(null);
		setError(null);
	}, [book, chapter, versionName, selectedLanguage]);

	const handleTabClick = async (tab: TabType) => {
		if (tab === null) return;

		setActiveTab(tab);

		// Only fetch if content hasn't been loaded yet
		if (tab === "context" && !contextContent) {
			setIsLoading(true);
			setError(null);
			try {
				const response = await getContextResponse(
					book,
					chapter,
					versionName,
					selectedLanguage,
				);
				if (response.status >= 200 && response.status < 300) {
					setContextContent(response.data.response);
				} else if (response.status >= 400 && response.status < 500) {
					setError(response.data.error || "Failed to fetch context response.");
				} else {
					setError("An unexpected error occurred.");
				}
			} catch (error) {
				console.error("Error fetching context response:", error);
				setError("Failed to fetch context response.");
			} finally {
				setIsLoading(false);
			}
		} else if (tab === "reflection" && !reflectionContent) {
			setIsLoading(true);
			setError(null);
			try {
				const response = await getReflectionResponse(
					book,
					chapter,
					versionName,
					selectedLanguage,
				);
				if (response.status >= 200 && response.status < 300) {
					setReflectionContent(response.data.response);
				} else if (response.status >= 400 && response.status < 500) {
					setError(
						response.data.error || "Failed to fetch reflection response.",
					);
				} else {
					setError("An unexpected error occurred.");
				}
			} catch (error) {
				console.error("Error fetching reflection response:", error);
				setError("Failed to fetch reflection response.");
			} finally {
				setIsLoading(false);
			}
		}
	};

	return (
		<div className="ai-tools my-8 w-full max-w-4xl">
			{/* Tab Buttons */}
			<div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
				<button
					onClick={() => handleTabClick("context")}
					className={`px-6 py-3 font-medium transition-colors border-b-2 cursor-pointer ${
						activeTab === "context"
							? "border-blue-500 text-blue-600 dark:text-blue-400"
							: "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
					}`}
				>
					{UI_TEXT.aiTools.tabs.context[selectedLanguage]}
				</button>
				<button
					onClick={() => handleTabClick("reflection")}
					className={`px-6 py-3 font-medium transition-colors border-b-2 cursor-pointer ${
						activeTab === "reflection"
							? "border-blue-500 text-blue-600 dark:text-blue-400"
							: "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
					}`}
				>
					{UI_TEXT.aiTools.tabs.reflection[selectedLanguage]}
				</button>
			</div>

			{/* Content Container */}
			{activeTab && (
				<div className="mt-16 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 min-h-[200px] relative">
					<img
						src="/img/logo.png"
						alt="AI Logo"
						className="absolute -top-12 left-2 h-16 w-16 bg-white dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700"
					/>
					{isLoading ? (
						<div className="flex items-center justify-center h-full">
							<p className="text-gray-500 dark:text-gray-400">
								{UI_TEXT.aiTools.loading[selectedLanguage]}
							</p>
						</div>
					) : error ? (
						<div className="flex items-center justify-center h-full">
							<p className="text-red-600 dark:text-red-400">
								{UI_TEXT.aiTools.error[selectedLanguage]}
							</p>
						</div>
					) : (
						<div className="text-gray-800 dark:text-gray-200 space-y-4">
							<p className="mb-3 text-red-400 dark:text-red-500 text-sm italic">
								* {UI_TEXT.aiTools.disclaimer[selectedLanguage]}
							</p>
							{activeTab === "context" && (
								<ReactMarkdown
									components={{
										p: ({ children }) => (
											<p className="mb-4 leading-relaxed">{children}</p>
										),
										strong: ({ children }) => (
											<strong className="font-bold text-gray-900 dark:text-white">
												{children}
											</strong>
										),
										ul: ({ children }) => (
											<ul className="list-disc list-inside space-y-2 mb-4">
												{children}
											</ul>
										),
										ol: ({ children }) => (
											<ol className="list-decimal list-inside space-y-2 mb-4">
												{children}
											</ol>
										),
										li: ({ children }) => <li className="ml-4">{children}</li>,
										h1: ({ children }) => (
											<h1 className="text-2xl font-bold mb-4 mt-6">
												{children}
											</h1>
										),
										h2: ({ children }) => (
											<h2 className="text-xl font-bold mb-3 mt-5">
												{children}
											</h2>
										),
										h3: ({ children }) => (
											<h3 className="text-lg font-bold mb-2 mt-4">
												{children}
											</h3>
										),
									}}
								>
									{normalizeMarkdown(contextContent)}
								</ReactMarkdown>
							)}
							{activeTab === "reflection" && (
								<ReactMarkdown
									components={{
										p: ({ children }) => (
											<p className="mb-4 leading-relaxed">{children}</p>
										),
										strong: ({ children }) => (
											<strong className="font-bold text-gray-900 dark:text-white">
												{children}
											</strong>
										),
										ul: ({ children }) => (
											<ul className="list-disc list-inside space-y-2 mb-4">
												{children}
											</ul>
										),
										ol: ({ children }) => (
											<ol className="list-decimal list-inside space-y-2 mb-4">
												{children}
											</ol>
										),
										li: ({ children }) => <li className="ml-4">{children}</li>,
										h1: ({ children }) => (
											<h1 className="text-2xl font-bold mb-4 mt-6">
												{children}
											</h1>
										),
										h2: ({ children }) => (
											<h2 className="text-xl font-bold mb-3 mt-5">
												{children}
											</h2>
										),
										h3: ({ children }) => (
											<h3 className="text-lg font-bold mb-2 mt-4">
												{children}
											</h3>
										),
									}}
								>
									{normalizeMarkdown(reflectionContent)}
								</ReactMarkdown>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
