export default function DropdownNavigation() {
  // TODO: Populate options via API call
  
  return (
    <div className="dropdowns mt-6 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <select className="w-4/5 sm:w-full mb-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option value="">Select Bible Version</option>
        <option value="niv">NIV</option>
        <option value="esv">ESV</option>
        <option value="kjv">KJV</option>
      </select>
      <select className="w-4/5 sm:w-full mb-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option value="">Select Book</option>
        <option value="genesis">Genesis</option>
        <option value="exodus">Exodus</option>
        <option value="leviticus">Leviticus</option>
      </select>
      <select className="w-4/5 sm:w-full mb-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option value="">Select Chapter</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>
    </div>
  );
}
