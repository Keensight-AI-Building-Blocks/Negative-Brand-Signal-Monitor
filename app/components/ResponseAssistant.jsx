// app/components/ResponseAssistant.jsx
import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';

export default function ResponseAssistant({ mention, response, isLoading, error, onClose }) {
    if (!mention) return null; // Don't render if no mention is selected

    return (
        // Basic Modal structure using Tailwind (you might prefer a dedicated modal library)
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                    aria-label="Close assistant"
                >
                    &times; {/* Close icon */}
                </button>

                <h3 className="text-xl font-semibold mb-4 text-gray-800">AI Response Assistant</h3>

                {/* Original Mention Context */}
                <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                    <h4 className="font-semibold text-sm mb-1 text-gray-600">Original Mention:</h4>
                    <p className="text-sm text-gray-700 mb-1 italic">"{mention.text}"</p>
                    <p className="text-xs text-gray-500">Source: {mention.source} | Sentiment: {mention.sentiment} | Tone: {mention.tone}</p>
                    {mention.url && <a href={mention.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">View Source</a>}
                </div>

                {/* AI Response Section */}
                <div className="mt-4">
                    <h4 className="font-semibold text-sm mb-2 text-gray-600">Suggested Response & Strategy:</h4>
                    {isLoading && <LoadingSpinner text="Generating suggestions..." />}
                    {error && <ErrorDisplay message={error} isMinor={true} />}
                    {response && !isLoading && !error && (
                        <div className="space-y-3 p-3 bg-green-50 rounded border border-green-200">
                            {response.suggestion && (
                                <div>
                                    <strong className="text-sm text-green-800">Suggested Text:</strong>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-2 rounded border border-gray-200 mt-1">{response.suggestion}</p>
                                </div>
                            )}
                            {response.strategy && (
                                <div>
                                    <strong className="text-sm text-green-800">Engagement Strategy:</strong>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">{response.strategy}</p>
                                </div>
                            )}
                            {/* Add other fields from the response if available (e.g., similar past issues) */}
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
                >
                    Close Assistant
                </button>
            </div>
        </div>
    );
}