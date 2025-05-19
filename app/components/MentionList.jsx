import React from 'react';
import MentionItem from './MentionItem';

export default function MentionList({ mentions, onAssistClick }) {
    // The Dashboard component now handles the "No mentions found" case
    // So, if mentions is an empty array here, it's likely intended (e.g., after a search with no results)
    // or before the first search.
    if (!mentions) {
        // This case should ideally not happen if Dashboard initializes mentions to []
        return <p className="text-center text-gray-400">Loading mentions or an unexpected error occurred.</p>;
    }

    // If mentions is an empty array, Dashboard.jsx handles the "No mentions found" message,
    // so returning null here (or an empty fragment) is appropriate to avoid duplicate messages.
    if (mentions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {mentions.map((mention) => (
                <MentionItem
                    // Ensure a unique and stable key. If mention.id might not always be unique
                    // across different fetches or sources before full processing, consider a more robust key.
                    // However, since IDs are usually like `reddit_xyz123`, they should be unique.
                    key={mention.id || `mention-${Math.random()}`} // Fallback key, though ideally id is always present
                    mention={mention}
                    onAssistClick={onAssistClick}
                />
            ))}
        </div>
    );
}