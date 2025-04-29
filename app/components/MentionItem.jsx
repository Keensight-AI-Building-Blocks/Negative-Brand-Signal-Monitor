// app/components/MentionItem.jsx
import React from 'react';
import SentimentBadge from './SentimentBadge';

// Helper to format dates (you might want a more robust library like date-fns)
const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString();
    } catch (e) {
        return 'Invalid Date';
    }
};


export default function MentionItem({ mention, onAssistClick }) {
    // Destructure expected properties from the mention object
    const {
        id,
        text,
        source,
        url,
        sentiment,
        tone,
        intent,
        riskScore,
        timestamp,
        threadPopularity, // Example extra data
        velocity // Example extra data
    } = mention;

    // Basic risk score styling (adjust thresholds and colors)
    const getRiskColor = (score) => {
        if (score >= 75) return 'text-red-600 font-bold';
        if (score >= 50) return 'text-yellow-600 font-semibold';
        if (score >= 25) return 'text-blue-600';
        return 'text-gray-500';
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="font-semibold text-lg mr-2 capitalize">{source || 'Unknown Source'}</span>
                    <span className={`text-sm ${getRiskColor(riskScore)}`}>
                        Risk: {riskScore?.toFixed(0) ?? 'N/A'}
                    </span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(timestamp)}</span>
            </div>

            <p className="text-gray-800 mb-3 leading-relaxed line-clamp-3">{text || 'No content available.'}</p> {/* Limit initial text display */}

            <div className="flex flex-wrap gap-2 items-center mb-3 text-sm">
                <SentimentBadge type="sentiment" value={sentiment} />
                <SentimentBadge type="tone" value={tone} />
                <SentimentBadge type="intent" value={intent} />
                {/* Display other metadata */}
                {velocity !== undefined && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Velocity: {velocity.toFixed(1)}/hr</span>}
                {threadPopularity !== undefined && <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Popularity: {threadPopularity}</span>}
            </div>


            <div className="flex justify-between items-center mt-2">
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                    onClick={(e) => e.stopPropagation()} // Prevent card click if link is clicked
                >
                    View Source
                </a>
                <button
                    onClick={() => onAssistClick(mention)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1 px-3 rounded-md transition duration-150 ease-in-out"
                    aria-label={`Get AI assistance for mention ${id}`}
                >
                    Suggest Response
                </button>
            </div>
        </div>
    );
}