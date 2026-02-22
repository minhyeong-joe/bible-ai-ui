export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-blue-50 dark:bg-slate-900 z-50">
            <img
                src="/img/logo.png"
                alt="Bible AI Logo"
                className="h-20 w-20 mb-6 animate-pulse"
            />
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-6" />
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium tracking-wide">
                Spinning up Server…
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                This may take up to 30 seconds on first load.
            </p>
        </div>
    );
}
