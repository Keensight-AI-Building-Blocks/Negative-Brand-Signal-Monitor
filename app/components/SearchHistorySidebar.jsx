// app/components/SearchHistorySidebar.jsx
import React from 'react';

export default function SearchHistorySidebar({ history, onHistoryItemClick, onClearHistory }) {
    if (!history || history.length === 0) {
        return (
            <div>
                No search history yet.
            </div>
        );
    }
    return (
        <div>
            <div>
                <h3>Search History</h3>
                <button
                    onClick={onClearHistory}


                    title="Clear search history"
                >
                    Clear
                </button>
            </div>

            <ul>
                {history.map((item, index) => (
                    <li key={`${item}-${index}`}>
                        <button

                            onClick={() => onHistoryItemClick(item)}

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