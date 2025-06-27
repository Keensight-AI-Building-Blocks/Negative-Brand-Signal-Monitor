// app/components/ErrorDisplay.jsx
import React from 'react';
export default function ErrorDisplay({ message, onRetry, isMinor = false }) {





    return (
        <div role="alert">
            <p>
                <span>{isMinor ? 'Warning:' : 'Error:'}</span> {message || 'An unexpected error occurred.'}
            </p>
            {onRetry && !isMinor && (
                <button

                    onClick={onRetry}

                >
                    Try again
                </button>

            )}
        </div>
    );
}