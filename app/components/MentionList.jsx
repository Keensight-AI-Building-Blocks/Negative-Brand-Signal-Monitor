// app/components/MentionList.jsx

import React from 'react';
import MentionItem from './MentionItem';

export default function MentionList({ mentions, onAssistClick }) {
    if (!mentions) {
        return <p>Loading mentions or an unexpected error occurred.</p>;
    }

    if (mentions.length === 0) {
        return null;
    }

    // The table structure starts here
    return (
        <div className="mention-table">
            {/* Table Header */}
            <div className="mention-table-header">
                <div className="mention-table-cell">Author</div>
                <div className="mention-table-cell">Mention Details</div>
                <div className="mention-table-cell">Actions</div>
            </div>

            {/* Table Body - Renders each mention as a row */}
            <div>
                {mentions.map((mention) => (
                    <MentionItem
                        key={mention.id || `mention-${Math.random()}`}
                        mention={mention}
                        onAssistClick={onAssistClick}
                    />
                ))}
            </div>
        </div>
    );
}