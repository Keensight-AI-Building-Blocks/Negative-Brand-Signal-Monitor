// app/components/SentimentBadge.jsx
import React from 'react';

// Define colors based on type and value (customize these extensively)
// Using darker backgrounds and lighter text for better contrast in dark mode UI
const BADGE_STYLES = {
    sentiment: {
        negative: 'bg-red-900 text-red-200 border border-red-700',
        neutral: 'bg-gray-700 text-gray-300 border border-gray-600',
        positive: 'bg-green-900 text-green-200 border border-green-700',
        'analysis pending': 'bg-yellow-900 text-yellow-200 border border-yellow-700 animate-pulse', // Added pending state
        default: 'bg-gray-700 text-gray-300 border border-gray-600',
    },
    tone: {
        // --- ADJUST THESE LABELS based on your actual Hugging Face Tone/Emotion model ---
        angry: 'bg-red-800 text-red-100 border border-red-600',
        anger: 'bg-red-800 text-red-100 border border-red-600', // Common label
        confused: 'bg-yellow-800 text-yellow-100 border border-yellow-600', // Keep if you map to this
        sad: 'bg-blue-800 text-blue-100 border border-blue-600',
        sadness: 'bg-blue-800 text-blue-100 border border-blue-600', // Common label
        fear: 'bg-purple-800 text-purple-100 border border-purple-600',
        sarcastic: 'bg-teal-800 text-teal-100 border border-teal-600', // Keep if you map or have model for it
        joy: 'bg-green-800 text-green-100 border border-green-600',
        love: 'bg-pink-800 text-pink-100 border border-pink-600',
        surprise: 'bg-indigo-800 text-indigo-100 border border-indigo-600',
        // --- End Model Specific Labels ---
        'analysis pending': 'bg-yellow-900 text-yellow-200 border border-yellow-700 animate-pulse', // Added pending state
        unknown: 'bg-gray-700 text-gray-300 border border-gray-600', // If API returns 'Unknown'
        default: 'bg-gray-600 text-gray-200 border border-gray-500', // Fallback for unmapped tones
    },
    intent: { // These are still placeholders based on original spec
        complaint: 'bg-orange-800 text-orange-100 border border-orange-600',
        question: 'bg-cyan-800 text-cyan-100 border border-cyan-600',
        rant: 'bg-rose-800 text-rose-100 border border-rose-600',
        meme: 'bg-violet-800 text-violet-100 border border-violet-600',
        comment: 'bg-gray-700 text-gray-300 border border-gray-600', // Default from API
        default: 'bg-gray-700 text-gray-300 border border-gray-600',
    },
};
export default function SentimentBadge({ type = 'sentiment', value }) {
    // Handle null, undefined, or empty string values gracefully
    if (value === null || value === undefined || value === '') return null;

    const valueLower = String(value).toLowerCase();
    const stylesForType = BADGE_STYLES[type] || BADGE_STYLES.sentiment; // Fallback to sentiment styles
    const colorClass = stylesForType[valueLower] || stylesForType.default; // Fallback to default style within type

    // Capitalize the first letter of the value for display, keep type lowercase
    const displayValue = valueLower.charAt(0).toUpperCase() + valueLower.slice(1);

    return (
        <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colorClass}`}
        >
            {/* You can choose to show the type or not */}
            {/* Option 1: Show Type: Value */}
            {/* {`${type}: ${displayValue}`} */}
            {/* Option 2: Just show Value (often clearer with distinct colors) */}
            {displayValue}
        </span>
    );
}