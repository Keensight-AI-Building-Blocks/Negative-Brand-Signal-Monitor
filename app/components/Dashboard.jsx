'use client';
import React, { useState, useCallback, useEffect } from 'react';
import ResponseAssistant from './ResponseAssistant';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import SearchHistorySidebar from './SearchHistorySidebar';
// Import all three API functions, including the new verifyBrand
import { fetchMentions, fetchAssistance, verifyBrand } from '../lib/api';
// Import for date formatting in the locally-defined MentionItem component
import { formatDistanceToNow } from 'date-fns';

const MAX_HISTORY_ITEMS = 10;

// ===================================================================================
// START: Locally Redefined Components to Implement Censorship
// To satisfy the constraint of only modifying Dashboard.jsx, the relevant
// components (SentimentBadge, MentionItem, and MentionList) are redefined here.
// ===================================================================================

/**
 * A simple, self-contained badge component to display sentiment, tone, etc.
 * Based on the original SentimentBadge.jsx.
 */
function SentimentBadge({ value }) {
  if (value === null || value === undefined || value === '') return null;
  const valueLower = String(value).toLowerCase();
  const displayValue = valueLower.charAt(0).toUpperCase() + valueLower.slice(1);
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '0.85em',
      backgroundColor: 'var(--surface-color)',
      border: '1px solid var(--border-color)'
    }}>
      {displayValue}
    </span>
  );
}


/**
 * A new, self-contained MentionItem component with integrated censorship logic.
 * Based on the original MentionItem.jsx.
 */
function CensoredMentionItem({ mention, onAssistClick, censorEnabled }) {
  const [isRevealed, setIsRevealed] = useState(false);

  // Reset reveal state if the mention object itself changes
  useEffect(() => {
    setIsRevealed(false);
  }, [mention]);

  if (!mention || !mention.id) {
    return (
      <div className="mention-table-row">
        <div className="mention-table-cell" colSpan="3">
          Invalid mention data received.
        </div>
      </div>
    );
  }

  const { url, text, author, metadata, sentiment, tone, intent, riskScore, isOffensive } = mention;

  // Determine if the comment should be actively censored
  const isCensored = censorEnabled && isOffensive && !isRevealed;

  const displayAuthorName = author?.name || 'Unknown Author';
  const displaySubreddit = metadata?.redditSubreddit || '';

  return (
    <div className="mention-table-row">
      {/* Cell 1: Author Info */}
      <div className="mention-table-cell">
        <strong>{displayAuthorName}</strong>
        <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>{displaySubreddit}</div>
        <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginTop: '8px' }}>
          Risk: {typeof riskScore === 'number' ? riskScore.toFixed(0) : 'N/A'}
        </div>
      </div>

      {/* Cell 2: Mention Details with Censorship Logic */}
      <div className="mention-table-cell">
        <p
          className={isCensored ? 'censored-text' : ''}
          style={{ margin: '0 0 12px 0', cursor: (censorEnabled && isOffensive) ? 'pointer' : 'default' }}
          onClick={() => { if (censorEnabled && isOffensive) setIsRevealed(!isRevealed); }}
          title={(censorEnabled && isOffensive) ? 'Click to reveal/hide offensive content' : ''}
        >
          {text || 'No content available.'}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <SentimentBadge value={sentiment || 'Pending'} />
          <SentimentBadge value={tone || 'Pending'} />
          <SentimentBadge value={intent || 'Pending'} />
        </div>
      </div>

      {/* Cell 3: Action Buttons */}
      <div className="mention-table-cell" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {url && url !== "#" ? (
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%' }}>View Source</button>
          </a>
        ) : (
          <span>No Link</span>
        )}

      </div>
    </div>
  );
}

/**
 * A new list component that uses the CensoredMentionItem.
 * Based on the original MentionList.jsx.
 */
