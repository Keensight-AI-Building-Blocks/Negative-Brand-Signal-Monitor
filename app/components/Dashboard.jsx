// app/components/Dashboard.jsx
'use client'; // Mark as a Client Component

import React, { useState, useCallback } from 'react'; // Removed useEffect initially
import MentionList from './MentionList';
import ResponseAssistant from './ResponseAssistant';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { fetchMentions, fetchAssistance } from '../lib/api'; // Import API functions

export default function Dashboard() {
    const [searchQuery, setSearchQuery] = useState(''); // User input
    const [activeSearchTerm, setActiveSearchTerm] = useState(''); // Last searched term
    const [mentions, setMentions] = useState([]);
    const [isSearching, setIsSearching] = useState(false); // Specific loading state for search
    const [error, setError] = useState(null);
    const [selectedMention, setSelectedMention] = useState(null); // For AI Assistant
    const [isAssistantLoading, setIsAssistantLoading] = useState(false);
    const [assistantResponse, setAssistantResponse] = useState(null);
    const [assistantError, setAssistantError] = useState(null);
    const [initialLoadDone, setInitialLoadDone] = useState(false); // Track if we've searched at least once

    // Function to fetch mentions data based on a query
    const executeSearch = useCallback(async (termToSearch) => {
        if (!termToSearch || termToSearch.trim() === '') {
            // setError('Please enter a brand name to search.');
            setMentions([]);
            setIsSearching(false);
            setInitialLoadDone(true); // Mark as "search" done even if empty
            return;
        }

        // Don't refetch if assistant is open/loading
        if (selectedMention || isAssistantLoading) return;

        console.log(`Executing search for: "${termToSearch}"`); // For debugging
        setIsSearching(true);
        setError(null);
        setMentions([]); // Clear previous results immediately
        setActiveSearchTerm(termToSearch); // Set the term being actively searched

        try {
            const fetchedMentions = await fetchMentions(termToSearch);
            // Sort mentions by Risk Score (descending)
            const sortedMentions = fetchedMentions.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
            setMentions(sortedMentions);
        } catch (err) {
            setError(err.message || `Failed to load mentions for "${termToSearch}".`);
            setMentions([]); // Clear potentially stale data on error
        } finally {
            setIsSearching(false);
            setInitialLoadDone(true); // Mark search as done
        }
    }, [selectedMention, isAssistantLoading]); // Dependencies for useCallback

    // Handle search input change
    const handleQueryChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // Handle triggering the search on button click or Enter key
    const handleSearchSubmit = (event) => {
        event.preventDefault(); // Prevent form submission if it's in a form
        executeSearch(searchQuery);
    };

    // --- AI Assistant Logic (mostly unchanged) ---
    const handleAssistClick = useCallback(async (mention) => {
        if (!mention || isAssistantLoading) return;
        setSelectedMention(mention);
        setAssistantResponse(null);
        setAssistantError(null);
        setIsAssistantLoading(true);
        try {
            const context = {
                text: mention.text,
                source: mention.source,
                url: mention.url,
                sentiment: mention.sentiment,
                tone: mention.tone,
                threadPopularity: mention.threadPopularity,
            };
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
    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center p-4 bg-white rounded-lg shadow border border-gray-200">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleQueryChange}
                    placeholder="Enter brand name (e.g., BrandA, YourBrand)"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    aria-label="Search for brand mentions"
                    disabled={isSearching} // Disable input while searching
                />
                <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSearching ? 'Searching...' : 'Search'}
                </button>
            </form>

            {/* Display Area Title */}
            <h2 className="text-2xl font-semibold text-gray-700">
                {activeSearchTerm ? `Results for "${activeSearchTerm}"` : "Search Results"}
            </h2>

            {/* Loading State */}
            {isSearching && <LoadingSpinner text={`Searching for "${activeSearchTerm}"...`} />}

            {/* Error State */}
            {!isSearching && error && <ErrorDisplay message={error} onRetry={() => executeSearch(activeSearchTerm)} />}

            {/* Content Display */}
            {!isSearching && !error && initialLoadDone && (
                mentions.length > 0 ? (
                    <MentionList mentions={mentions} onAssistClick={handleAssistClick} />
                ) : (
                    <p className="text-gray-500 italic text-center py-4">
                        {activeSearchTerm
                            ? `No negative mentions found for "${activeSearchTerm}".`
                            : 'Enter a brand name above and click Search.'
                        }
                    </p>
                )
            )}
            {!initialLoadDone && !isSearching && (
                <p className="text-gray-500 italic text-center py-4">Enter a brand name above to search for mentions.</p>
            )}


            {/* AI Response Assistant Modal (conditionally rendered) */}
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
