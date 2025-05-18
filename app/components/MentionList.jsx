import React from 'react';
import SentimentBadge from './SentimentBadge';
import { formatDistanceToNow } from 'date-fns';

// Helper to format dates using date-fns
const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        return formatDistanceToNow(new Date(isoString), { addSuffix: true });
    } catch (e) {
        console.error("Date formatting error:", e);
        return 'Invalid Date';
    }
};

export default function MentionItem({ mention, onAssistClick }) {
    // FIX: Add a guard clause to handle undefined or null mention prop
    if (!mention) {
        console.warn("MentionItem received an invalid 'mention' prop. Skipping render.");
        return null; // Don't render the item if mention is not valid
    }

    // Destructure directly from the augmented ModelContext object received from the API
    const {
        id,
        sourceType, // Use sourceType instead of source
        url,
        text,
        title,
        author, // Object: { name, url }
        metadata, // Object: { createdAt, redditScore, redditNumComments, redditSubreddit, ... }
        tags,
        // Analysis results added by API route:
        sentiment,
        tone,
        intent, // Still likely a placeholder
        riskScore,
    } = mention;

    // Access specific metadata fields safely
    const createdAt = metadata?.createdAt;
    const popularity = metadata?.redditScore ?? metadata?.quoraViews ?? 0; // Example handling multiple sources
    const numComments = metadata?.redditNumComments; // Example
    const subreddit = metadata?.redditSubreddit; // Example

    // Basic risk score styling
    const getRiskColor = (score) => {
        score = score ?? 50;
        if (score >= 75) return 'text-red-400 font-bold'; // Adjusted for dark mode
        if (score >= 50) return 'text-yellow-400 font-semibold'; // Adjusted for dark mode
        if (score >= 25) return 'text-blue-400'; // Adjusted for dark mode
        return 'text-gray-400';
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 hover:shadow-lg hover:border-gray-600 transition-shadow duration-200">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-2 flex-wrap">
                <div className='mb-1 sm:mb-0'>
                    {/* Display Source Type and Title or Author/Subreddit */}
                    <span className="font-semibold text-lg mr-2 capitalize text-gray-100">{sourceType || 'Unknown'}</span>
                    {title && <span className="text-md text-gray-300 mr-2">"{title}"</span>}
                    {!title && author?.name && <span className="text-sm text-gray-400 mr-2">by u/{author.name}</span>}
                    {!title && subreddit && <span className="text-sm text-indigo-400">{subreddit}</span>}
                </div>
                <div className='text-right flex-shrink-0'>
                    <span className={`block text-sm ${getRiskColor(riskScore)} mb-1`}>
                        Risk: {riskScore?.toFixed(0) ?? 'N/A'}
                    </span>
                    <span className="block text-xs text-gray-500">{formatDate(createdAt)}</span>
                </div>
            </div>

            {/* Mention Text */}
            <p className="text-gray-300 mb-3 leading-relaxed break-words">{text || 'No content available.'}</p>

            {/* Tags: Sentiment, Tone, Intent, etc. */}
            <div className="flex flex-wrap gap-2 items-center mb-3 text-sm">
                <SentimentBadge type="sentiment" value={sentiment} />
                <SentimentBadge type="tone" value={tone} />
                {/* Only show intent if it's not the default/placeholder */}
                {intent && !['Comment', 'Unknown', null, undefined].includes(intent) && <SentimentBadge type="intent" value={intent} />}

                {/* Display selected metadata */}
                {popularity !== undefined && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded whitespace-nowrap">
                        Pop: {popularity}
                    </span>
                )}
                {numComments !== undefined && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded whitespace-nowrap">
                        Comments: {numComments}
                    </span>
                )}
                {/* Display tags if any */}
                {tags?.map(tag => <span key={tag} className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded">{tag}</span>)}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
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
                <button
                    onClick={() => onAssistClick(mention)} // Pass the full mention object
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-3 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                    aria-label={`Get AI assistance for mention`}
                >
                    Suggest Response
                </button>
            </div>
        </div>
    );
}