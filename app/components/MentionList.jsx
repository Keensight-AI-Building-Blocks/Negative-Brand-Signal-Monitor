// app/components/MentionList.jsx
import React from 'react';
import MentionItem from './MentionItem';

export default function MentionList({ mentions, onAssistClick }) {
    if (!mentions || mentions.length === 0) {
        return <p className="text-center text-gray-500 py-4">No mentions to display.</p>;
    }

    return (
        <div className="space-y-4">
            {mentions.map((mention) => (
                <MentionItem
                    key={mention.id} // Make sure each mention has a unique ID from the backend
                    mention={mention}
                    onAssistClick={onAssistClick}
                />
            ))}
        </div>
    );
}