// app/components/Dashboard.jsx
'use client';
import React, { useState, useCallback, useEffect } from 'react';
import MentionList from './MentionList';
import ResponseAssistant from './ResponseAssistant';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import SearchHistorySidebar from './SearchHistorySidebar'; // Import the new component
import { fetchMentions, fetchAssistance } from '../lib/api';

const MAX_HISTORY_ITEMS = 10;
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
    const [searchHistory, setSearchHistory] = useState([]);

    // Load search history from localStorage on mount
    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('brandSearchHistory');
            if (storedHistory) {
                setSearchHistory(JSON.parse(storedHistory));
            }
        } catch (e) {
            console.error("Failed to parse search history from localStorage", e);
            localStorage.removeItem('brandSearchHistory'); // Clear corrupted history
        }
    }, []);

    // Update localStorage when searchHistory changes
    useEffect(() => {
        localStorage.setItem('brandSearchHistory', JSON.stringify(searchHistory));
    }, [searchHistory]);

    const updateSearchHistory = (term) => {
        setSearchHistory(prevHistory => {
            const updatedHistory = [term, ...prevHistory.filter(item => item.toLowerCase() !== term.toLowerCase())];
            return updatedHistory.slice(0, MAX_HISTORY_ITEMS);
        });
    };

    const handleClearSearchHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('brandSearchHistory');
    };

    const performSearch = useCallback(async (brandQuery, isFromHistory = false) => {
        if (!brandQuery || brandQuery.trim() === "") return;

        const trimmedQuery = brandQuery.trim();
        console.log(`Dashboard: Searching for brand: ${trimmedQuery}`);

        if (!isFromHistory) { // Only update history if it's a new search input
            setSearchQuery(trimmedQuery); // Update search bar text for new searches
        }

        setIsSearching(true);
        setError(null);
        setSearchPerformed(true);
        setActiveSearchTerm(trimmedQuery);
        updateSearchHistory(trimmedQuery);

        try {
            const fetchedMentions = await fetchMentions(trimmedQuery);
            console.log("Dashboard: Fetched Mentions (Raw API Response):", JSON.stringify(fetchedMentions, null, 2));

            if (Array.isArray(fetchedMentions)) {
                const sortedMentions = fetchedMentions.sort((a, b) => (Number(b.riskScore) || 0) - (Number(a.riskScore) || 0));
                setMentions(sortedMentions);
                if (sortedMentions.length === 0) {
                    console.log("Dashboard: No mentions found for the query after fetch.");
                }
            } else {
                console.error("Dashboard: Fetched mentions is not an array:", fetchedMentions);
                setError(`Received unexpected data format for "${trimmedQuery}".`);
                setMentions([]);
            }
        } catch (err) {
            console.error("Dashboard: Error in performSearch:", err);
            setError(err.message || `Failed to load mentions for "${trimmedQuery}".`);
            setMentions([]);
        } finally {
            setIsSearching(false);
        }
    }, [searchHistory]); // Added searchHistory to useCallback dependencies for updateSearchHistory

    const handleHistoryItemClick = (term) => {
        setSearchQuery(term); // Set the search bar to the clicked term
        setMentions([]);      // Clear current mentions
        performSearch(term, true); // Pass true to indicate it's from history
    };

    const handleInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery) {
            setMentions([]);
            performSearch(trimmedQuery);
        } else {
            // Optionally clear results if search is submitted with empty query
            // setActiveSearchTerm('');
            // setMentions([]);
            // setError(null);
            // setSearchPerformed(false);
        }
    };

    const handleAssistClick = useCallback(async (mention) => {
        if (!mention || !mention.id || isAssistantLoading) {
            console.warn("Assist click ignored: Invalid mention object or assistant busy.", mention);
            return;
        }
        setSelectedMention(mention);
        setAssistantResponse(null);
        setAssistantError(null);
        setIsAssistantLoading(true);
        try {
            const response = await fetchAssistance(mention.id, mention);
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

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 p-0 border-r border-gray-700 flex flex-col fixed top-0 left-0 h-full z-20">
                <div className="p-4 border-b border-gray-700">
                    <h1 className="text-2xl font-bold text-gray-100">Brand Monitor</h1>
                </div>
                <SearchHistorySidebar
                    history={searchHistory}
                    onHistoryItemClick={handleHistoryItemClick}
                    onClearHistory={handleClearSearchHistory}
                />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col ml-64 overflow-hidden"> {/* ml-64 to offset sidebar */}
                {/* Search Bar Area - now at the top of the main content */}
                <div className="p-4 border-b border-gray-700 bg-gray-850">
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full max-w-2xl mx-auto"> {/* Centered */}
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleInputChange}
                            placeholder="Enter brand name (e.g., Google, Coca-Cola)"
                            // Added text-lg for slightly larger text, text-gray-100 for input color
                            className="w-full px-6 py-3 text-lg bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 text-gray-100 placeholder-gray-400 shadow-sm"
                            aria-label="Search Brand Mentions"
                            disabled={isSearching || !!selectedMention}
                        />
                        <button
                            type="submit"
                            // Adjusted button style for better aesthetics
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed shadow-md focus:ring-2 focus:ring-indigo-400"
                            disabled={!searchQuery.trim() || isSearching || !!selectedMention}
                        >
                            {isSearching ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Search'}
                        </button>
                    </form>
                </div>

                {/* Results Area */}
                <div className="flex-grow overflow-y-auto p-6 bg-gray-900"> {/* Main content scroll */}
                    {isSearching && <div className="flex justify-center mt-10"><LoadingSpinner text={`Searching for "${activeSearchTerm}"...`} /></div>}

                    {!isSearching && error && <div className="mt-4"><ErrorDisplay message={error} onRetry={() => performSearch(activeSearchTerm)} /></div>}

                    {/* "Output:" text and results */}
                    {!isSearching && !error && searchPerformed && (
                        <>
                            {mentions.length > 0 ? (
                                <div className={selectedMention ? 'opacity-60 pointer-events-none' : ''}>
                                    <h2 className="text-2xl font-semibold mb-2 text-gray-100">
                                        Output: <span className="text-indigo-400">"{activeSearchTerm}"</span> ({mentions.length} results)
                                    </h2>
                                    {/* Placeholder for Sentiment Scale - Item 4 */}
                                    <div className="my-4 p-3 bg-gray-800 rounded-lg text-center text-sm text-gray-400">
                                        [Sentiment Scale for "{activeSearchTerm}" will go here]
                                    </div>

                                    {/* Placeholder for Sentiment Table - Item 5 - For now, using existing MentionList */}
                                    <div className="my-4 text-center text-sm text-gray-400">
                                        [Sentiment Table will go here. Displaying as list for now.]
                                    </div>
                                    <MentionList mentions={mentions} onAssistClick={handleAssistClick} />

                                    {/* Placeholder for Load More button - Item 6 */}
                                    <div className="mt-8 text-center">
                                        <button
                                            className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-4 rounded-lg transition duration-150"
                                            onClick={() => alert("Load More functionality to be implemented!")}
                                        >
                                            Load More
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-gray-400 py-8 text-lg italic">
                                    No mentions found for "{activeSearchTerm}".
                                </p>
                            )}
                        </>
                    )}

                    {!isSearching && !error && !searchPerformed && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            <p className="text-center text-gray-500 text-lg">
                                Enter a brand name to monitor signals.
                            </p>
                        </div>
                    )}
                </div>
            </main>

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