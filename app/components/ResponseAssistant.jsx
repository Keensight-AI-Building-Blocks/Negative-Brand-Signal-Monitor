// app/components/ResponseAssistant.jsx
import React from 'react';
import LoadingSpinner from './LoadingSpinner';
// Ensure this component exists and works
import ErrorDisplay from './ErrorDisplay';
// Ensure this component exists and works

export default function ResponseAssistant({ mention, response, isLoading, error, onClose }) {
    // Early return if no mention is selected (prevents errors accessing mention properties)
    if (!mention) {
        return null;
    }

    // Defensive check for response structure (optional but good practice)
    const suggestion = response?.suggestion ??
        null;
    const strategy = response?.strategy ?? null;
    return (
        // Modal Backdrop
        <div>

            {/* Modal Panel */}
            <div>

                {/* Close Button */}
                <button
                    onClick={onClose}

                    aria-label="Close assistant"

                    title="Close" // Added title for accessibility
                >
                    &times; {/* Close icon */}
                </button>

                {/* Modal Header */}

                <h3>
                    AI Response Assistant
                </h3>

                {/* Original Mention Context Box */}
                <div>

                    <h4>Original Mention:</h4>
                    {/* Use optional chaining and fallbacks for safety */}
                    <p>
                        "{mention?.text ??
                            'No text available'}"
                    </p>
                    <p>
                        Source: {mention?.source ?? 'N/A'} | Sentiment: {mention?.sentiment ?? 'N/A'} | Tone: {mention?.tone ?? 'N/A'}

                    </p>
                    {mention?.url && (
                        <a
                            href={mention.url}

                            target="_blank"
                            rel="noopener noreferrer"

                        >

                            View Source
                        </a>
                    )}
                </div>

                {/* AI Response Section */}

                <div>
                    <h4>Suggested Response & Strategy:</h4>

                    {/* Loading State */}
                    {isLoading && <LoadingSpinner text="Generating suggestions..." />}


                    {/* Error State */}
                    {/* Pass isMinor=true for less intrusive styling */}
                    {error && !isLoading && <ErrorDisplay message={error} isMinor={true} />}

                    {/* Success State */}

                    {/* Only render response section if not loading and no error */}
                    {!isLoading && !error && response && (
                        <div>

                            {/* Display Suggestion */}
                            {suggestion ?
                                ( // Check if suggestion exists
                                    <div>
                                        <strong>Suggested Text:</strong>

                                        <pre>{suggestion}</pre>
                                        {/* Using <pre> preserves whitespace/newlines from the AI */}
                                    </div>

                                ) : (
                                    // Show a message if suggestion is missing but response exists

                                    <p>No response suggestion was generated.</p>
                                )}

                            {/* Display Strategy */}
                            {strategy ?
                                ( // Check if strategy exists
                                    <div>
                                        <strong>Engagement Strategy:</strong>

                                        <p>{strategy}</p>
                                    </div>
                                ) : (

                                    // Show a message if strategy is missing but response exists
                                    <p>No engagement strategy was provided.</p>
                                )}

                        </div>
                    )}
                    {/* Message if response is null/undefined and not loading/erroring */}
                    {!isLoading && !error && !response && (

                        <p>Click "Suggest Response" on a mention to get started.</p>
                    )}
                </div>

                {/* Close Button (Footer) */}

                <button
                    onClick={onClose}

                >
                    Close Assistant

                </button>
            </div>
            {/* Simple animation helper - add this CSS to your globals.css or similar */}

        </div>
    );
}