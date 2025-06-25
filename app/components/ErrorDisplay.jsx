// app/components/ErrorDisplay.jsx
import React from 'react';
export default function ErrorDisplay({ message, onRetry, isMinor = false }) {
    const baseClasses = "p-4 rounded-md border";
    const colorClasses = isMinor
        ? "bg-yellow-50 border-yellow-300 text-yellow-800"
        : "bg-red-50 border-red-300 text-red-800";

    return (
        <div className={`${baseClasses} ${colorClasses}`} role="alert">
            <p>
                <span className="font-medium">{isMinor ? 'Warning:' : 'Error:'}</span> {message || 'An unexpected error occurred.'}
            </p>
            {onRetry && !isMinor && (
                <button
                    onClick={onRetry}
                    className="mt-2 text-sm font-medium text-red-700 hover:underline"
                >
                    Try again
                </button>
            )}
        </div>
    );
}
