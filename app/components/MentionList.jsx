// app/components/MentionItem.jsx
import React from 'react';
import SentimentBadge from './SentimentBadge';
import { formatDistanceToNow } from 'date-fns'; // Import date-fns function

// Helper to format dates using date-fns
const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        // Example: "about 5 hours ago", "less than a minute ago"
        return formatDistanceToNow(new Date(isoString), { addSuffix: true });
    } catch (e) {
        console.error("Date formatting error:", e);
        return 'Invalid Date';
    }
};


export default function MentionItem({ mention, onAssistClick }) {
    // Destructure expected properties from the mention object (reflecting api/mentions route)
    const {
        id,
        text,
        source, // e.g., 'Reddit'
        url,
        sentiment, // e.g., 'Negative', 'Positive', 'Neutral', 'Analysis Pending'
        tone,      // e.g., 'anger', 'joy', 'confused', 'sarcastic', 'Analysis Pending', 'Unknown' (depends on HF model)
        intent,    // Currently placeholder ('Comment') from API
        riskScore, // Calculated score (0-100)
        timestamp, // ISO string date
        threadPopularity, // e.g., Reddit score
        velocity, // e.g., comments/hour
        author,   // Added from Reddit API
        subreddit, // Added from Reddit API (e.g., 'r/YourBrand')
        numComments // Added from Reddit API
    } = mention;

    // Basic risk score styling (adjust thresholds and colors if needed)
    const getRiskColor = (score) => {
        score = score ?? 50; // Default to neutral if undefined
        if (score >= 75) return 'text-red-600 font-bold';
        if (score >= 50) return 'text-yellow-600 font-semibold';
        if (score >= 25) return 'text-blue-600';
        return 'text-gray-500';
    };

    return (
        // Using dark mode compatible base: bg-gray-800, text-gray-100/300
        <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 hover:shadow-lg hover:border-gray-600 transition-shadow duration-200">
            <div className="flex justify-between items-start mb-2 flex-wrap"> {/* Added flex-wrap */}
                {/* Left side: Source, Author, Subreddit */}
                <div className='mb-1 sm:mb-0'>
                    <span className="font-semibold text-lg mr-2 capitalize text-gray-100">{source || 'Unknown Source'}</span>
                    {author && <span className="text-sm text-gray-400 mr-2">by u/{author}</span>}
                    {subreddit && <span className="text-sm text-indigo-400">{subreddit}</span>}
                </div>
                {/* Right side: Risk Score, Timestamp */}
                <div className='text-right flex-shrink-0'>
                    <span className={`block text-sm ${getRiskColor(riskScore)} mb-1`}>
                        Risk: {riskScore?.toFixed(0) ?? 'N/A'}
                    </span>
                    <span className="block text-xs text-gray-500">{formatDate(timestamp)}</span>
                </div>
            </div>

            {/* Mention Text */}
            <p className="text-gray-300 mb-3 leading-relaxed break-words">{text || 'No content available.'}</p> {/* Allow long words to break */}

            {/* Tags: Sentiment, Tone, Intent, Velocity, Popularity, Comments */}
            <div className="flex flex-wrap gap-2 items-center mb-3 text-sm">
                <SentimentBadge type="sentiment" value={sentiment} />
                <SentimentBadge type="tone" value={tone} />
                {intent && intent !== "Comment" && <SentimentBadge type="intent" value={intent} />} {/* Only show intent if not default */}

                {/* Other metadata badges - using dark-friendly bg-gray-700 */}
                {velocity !== undefined && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded whitespace-nowrap">
                        Velocity: {velocity.toFixed(1)}/hr
                    </span>
                )}
                {threadPopularity !== undefined && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded whitespace-nowrap">
                        Popularity: {threadPopularity}
                    </span>
                )}
                {numComments !== undefined && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded whitespace-nowrap">
                        Comments: {numComments}
                    </span>
                )}
            </div>


            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 hover:underline text-sm transition-colors duration-150"
                    onClick={(e) => e.stopPropagation()} // Prevent card click if link is clicked
                    aria-label={`View source on ${source || 'platform'}`}
                >
                    View Source
                </a>
                <button
                    onClick={() => onAssistClick(mention)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-3 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                    aria-label={`Get AI assistance for mention by ${author || 'user'}`}
                >
                    Suggest Response
                </button>
            </div>
        </div>
    );
}