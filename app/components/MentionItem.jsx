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
        console.warn("MentionItem received an invalid 'mention' prop or missing ID. Skipping render.", mention);
        return (
            <div>
                Invalid mention data received. Cannot render item.
            </div>
        );
    }

    const {
        id,
        sourceType,
        url,
        text,
        title,
        author,
        metadata,
        tags = [],
        sentiment,
        sentimentScore,
        tone,

        intent,
        keyPhrases = [],
        riskScore,
        geminiRiskLevel,
        analysisError,
        velocity,
        authorName,
        subreddit
    } = mention;
    const createdAt = metadata?.createdAt;
    const popularity = metadata?.redditScore ?? metadata?.quoraViews ?? 'N/A';
    const numComments = metadata?.redditNumComments ?? 'N/A';
    const displaySubreddit = subreddit || metadata?.redditSubreddit || '';
    const displayAuthorName = authorName || author?.name || 'Unknown Author';
    const getRiskColor = (score) => {
        const numericScore = Number(score);
        if (isNaN(numericScore)) return '';
        if (numericScore >= 75) return '';
        if (numericScore >= 50) return '';
        if (numericScore >= 25) return '';
        return '';
    };

    return (
        <div>
            <div>
                <div>
                    <span>{sourceType || 'Unknown Source'}</span>

                    {title && <span>"{title}"</span>}
                    {!title && displayAuthorName && <span>by {displayAuthorName}</span>}
                    {!title && displaySubreddit && <span>{displaySubreddit}</span>}
                </div>

                <div>
                    <span>
                        Risk Score: {typeof riskScore === 'number' ?
                            riskScore.toFixed(0) : 'N/A'}
                    </span>
                    {geminiRiskLevel && <span>AI Risk: {geminiRiskLevel}</span>}
                    <span>{formatDate(createdAt)}</span>
                </div>

            </div>

            <p>{text ||
                'No content available.'}</p>

            {analysisError && (
                <div>
                    <strong>Analysis Note:</strong> {typeof analysisError === 'string' ? analysisError : JSON.stringify(analysisError)}
                </div>
            )}


            <div>
                <SentimentBadge type="sentiment" value={sentiment ||
                    'Pending'} />
                <SentimentBadge type="tone" value={tone ||
                    'Pending'} />
                <SentimentBadge type="intent" value={intent ||
                    'Pending'} />
                {sentimentScore !== undefined && (
                    <span>
                        Sentiment Score: {typeof sentimentScore === 'number' ? sentimentScore.toFixed(2) : 'N/A'}

                    </span>
                )}
            </div>

            {keyPhrases && keyPhrases.length > 0 && (
                <div>
                    <strong>Key Phrases:</strong>

                    <div>
                        {keyPhrases.map((phrase, index) => (
                            <span key={index}>

                                {phrase}
                            </span>
                        ))}
                    </div>
                </div>

            )}

            <div>
                {popularity !== 'N/A' && (
                    <span>
                        Popularity: {popularity}

                    </span>
                )}
                {numComments !== 'N/A' && (
                    <span>

                        Comments: {numComments}
                    </span>
                )}
                {velocity !== undefined && (
                    <span>

                        Velocity: {typeof velocity === 'number' ?
                            velocity.toFixed(2) : 'N/A'}
                    </span>
                )}
                {tags && tags.map(tag => <span key={tag}>{tag}</span>)}
            </div>

            <div>

                {url && url !== "#" ?
                    (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"


                            onClick={(e) => e.stopPropagation()}
                            aria-label={`View source on ${sourceType || 'platform'}`}
                        >

                            View Source
                        </a>
                    ) : (
                        <span>No source link</span>

                    )}
                <button
                    onClick={() => onAssistClick(mention)}

                    aria-label={`Get AI assistance for mention`}

                >
                    Suggest Response
                </button>
            </div>
        </div>
    );
}