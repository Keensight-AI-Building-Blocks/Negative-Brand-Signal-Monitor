// app/components/ResponseAssistant.jsx
import React from 'react';
import LoadingSpinner from './LoadingSpinner'; // Ensure this component exists and works
import ErrorDisplay from './ErrorDisplay';   // Ensure this component exists and works

export default function ResponseAssistant({ mention, response, isLoading, error, onClose }) {
    // Early return if no mention is selected (prevents errors accessing mention properties)
    if (!mention) {
        return null;
    }

    // Defensive check for response structure (optional but good practice)
    const suggestion = response?.suggestion ?? null;
    const strategy = response?.strategy ?? null;

    return (
        // Modal Backdrop
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out">

            {/* Modal Panel */}
            <div className="bg-gray-800 text-gray-200 rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto border border-gray-700 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-scale-in">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white text-3xl leading-none font-semibold p-1 outline-none focus:outline-none"
                    aria-label="Close assistant"
                    title="Close" // Added title for accessibility
                >
                    &times; {/* Close icon */}
                </button>

                {/* Modal Header */}
                <h3 className="text-xl font-semibold mb-4 text-gray-100 border-b border-gray-700 pb-2">
                    AI Response Assistant
                </h3>

                {/* Original Mention Context Box */}
                <div className="mb-4 p-3 bg-gray-700 rounded border border-gray-600">
                    <h4 className="font-semibold text-sm mb-1 text-gray-400">Original Mention:</h4>
                    {/* Use optional chaining and fallbacks for safety */}
                    <p className="text-sm text-gray-300 mb-1 italic break-words">
                        "{mention?.text ?? 'No text available'}"
                    </p>
                    <p className="text-xs text-gray-500">
                        Source: {mention?.source ?? 'N/A'} | Sentiment: {mention?.sentiment ?? 'N/A'} | Tone: {mention?.tone ?? 'N/A'}
                    </p>
                    {mention?.url && (
                        <a
                            href={mention.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-400 hover:underline hover:text-indigo-300 transition-colors"
                        >
                            View Source
                        </a>
                    )}
                </div>

                {/* AI Response Section */}
                <div className="mt-4">
                    <h4 className="font-semibold text-sm mb-2 text-gray-400">Suggested Response & Strategy:</h4>

                    {/* Loading State */}
                    {isLoading && <LoadingSpinner text="Generating suggestions..." />}

                    {/* Error State */}
                    {/* Pass isMinor=true for less intrusive styling */}
                    {error && !isLoading && <ErrorDisplay message={error} isMinor={true} />}

                    {/* Success State */}
                    {/* Only render response section if not loading and no error */}
                    {!isLoading && !error && response && (
                        <div className="space-y-4 p-3 bg-gray-700 rounded border border-gray-600">
                            {/* Display Suggestion */}
                            {suggestion ? ( // Check if suggestion exists
                                <div>
                                    <strong className="text-sm text-gray-300 block mb-1">Suggested Text:</strong>
                                    <pre className="text-sm text-gray-100 whitespace-pre-wrap font-sans bg-gray-600 p-3 rounded border border-gray-500">{suggestion}</pre>
                                    {/* Using <pre> preserves whitespace/newlines from the AI */}
                                </div>
                            ) : (
                                // Show a message if suggestion is missing but response exists
                                <p className="text-sm text-gray-400 italic">No response suggestion was generated.</p>
                            )}

                            {/* Display Strategy */}
                            {strategy ? ( // Check if strategy exists
                                <div>
                                    <strong className="text-sm text-gray-300 block mb-1">Engagement Strategy:</strong>
                                    <p className="text-sm text-gray-200 whitespace-pre-wrap mt-1">{strategy}</p>
                                </div>
                            ) : (
                                // Show a message if strategy is missing but response exists
                                <p className="text-sm text-gray-400 italic">No engagement strategy was provided.</p>
                            )}
                        </div>
                    )}
                    {/* Message if response is null/undefined and not loading/erroring */}
                    {!isLoading && !error && !response && (
                        <p className="text-sm text-gray-400 italic p-3 bg-gray-700 rounded border border-gray-600">Click "Suggest Response" on a mention to get started.</p>
                    )}
                </div>

                {/* Close Button (Footer) */}
                <button
                    onClick={onClose}
                    className="mt-6 bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                >
                    Close Assistant
                </button>
            </div>
            {/* Simple animation helper - add this CSS to your globals.css or similar */}
            <style jsx global>{`
                @keyframes fade-scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-scale-in {
                    animation: fade-scale-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}