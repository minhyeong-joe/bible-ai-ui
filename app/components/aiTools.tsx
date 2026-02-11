import { useState } from "react";

type TabType = "context" | "reflection" | null;

export default function AITools() {
  const [activeTab, setActiveTab] = useState<TabType>(null);
  const [contextContent, setContextContent] = useState<string>("");
  const [reflectionContent, setReflectionContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTabClick = async (tab: TabType) => {
    if (tab === null) return;
    
    setActiveTab(tab);

    // Only fetch if content hasn't been loaded yet
    if (tab === "context" && !contextContent) {
      setIsLoading(true);
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setContextContent(
        "This is placeholder content for background and context. Replace this with actual API response.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      );
      setIsLoading(false);
    } else if (tab === "reflection" && !reflectionContent) {
      setIsLoading(true);
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setReflectionContent(
        "These are placeholder reflection questions. Replace this with actual API response.\n\n1. What does this passage teach us about God's character?\n2. How can we apply this teaching in our daily lives?\n3. What questions do you have about this passage?"
      );
      setIsLoading(false);
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
          Background & Context
        </button>
        <button
          onClick={() => handleTabClick("reflection")}
          className={`px-6 py-3 font-medium transition-colors border-b-2 cursor-pointer ${
            activeTab === "reflection"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Reflection Questions
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
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
          ) : (
            <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {activeTab === "context" && <p>{contextContent}</p>}
              {activeTab === "reflection" && <p>{reflectionContent}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}