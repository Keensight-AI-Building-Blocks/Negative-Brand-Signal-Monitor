// app/components/Dashboard.jsx
'use client';

import React, { useState, useCallback } from 'react';
import MentionList from './MentionList';
import ResponseAssistant from './ResponseAssistant';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { fetchMentions, fetchAssistance } from '../lib/api';

export default function Dashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearchTerm, setActiveSearchTerm] = useState('');
    const [mentions, setMentions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const [selectedMention, setSelectedMention] = useState(null);
    const [isAssistantLoading, setIsAssistantLoading] = useState(false);
    const [assistantResponse, setAssistantResponse] = useState(null);
    const [assistantError, setAssistantError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);

    const performSearch = useCallback(async (brandQuery) => {
        if (!brandQuery) return;
        console.log(`Searching for brand: ${brandQuery}`);
        setIsSearching(true);
        setError(null);
        setMentions([]);
        setSearchPerformed(true);
        try {
            const fetchedMentions = await fetchMentions(brandQuery);
            const sortedMentions = fetchedMentions.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
            setMentions(sortedMentions);
        } catch (err) {
            setError(err.message || `Failed to load mentions for "${brandQuery}".`);
            setMentions([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery) {
            setActiveSearchTerm(trimmedQuery);
            performSearch(trimmedQuery);
        } else {
            setActiveSearchTerm('');
            setMentions([]);
            setError(null);
            setSearchPerformed(false);
        }
    };

    // --- Handlers for AI Assistant (remain the same) ---
    const handleAssistClick = useCallback(async (mention) => {
        if (!mention || isAssistantLoading) return;
        setSelectedMention(mention);
        setAssistantResponse(null);
        setAssistantError(null);
        setIsAssistantLoading(true);
        try {
            const context = { /* ... context data ... */ };
            const response = await fetchAssistance(mention.id, context);
            setAssistantResponse(response);
        } catch (err) {
            setAssistantError(err.message || 'Failed to get assistance.');
            setAssistantResponse(null);
        } finally {
            setIsAssistantLoading(false);
        }
    }, [isAssistantLoading]);

    const handleCloseAssistant = () => {
        setSelectedMention(null);
        setAssistantResponse(null);
        setAssistantError(null);
    };

    // --- Render Logic ---
    // Use flex column to position search bar below results area
    return (
        <div className="flex flex-col h-[calc(100vh-10rem)]"> {/* Adjust height calculation based on header/padding */}

            {/* Main Content / Results Area (Mimics 'Dashboard' box) */}
            <div className="flex-grow overflow-y-auto p-4 mb-4 border border-gray-600 rounded-lg min-h-[200px]"> {/* Added border, padding, min-height */}
                {isSearching && <LoadingSpinner text={`Searching for "${activeSearchTerm}"...`} />}

                {error && <ErrorDisplay message={error} onRetry={() => performSearch(activeSearchTerm)} />}

                {!isSearching && !error && searchPerformed && mentions.length === 0 && (
                    <p className="text-center text-gray-400 py-4 italic">
                        No mentions found for "{activeSearchTerm}".
                    </p>
                )}

                {!isSearching && !error && !searchPerformed && mentions.length === 0 && (
                    <p className="text-center text-gray-400 py-4 italic">
                        Enter a brand name below and click Search.
                    </p>
                )}

                {/* Mention List */}
                {!isSearching && mentions.length > 0 && (
                    <div className={selectedMention ? 'opacity-50 pointer-events-none' : ''}>
                        <h2 className="text-xl font-semibold mb-4 text-gray-100">
                            Results for "{activeSearchTerm}"
                        </h2>
                        {/* Ensure MentionList/MentionItem styles are updated for dark mode */}
                        <MentionList mentions={mentions} onAssistClick={handleAssistClick} />
                    </div>
                )}
            </div>

            {/* Search Bar Area (Mimics bottom search bar) */}
            <div className="mt-auto p-2"> {/* Pushes search bar to the bottom */}
                <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full max-w-4xl mx-auto"> {/* Centered, max width */}
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleInputChange}
                        placeholder="Enter brand name (e.g., YourBrand)"
                        // Styling closer to the image: dark bg, rounded, larger text/padding
                        className="w-full px-5 py-3 pr-16 text-base bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-100 placeholder-gray-400"
                        aria-label="Search Brand Mentions"
                        disabled={isSearching || !!selectedMention}
                    />
                    <button
                        type="submit"
                        // Position button inside input area if desired, or keep adjacent
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!searchQuery.trim() || isSearching || !!selectedMention}
                    >
                        {isSearching ? '...' : 'Search'} {/* Or use an icon */}
                    </button>
                </form>
            </div>


            {/* AI Response Assistant Modal (Render logic is the same, ensure its internal styles are dark-themed) */}
            {selectedMention && (
                <ResponseAssistant
                    mention={selectedMention}
                    response={assistantResponse}
                    isLoading={isAssistantLoading}
                    error={assistantError}
                    onClose={handleCloseAssistant}
                />
            )}
        </div>
    );
}