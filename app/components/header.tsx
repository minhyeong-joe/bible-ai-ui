export default function Header() {
    return (
    <div className="flex flex-col items-center justify-center py-8 px-4 bg-blue-100 dark:bg-slate-800">
        <img src="/img/logo.png" alt="Bible AI Logo" className="h-24 w-24 mb-4" />
        <h1 className="text-4xl text-center font-bold mb-4 text-gray-900 dark:text-white">Welcome to Bible AI</h1>
        <p className="text-lg text-gray-500 mb-8 text-center">
            Deepen your Bible reading with AI-powered background context and personalized reflection questions for any passage.
        </p>
    </div>
    );
}