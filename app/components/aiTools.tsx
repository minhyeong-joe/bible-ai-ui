import { useState, useEffect, useRef } from "react";
import { useBibleContext } from "~/context/bibleContext";
import { getContextResponse, getChatResponse } from "~/services/ai";
import { UI_TEXT, useLanguageContext } from "~/context/languageContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type TabType = "devotion" | "free-form" | null;

type ChatMessage = {
	role: "user" | "ai";
	content: string;
};

const MAX_CHAT_LENGTH = 100;

// Fix markdown formatting issues from AI responses
function normalizeMarkdown(text: string): string {
	return (
		text
			// Normalize CRLF so all regexes below only deal with \n
			.replace(/\r\n/g, "\n")
			// Fix escaped bullet points and dashes
			.replace(/\\-/g, "-")
			.replace(/\\\*/g, "*")
			// Fix bullet points with title on next line: "- \nTitle" -> "- Title"
			.replace(/^-[ \t]*\n+(.+)/gm, "- $1")
			// Same fix for asterisk-style bullets
			.replace(/^\*[ \t]*\n+(.+)/gm, "- $1")
	);
}

const devotionMarkdownComponents = {
	p: ({ children }: { children?: React.ReactNode }) => (
		<p className="mb-4 leading-relaxed">{children}</p>
	),
	strong: ({ children }: { children?: React.ReactNode }) => (
		<strong className="font-bold text-gray-900 dark:text-white">
			{children}
		</strong>
	),
	ul: ({ children }: { children?: React.ReactNode }) => (
		<ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>
	),
	ol: ({ children }: { children?: React.ReactNode }) => (
		<ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>
	),
	li: ({ children }: { children?: React.ReactNode }) => (
		<li className="ml-4">{children}</li>
	),
	h1: ({ children }: { children?: React.ReactNode }) => (
		<h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>
	),
	h2: ({ children }: { children?: React.ReactNode }) => (
		<h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>
	),
	h3: ({ children }: { children?: React.ReactNode }) => (
		<h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>
	),
	table: ({ children }: { children?: React.ReactNode }) => (
		<div className="overflow-x-auto mb-4">
			<table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
				{children}
			</table>
		</div>
	),
	thead: ({ children }: { children?: React.ReactNode }) => (
		<thead className="bg-gray-100 dark:bg-gray-700">{children}</thead>
	),
	tbody: ({ children }: { children?: React.ReactNode }) => (
		<tbody>{children}</tbody>
	),
	tr: ({ children }: { children?: React.ReactNode }) => (
		<tr className="border-b border-gray-300 dark:border-gray-600">{children}</tr>
	),
	th: ({ children }: { children?: React.ReactNode }) => (
		<th className="px-4 py-2 text-left font-semibold border-r border-gray-300 dark:border-gray-600 last:border-r-0">
			{children}
		</th>
	),
	td: ({ children }: { children?: React.ReactNode }) => (
		<td className="px-4 py-2 border-r border-gray-300 dark:border-gray-600 last:border-r-0">
			{children}
		</td>
	),
};

const chatMarkdownComponents = {
	p: ({ children }: { children?: React.ReactNode }) => (
		<p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
	),
	strong: ({ children }: { children?: React.ReactNode }) => (
		<strong className="font-bold">{children}</strong>
	),
	ul: ({ children }: { children?: React.ReactNode }) => (
		<ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>
	),
	ol: ({ children }: { children?: React.ReactNode }) => (
		<ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>
	),
	li: ({ children }: { children?: React.ReactNode }) => (
		<li className="ml-2">{children}</li>
	),
	table: ({ children }: { children?: React.ReactNode }) => (
		<div className="overflow-x-auto mb-2">
			<table className="min-w-full border-collapse border border-gray-400 dark:border-gray-500 text-xs">
				{children}
			</table>
		</div>
	),
	thead: ({ children }: { children?: React.ReactNode }) => (
		<thead className="bg-blue-100 dark:bg-blue-800/40">{children}</thead>
	),
	tbody: ({ children }: { children?: React.ReactNode }) => (
		<tbody>{children}</tbody>
	),
	tr: ({ children }: { children?: React.ReactNode }) => (
		<tr className="border-b border-gray-400 dark:border-gray-500">{children}</tr>
	),
	th: ({ children }: { children?: React.ReactNode }) => (
		<th className="px-3 py-1 text-left font-semibold border-r border-gray-400 dark:border-gray-500 last:border-r-0">
			{children}
		</th>
	),
	td: ({ children }: { children?: React.ReactNode }) => (
		<td className="px-3 py-1 border-r border-gray-400 dark:border-gray-500 last:border-r-0">
			{children}
		</td>
	),
};

