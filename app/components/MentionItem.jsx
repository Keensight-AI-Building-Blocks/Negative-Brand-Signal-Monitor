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
            <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-red-700 text-red-300">
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
        if (isNaN(numericScore)) return 'text-gray-400';
        if (numericScore >= 75) return 'text-red-400 font-bold';
        if (numericScore >= 50) return 'text-yellow-400 font-semibold';
        if (numericScore >= 25) return 'text-blue-400';
        return 'text-gray-400';
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 hover:shadow-lg hover:border-gray-600 transition-shadow duration-200">
            <div className="flex justify-between items-start mb-3 flex-wrap">
                <div className='mb-1 sm:mb-0 flex-grow'>
                    <span className="font-semibold text-lg mr-2 capitalize text-gray-100">{sourceType || 'Unknown Source'}</span>
                    {title && <span className="text-md text-gray-300 mr-2 break-all">"{title}"</span>}
                    {!title && displayAuthorName && <span className="text-sm text-gray-400 mr-2">by {displayAuthorName}</span>}
                    {!title && displaySubreddit && <span className="text-sm text-indigo-400">{displaySubreddit}</span>}
                </div>
                <div className='text-right flex-shrink-0 ml-2'>
                    <span className={`block text-sm ${getRiskColor(riskScore)} mb-1`}>
                        Risk Score: {typeof riskScore === 'number' ? riskScore.toFixed(0) : 'N/A'}
                    </span>
                    {geminiRiskLevel && <span className="block text-xs text-gray-500">AI Risk: {geminiRiskLevel}</span>}
                    <span className="block text-xs text-gray-500 mt-1">{formatDate(createdAt)}</span>
                </div>
            </div>

            <p className="text-gray-300 mb-3 leading-relaxed break-words whitespace-pre-wrap">{text || 'No content available.'}</p>

            {analysisError && (
                <div className="mb-3 p-2 bg-red-900 bg-opacity-50 border border-red-700 rounded text-red-300 text-xs">
                    <strong className="font-semibold">Analysis Note:</strong> {typeof analysisError === 'string' ? analysisError : JSON.stringify(analysisError)}
                </div>
            )}

            <div className="flex flex-wrap gap-2 items-center mb-3 text-sm">
                <SentimentBadge type="sentiment" value={sentiment || 'Pending'} />
                <SentimentBadge type="tone" value={tone || 'Pending'} />
                <SentimentBadge type="intent" value={intent || 'Pending'} />
                {sentimentScore !== undefined && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded whitespace-nowrap">
                        Sentiment Score: {typeof sentimentScore === 'number' ? sentimentScore.toFixed(2) : 'N/A'}
                    </span>
                )}
            </div>

            {keyPhrases && keyPhrases.length > 0 && (
                <div className="mb-3">
                    <strong className="text-xs text-gray-400 block mb-1">Key Phrases:</strong>
                    <div className="flex flex-wrap gap-1">
                        {keyPhrases.map((phrase, index) => (
                            <span key={index} className="text-xs bg-teal-800 text-teal-200 px-1.5 py-0.5 rounded">
                                {phrase}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-2 items-center mb-3 text-sm">
                {popularity !== 'N/A' && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded whitespace-nowrap">
                        Popularity: {popularity}
                    </span>
                )}
                {numComments !== 'N/A' && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded whitespace-nowrap">
                        Comments: {numComments}
                    </span>
                )}
                {velocity !== undefined && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded whitespace-nowrap">
                        Velocity: {typeof velocity === 'number' ? velocity.toFixed(2) : 'N/A'}
                    </span>
                )}
                {tags && tags.map(tag => <span key={tag} className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded">{tag}</span>)}
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                {url && url !== "#" ? (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 hover:underline text-sm transition-colors duration-150"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`View source on ${sourceType || 'platform'}`}
                    >
                        View Source
                    </a>
                ) : (
                    <span className="text-sm text-gray-500">No source link</span>
                )}
                <button
                    onClick={() => onAssistClick(mention)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-3 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                    aria-label={`Get AI assistance for mention`}
                >
                    Suggest Response
                </button>
            </div>
        </div>
    );
}