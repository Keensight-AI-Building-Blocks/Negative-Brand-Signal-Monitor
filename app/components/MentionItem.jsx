import React, { useState } from 'react';
import SentimentBadge from './SentimentBadge';

export default function MentionItem({ mention }) {
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
        url, text, author, metadata, sentiment, tone, intent, riskScore, isOffensive
    } = mention;

    const [isCensored, setIsCensored] = useState(isOffensive); // State to control censorship

    const displayAuthorName = author?.name || 'Unknown Author';
    const displaySubreddit = metadata?.redditSubreddit || '';

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
                <p
                    style={{ margin: '0 0 12px 0' }}
                    className={isCensored ? 'censored-text' : ''}
                    onClick={() => isCensored && setIsCensored(false)}
                    title={isCensored ? 'Click to reveal content' : ''}
                >
                    {text || 'No content available.'}
                </p>
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
                {/* "Suggest Response" button is now completely removed. */}
            </div>
        </div>
    );
}