export default function AITools() {
	const [activeTab, setActiveTab] = useState<TabType>(null);
	const { language: selectedLanguage } = useLanguageContext();
	const [contextContent, setContextContent] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { book, chapter, versionName, verses: versesResponse } = useBibleContext();

	// Strip verse objects to {verse, text} only to minimize API payload / tokens
	const strippedVerses = versesResponse?.verses?.map(({ verse, text }) => ({ verse, text })) ?? [];

	// Refresh state for devotion tab
	const REFRESH_COOLDOWN_S = 30;
	const [refreshCooldown, setRefreshCooldown] = useState(0);
	const [refreshError, setRefreshError] = useState<string | null>(null);

	// Chat state
	const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
	const [chatInput, setChatInput] = useState("");
	const [isChatLoading, setIsChatLoading] = useState(false);
	const [chatError, setChatError] = useState<string | null>(null);
	const [lastResponseId, setLastResponseId] = useState<string | null>(null);
	const chatEndRef = useRef<HTMLDivElement>(null);

	// Clear content when chapter or language changes
	useEffect(() => {
		setContextContent("");
		setChatMessages([]);
		setChatInput("");
		setChatError(null);
		setLastResponseId(null);
		setRefreshCooldown(0);
		setRefreshError(null);
		setActiveTab(null);
		setError(null);
	}, [book, chapter, versionName, selectedLanguage]);

	// Refresh countdown timer
	useEffect(() => {
		if (refreshCooldown <= 0) return;
		const timer = setTimeout(
			() => setRefreshCooldown((prev) => prev - 1),
			1000,
		);
		return () => clearTimeout(timer);
	}, [refreshCooldown]);

	// Scroll to bottom when new chat messages arrive
	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [chatMessages, isChatLoading]);

	const handleTabClick = async (tab: TabType) => {
		if (tab === null) return;

		setActiveTab(tab);

		// Only fetch on click for devotion tab
		if (tab === "devotion" && !contextContent) {
			setIsLoading(true);
			setError(null);
			try {
				const response = await getContextResponse(
					book,
					chapter,
					versionName,
					selectedLanguage,
					true,
					strippedVerses,
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
		}
		// free-form tab just opens the chat UI — API call happens on send
	};

	const handleRefresh = async () => {
		if (refreshCooldown > 0 || isLoading) return;

		const prevContent = contextContent;
		setContextContent("");
		setIsLoading(true);
		setError(null);
		setRefreshError(null);

		try {
			const response = await getContextResponse(
				book,
				chapter,
				versionName,
				selectedLanguage,
				false, // bypass cache
				strippedVerses,
			);
			if (response.status >= 200 && response.status < 300) {
				setContextContent(response.data.response);
				setRefreshCooldown(REFRESH_COOLDOWN_S);
			} else if (response.status === 429) {
				setContextContent(prevContent);
				setRefreshError(UI_TEXT.aiTools.refresh.rateLimit[selectedLanguage]);
			} else {
				setContextContent(prevContent);
				setError(response.data.error || "Failed to refresh response.");
			}
		} catch {
			setContextContent(prevContent);
			setError("Failed to refresh response.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSendChat = async () => {
		const trimmed = chatInput.trim();
		if (!trimmed || isChatLoading) return;

		setChatMessages((prev) => [...prev, { role: "user", content: trimmed }]);
		setChatInput("");
		setIsChatLoading(true);
		setChatError(null);

		try {
			const response = await getChatResponse(
				book,
				chapter,
				versionName,
				selectedLanguage,
				trimmed,
				lastResponseId ?? undefined,
			);
			if (response.status >= 200 && response.status < 300) {
				setChatMessages((prev) => [
					...prev,
					{ role: "ai", content: response.data.response },
				]);
				setLastResponseId(response.data.response_id ?? null);
			} else {
				setChatError(
					response.data.error || UI_TEXT.aiTools.error[selectedLanguage],
				);
			}
		} catch {
			setChatError(UI_TEXT.aiTools.error[selectedLanguage]);
		} finally {
			setIsChatLoading(false);
		}
	};

	const charCountColor =
		chatInput.length >= MAX_CHAT_LENGTH
			? "text-red-500"
			: chatInput.length >= MAX_CHAT_LENGTH * 0.8
				? "text-yellow-500"
				: "text-gray-400 dark:text-gray-500";

	return (
		<div className="ai-tools my-8 w-full max-w-4xl">
			{/* Tab Buttons */}
			<div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
				<button
					onClick={() => handleTabClick("devotion")}
					className={`px-6 py-3 font-medium transition-colors border-b-2 cursor-pointer ${
						activeTab === "devotion"
							? "border-blue-500 text-blue-600 dark:text-blue-400"
							: "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
					}`}
				>
					{UI_TEXT.aiTools.tabs.devotion[selectedLanguage]}
				</button>
				<button
					onClick={() => handleTabClick("free-form")}
					className={`px-6 py-3 font-medium transition-colors border-b-2 cursor-pointer ${
						activeTab === "free-form"
							? "border-blue-500 text-blue-600 dark:text-blue-400"
							: "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
					}`}
				>
					{UI_TEXT.aiTools.tabs.freeForm[selectedLanguage]}
				</button>
			</div>

			{/* Content Container */}
			{activeTab && (
				<div className="mt-16 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 relative">
					<img
						src="/img/logo.png"
						alt="AI Logo"
						className="absolute -top-12 left-2 h-16 w-16 bg-white dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700"
					/>

					{/* Devotion Tab */}
					{activeTab === "devotion" && (
						<div className="min-h-[200px]">
							{/* Refresh button — only shown when content is loaded */}
							{contextContent && !isLoading && (
								<button
									onClick={handleRefresh}
									disabled={refreshCooldown > 0}
									title={UI_TEXT.aiTools.refresh.button[selectedLanguage]}
									className="absolute top-4 right-4 flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
								>
									<span className="text-base leading-none">↻</span>
									{refreshCooldown > 0 ? (
										<span className="font-mono">{refreshCooldown}s</span>
									) : (
										<span>
											{UI_TEXT.aiTools.refresh.button[selectedLanguage]}
										</span>
									)}
								</button>
							)}
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
									{refreshError && (
										<p className="text-xs text-orange-500 dark:text-orange-400">
											{refreshError}
										</p>
									)}
									<ReactMarkdown
										remarkPlugins={[remarkGfm]}
										components={devotionMarkdownComponents}
									>
										{normalizeMarkdown(contextContent)}
									</ReactMarkdown>
								</div>
							)}
						</div>
					)}

					{/* Free-form Chat Tab */}
					{activeTab === "free-form" && (
						<div className="flex flex-col h-[450px]">
							{/* Messages Area */}
							<div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
								{/* Welcome message from Cutie */}
								<div className="flex items-start">
									<div className="max-w-[85%]">
										<p className="text-xs font-semibold text-blue-500 dark:text-blue-400 mb-1">
											{UI_TEXT.aiTools.chat.aiName}
										</p>
										<div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
											{UI_TEXT.aiTools.chat.welcome[selectedLanguage]}
										</div>
									</div>
								</div>

								{/* Chat messages */}
								{chatMessages.map((msg, idx) =>
									msg.role === "ai" ? (
										<div key={idx} className="flex items-start">
											<div className="max-w-[85%]">
												<p className="text-xs font-semibold text-blue-500 dark:text-blue-400 mb-1">
													{UI_TEXT.aiTools.chat.aiName}
												</p>
												<div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
													<ReactMarkdown
														remarkPlugins={[remarkGfm]}
														components={chatMarkdownComponents}
													>
														{normalizeMarkdown(msg.content)}
													</ReactMarkdown>
												</div>
											</div>
										</div>
									) : (
										<div key={idx} className="flex justify-end">
											<div className="bg-blue-500 text-white rounded-2xl rounded-tr-none px-4 py-3 text-sm max-w-[80%] break-words">
												{msg.content}
											</div>
										</div>
									),
								)}

								{/* Thinking indicator */}
								{isChatLoading && (
									<div className="flex items-start">
										<div>
											<p className="text-xs font-semibold text-blue-500 dark:text-blue-400 mb-1">
												{UI_TEXT.aiTools.chat.aiName}
											</p>
											<div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic">
												{UI_TEXT.aiTools.loading[selectedLanguage]}
											</div>
										</div>
									</div>
								)}

								{/* Chat error */}
								{chatError && (
									<p className="text-center text-sm text-red-500 dark:text-red-400">
										{chatError}
									</p>
								)}

								<div ref={chatEndRef} />
							</div>

							{/* Input Area */}
							<div className="border-t border-gray-200 dark:border-gray-700 pt-3">
								<p className="mb-2 text-red-400 dark:text-red-500 text-xs italic">
									* {UI_TEXT.aiTools.disclaimer[selectedLanguage]}
								</p>
								<div className="flex gap-2 items-end">
									<div className="flex-1 relative">
										<textarea
											value={chatInput}
											onChange={(e) =>
												setChatInput(e.target.value.slice(0, MAX_CHAT_LENGTH))
											}
											placeholder={
												UI_TEXT.aiTools.chat.placeholder[selectedLanguage]
											}
											className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
											rows={2}
											onKeyDown={(e) => {
												if (e.key === "Enter" && !e.shiftKey) {
													e.preventDefault();
													handleSendChat();
												}
											}}
										/>
										<span
											className={`absolute bottom-3 right-3 text-xs font-mono ${charCountColor}`}
										>
											{chatInput.length}/{MAX_CHAT_LENGTH}
										</span>
									</div>
									<button
										onClick={handleSendChat}
										disabled={!chatInput.trim() || isChatLoading}
										className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-colors"
									>
										{UI_TEXT.aiTools.chat.send[selectedLanguage]}
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
