// app/components/MentionItem.jsx

import React from 'react';
import SentimentBadge from './SentimentBadge';
import { formatDistanceToNow } from 'date-fns';

const formatDate = (isoString) => {
    if (!isoString) return 'Date N/A';
    try {
        return formatDistanceToNow(new Date(isoString), { addSuffix: true });
    } catch (e) {
        console.error("Date formatting error:", e, "Input:", isoString);
        return 'Invalid Date';
    }
};

export default function MentionItem({ mention, onAssistClick }) {
    if (!mention || !mention.id) {
        return (
            <div className="mention-table-row">
                <div className="mention-table-cell" colSpan="3">
                    Invalid mention data received.
                </div>
            </div>
        );
    }

    const {
        url, text, author, metadata, sentiment, tone, intent, riskScore,
    } = mention;

    const displayAuthorName = author?.name || 'Unknown Author';
    const displaySubreddit = metadata?.redditSubreddit || '';

    // This is the new table row structure
    return (
        <div className="mention-table-row">
            {/* Cell 1: Author Info */}
            <div className="mention-table-cell">
                <strong>{displayAuthorName}</strong>
                <div style={{ fontSize: '0.9em', color: '#a0aec0' }}>{displaySubreddit}</div>
                <div style={{ fontSize: '0.9em', color: '#a0aec0', marginTop: '8px' }}>
                    Risk: {typeof riskScore === 'number' ? riskScore.toFixed(0) : 'N/A'}
                </div>
            </div>

            {/* Cell 2: Mention Details */}
            <div className="mention-table-cell">
                <p style={{ margin: '0 0 12px 0' }}>{text || 'No content available.'}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <SentimentBadge type="sentiment" value={sentiment || 'Pending'} />
                    <SentimentBadge type="tone" value={tone || 'Pending'} />
                    <SentimentBadge type="intent" value={intent || 'Pending'} />
                </div>
            </div>

            {/* Cell 3: Action Buttons */}
            <div className="mention-table-cell" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {url && url !== "#" ? (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        <button style={{ width: '100%' }}>View Source</button>
                    </a>
                ) : (
                    <span>No Link</span>
                )}
                <button
                    onClick={() => onAssistClick(mention)}
                    style={{ width: '100%' }}
                >
                    Suggest Response
                </button>
            </div>
        </div>
    );
}