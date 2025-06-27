// app/components/Dashboard.jsx
'use client';
import React, { useState, useCallback, useEffect } from 'react';
import MentionList from './MentionList';
import ResponseAssistant from './ResponseAssistant';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import SearchHistorySidebar from './SearchHistorySidebar';
// Import the new component
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

                const sortedMentions = fetchedMentions.sort((a, b) => (Number(b.riskScore) || 0) - (Number(a.riskScore) ||
                    0));
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
        setSearchQuery(term);
        // Set the search bar to the clicked term
        setMentions([]);
        // Clear current mentions
        performSearch(term, true);
        // Pass true to indicate it's from history
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
        <div>
            {/* Sidebar */}
            <aside>
                <div>
                    <h1>Brand Monitor</h1>

                </div>
                <SearchHistorySidebar
                    history={searchHistory}
                    onHistoryItemClick={handleHistoryItemClick}
                    onClearHistory={handleClearSearchHistory}

                />
            </aside>

            {/* Main Content Area */}
            <main> {/* ml-64 to offset sidebar */}
                {/* Search Bar Area - now at the top of the main content */}

                <div>
                    <form onSubmit={handleSearchSubmit}> {/* Centered */}
                        <input
                            type="text"

                            value={searchQuery}
                            onChange={handleInputChange}
                            placeholder="Enter brand name (e.g., Google, Coca-Cola)"

                            // Added text-lg for slightly larger text, text-gray-100 for input color

                            aria-label="Search Brand Mentions"

                            disabled={isSearching ||
                                !!selectedMention}
                        />
                        <button
                            type="submit"

                            // Adjusted button style for better aesthetics

                            disabled={!searchQuery.trim() ||
                                isSearching || !!selectedMention}
                        >
                            {isSearching ?
                                (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>

                                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>

                                ) : 'Search'}
                        </button>
                    </form>
                </div>

                {/* Results Area */}
                <div > {/* Main content scroll */}
                    {isSearching && <div><LoadingSpinner text={`Searching for "${activeSearchTerm}"...`} /></div>}

                    {!isSearching && error && <div><ErrorDisplay message={error} onRetry={() => performSearch(activeSearchTerm)} /></div>}

                    {/* "Output:" text and results */}

                    {!isSearching && !error && searchPerformed && (
                        <>
                            {mentions.length > 0 ?
                                (
                                    <div>
                                        <h2>

                                            Output: <span>"{activeSearchTerm}"</span> ({mentions.length} results)
                                        </h2>
                                        {/* Placeholder for Sentiment Scale - 
Item 4 */}
                                        <div>
                                            [Sentiment Scale for "{activeSearchTerm}" will go here]

                                        </div>

                                        {/* Placeholder for Sentiment Table - Item 5 - For now, using existing MentionList */}

                                        <div>
                                            [Sentiment Table will go here.
                                            Displaying as list for now.]
                                        </div>
                                        <MentionList mentions={mentions} onAssistClick={handleAssistClick} />


                                        {/* Placeholder for Load More button - Item 6 */}
                                        <div>

                                            <button

                                                onClick={() =>
                                                    alert("Load More functionality to be implemented!")}
                                            >
                                                Load More

                                            </button>
                                        </div>
                                    </div>

                                ) : (
                                    <p>

                                        No mentions found for "{activeSearchTerm}".
                                    </p>
                                )}
                        </>
                    )}

                    {!isSearching &&
                        !error && !searchPerformed && (
                            <div>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>

                                <p>
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