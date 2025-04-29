// app/components/SentimentBadge.jsx
import React from 'react';

// Define colors based on type and value (customize these extensively)
const BADGE_STYLES = {
    sentiment: {
        negative: 'bg-red-100 text-red-800 border border-red-300',
        neutral: 'bg-gray-100 text-gray-800 border border-gray-300',
        positive: 'bg-green-100 text-green-800 border border-green-300',
        default: 'bg-gray-100 text-gray-800 border border-gray-300',
    },
    tone: {
        angry: 'bg-red-200 text-red-900 border border-red-400',
        confused: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
        sarcastic: 'bg-purple-100 text-purple-800 border border-purple-300',
        default: 'bg-blue-100 text-blue-800 border border-blue-300', // Default for other tones
    },
    intent: {
        complaint: 'bg-orange-100 text-orange-800 border border-orange-300',
        question: 'bg-teal-100 text-teal-800 border border-teal-300',
        rant: 'bg-pink-100 text-pink-800 border border-pink-300',
        meme: 'bg-indigo-100 text-indigo-800 border border-indigo-300',
        default: 'bg-gray-100 text-gray-800 border border-gray-300',
    },
    // Add more types if needed
};

export default function SentimentBadge({ type = 'sentiment', value }) {
    if (!value) return null; // Don't render if no value

    const valueLower = String(value).toLowerCase();
    const styles = BADGE_STYLES[type] || BADGE_STYLES.sentiment; // Fallback type
    const colorClass = styles[valueLower] || styles.default;

    return (
        <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colorClass}`}
        >
            {`${type}: ${value}`}
        </span>
    );
}