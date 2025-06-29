// app/components/Dashboard.jsx
'use client';
import React, { useState, useCallback, useEffect } from 'react';
import MentionList from './MentionList';
import ResponseAssistant from './ResponseAssistant';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import SearchHistorySidebar from './SearchHistorySidebar';
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

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('brandSearchHistory');
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse search history from localStorage", e);
      localStorage.removeItem('brandSearchHistory');
    }
  }, []);

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
    if (!brandQuery.trim()) return;

    const trimmedQuery = brandQuery.trim();
    if (!isFromHistory) setSearchQuery(trimmedQuery);

    setIsSearching(true);
    setError(null);
    setSearchPerformed(true);
    setActiveSearchTerm(trimmedQuery);
    updateSearchHistory(trimmedQuery);

    try {
      const fetchedMentions = await fetchMentions(trimmedQuery);
      if (Array.isArray(fetchedMentions)) {
        const sortedMentions = fetchedMentions.sort((a, b) => (Number(b.riskScore) || 0) - (Number(a.riskScore) || 0));
        setMentions(sortedMentions);
      } else {
        setError(`Unexpected response for "${trimmedQuery}"`);
        setMentions([]);
      }
    } catch (err) {
      setError(err.message || `Failed to load mentions for "${trimmedQuery}"`);
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
    if (searchQuery.trim()) {
      setMentions([]);
      performSearch(searchQuery);
    }
  };

  const handleHistoryItemClick = (term) => {
    setSearchQuery(term);
    setMentions([]);
    performSearch(term, true);
  };

  const handleAssistClick = useCallback(async (mention) => {
    if (!mention?.id || isAssistantLoading) return;

    setSelectedMention(mention);
    setAssistantResponse(null);
    setAssistantError(null);
    setIsAssistantLoading(true);

    try {
      const response = await fetchAssistance(mention.id, mention);
      setAssistantResponse(response);
    } catch (err) {
      setAssistantError(err.message || 'Failed to get assistance.');
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
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '200px', padding: '10px', borderRight: '1px solid #ccc' }}>
        <h2>Brand Monitor</h2>
        <SearchHistorySidebar
          history={searchHistory}
          onHistoryItemClick={handleHistoryItemClick}
          onClearHistory={handleClearSearchHistory}
        />
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Enter brand name (e.g., Google)"
            disabled={isSearching || !!selectedMention}
            style={{ flex: 1, padding: '8px' }}
          />
          <button type="submit" disabled={!searchQuery.trim() || isSearching || !!selectedMention}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Main Output */}
        {isSearching && <LoadingSpinner text={`Searching for "${activeSearchTerm}"...`} />}
        {!isSearching && error && <ErrorDisplay message={error} onRetry={() => performSearch(activeSearchTerm)} />}

        {!isSearching && !error && searchPerformed && (
          <div>
            {mentions.length > 0 ? (
              <>
                <h3>Output: "{activeSearchTerm}" ({mentions.length} results)</h3>
                <div>[Sentiment Scale will go here]</div>
                <div>[Sentiment Table will go here]</div>
                <MentionList mentions={mentions} onAssistClick={handleAssistClick} />
                <div style={{ marginTop: '10px' }}>
                  <button onClick={() => alert("Load More functionality to be implemented!")}>
                    Load More
                  </button>
                </div>
              </>
            ) : (
              <p>No mentions found for "{activeSearchTerm}".</p>
            )}
          </div>
        )}

        {!isSearching && !error && !searchPerformed && (
          <div>
            <p>Enter a brand name to monitor signals.</p>
          </div>
        )}
      </main>

      {/* Assistant Modal */}
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
