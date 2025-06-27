// app/components/SentimentBadge.jsx
import React from 'react';

export default function SentimentBadge({ type = 'sentiment', value }) {
    // Handle null, undefined, or empty string values gracefully
    if (value === null || value === undefined || value === '') return null;
    const valueLower = String(value).toLowerCase();

    // Capitalize the first letter of the value for display, keep type lowercase
    const displayValue = valueLower.charAt(0).toUpperCase() + valueLower.slice(1);
    return (
        <span>
            {/* You can choose to show the type or not */}
            {/* Option 1: Show Type: Value */}
            {/* {`${type}: ${displayValue}`} */}

            {/* Option 2: Just show Value (often clearer with distinct colors) */}
            {displayValue}
        </span>
    );
}