function CensoredMentionList({ mentions, onAssistClick, censorEnabled }) {
  if (!mentions) {
    return <p>Loading mentions or an unexpected error occurred.</p>;
  }

  if (mentions.length === 0) {
    // Return null instead of the "No data found" message to be controlled by the parent.
    return null;
  }

  return (
    <div className="mention-table">
      {/* Table Header */}
      <div className="mention-table-header">
        <div className="mention-table-cell">Author</div>
        <div className="mention-table-cell">Mention Details</div>
        <div className="mention-table-cell">Actions</div>
      </div>

      {/* Table Body */}
      <div>
        {mentions.map((mention) => (
          <CensoredMentionItem
            key={mention.id || `mention-${Math.random()}`}
            mention={mention}
            onAssistClick={onAssistClick}
            censorEnabled={censorEnabled}
          />
        ))}
      </div>
    </div>
  );
}

// ===================================================================================
// END: Locally Redefined Components
// ===================================================================================


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
  // --- NEW STATE for censorship feature ---
  const [censorEnabled, setCensorEnabled] = useState(true);

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
    // Only save non-empty history
    if (searchHistory.length > 0) {
      localStorage.setItem('brandSearchHistory', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  const updateSearchHistory = useCallback((term) => {
    setSearchHistory(prevHistory => {
      const updatedHistory = [term, ...prevHistory.filter(item => item.toLowerCase() !== term.toLowerCase())];
      return updatedHistory.slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

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
    setMentions([]); // Clear previous results
    setSearchPerformed(true);
    setActiveSearchTerm(trimmedQuery);

    try {
      // Step 1: Verify if the query is a real brand
      const verification = await verifyBrand(trimmedQuery);

      // If OpenAI determines it's not a brand, set an error and stop.
      if (!verification.isBrand) {
        setError("No brand or company exists.");
        setIsSearching(false);
        return; // Halt the search process
      }

      // Step 2: If verified, update history and fetch mentions
      updateSearchHistory(trimmedQuery);
      // This implementation assumes fetchMentions returns objects with an `isOffensive: boolean` property.
      const fetchedMentions = await fetchMentions(trimmedQuery);

      if (Array.isArray(fetchedMentions)) {
        const sortedMentions = fetchedMentions.sort((a, b) => (Number(b.riskScore) || 0) - (Number(a.riskScore) || 0));
        setMentions(sortedMentions);
      } else {
        // Handle unexpected API response structure
        setError(`Unexpected response for "${trimmedQuery}"`);
        setMentions([]);
      }
    } catch (err) {
      setError(err.message || `Failed to perform search for "${trimmedQuery}"`);
      setMentions([]);
    } finally {
      setIsSearching(false);
    }
  }, [updateSearchHistory]);

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handleHistoryItemClick = (term) => {
    setSearchQuery(term);
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
      <aside style={{ width: '200px', padding: '10px', borderRight: '1px solid #ccc' }}>
        <h2>Brand Monitor</h2>
        <SearchHistorySidebar
          history={searchHistory}
          onHistoryItemClick={handleHistoryItemClick}
          onClearHistory={handleClearSearchHistory}
        />
      </aside>

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

        {/* Main Output Area */}
        {isSearching && <LoadingSpinner text={`Searching for "${activeSearchTerm}"...`} />}

        {/* Displays "No brand or company exists." or other API errors */}
        {!isSearching && error && <ErrorDisplay message={error} onRetry={() => performSearch(activeSearchTerm)} />}

        {/* Displays results or "No data found." message */}
        {!isSearching && !error && searchPerformed && (
          <div>
            {mentions.length > 0 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>Output: "{activeSearchTerm}" ({mentions.length} results)</h3>
                  {/* --- NEW UI for censorship feature --- */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9em' }}>
                    <input
                      type="checkbox"
                      checked={censorEnabled}
                      onChange={(e) => setCensorEnabled(e.target.checked)}
                    />
                    Blur Offensive Comments
                  </label>
                </div>

                {/* --- USE THE NEW CENSORED MENTION LIST --- */}
                <CensoredMentionList
                  mentions={mentions}
                  onAssistClick={handleAssistClick}
                  censorEnabled={censorEnabled}
                />

                <div style={{ marginTop: '10px' }}>

                </div>
              </>
            ) : (
              // This message now displays ONLY if the brand is valid but has no data.
              <p>No data found.</p>
            )}
          </div>
        )}

        {/* Initial prompt before any search is performed */}
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