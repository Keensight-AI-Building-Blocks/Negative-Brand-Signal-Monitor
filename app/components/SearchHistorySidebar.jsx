// app/components/SearchHistorySidebar.jsx
import React from 'react';

export default function SearchHistorySidebar({ history, onHistoryItemClick, onClearHistory }) {
    if (!history || history.length === 0) {
        return (
            <div className="p-4 text-sm text-gray-400">
                No search history yet.
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-100">Search History</h3>
                <button
                    onClick={onClearHistory}
                    className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                    title="Clear search history"
                >
                    Clear
                </button>
            </div>
            <ul className="space-y-2">
                {history.map((item, index) => (
                    <li key={`${item}-${index}`}>
                        <button
                            onClick={() => onHistoryItemClick(item)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md focus:outline-none focus:bg-gray-700 transition-colors duration-150 truncate"
                            title={`Search for: ${item}`}
                        >
                            {item}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}