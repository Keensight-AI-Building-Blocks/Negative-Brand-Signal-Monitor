// app/components/Dashboard.jsx
'use client'; // Mark as a Client Component

import React, { useState, useEffect, useCallback } from 'react';
import MentionList from './MentionList';
import ResponseAssistant from './ResponseAssistant';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { fetchMentions, fetchAssistance } from '../lib/api'; // Import API functions

const POLLING_INTERVAL = 30000; // Fetch new data every 30 seconds (adjust as needed)

export default function Dashboard() {
    const [mentions, setMentions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMention, setSelectedMention] = useState(null); // For AI Assistant
    const [isAssistantLoading, setIsAssistantLoading] = useState(false);
    const [assistantResponse, setAssistantResponse] = useState(null);
    const [assistantError, setAssistantError] = useState(null);

    // Function to fetch mentions data
    const loadMentions = useCallback(async () => {
        // Don't refetch if already loading or assistant is open/loading
        if (isLoading || selectedMention || isAssistantLoading) return;

        // console.log("Fetching mentions..."); // For debugging
        setIsLoading(true);
        setError(null);
        try {
            const fetchedMentions = await fetchMentions();
            // Sort mentions by Risk Score (descending) - Assuming higher is worse
            // Adjust sorting based on your actual risk score logic
            const sortedMentions = fetchedMentions.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
            setMentions(sortedMentions);
        } catch (err) {
            setError(err.message || 'Failed to load mentions.');
            setMentions([]); // Clear potentially stale data on error
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, selectedMention, isAssistantLoading]); // Dependencies for useCallback


    // Initial fetch and polling
    useEffect(() => {
        loadMentions(); // Initial fetch

        // Set up polling interval
        const intervalId = setInterval(loadMentions, POLLING_INTERVAL);

        // Cleanup function to clear interval on component unmount
        return () => clearInterval(intervalId);
    }, [loadMentions]); // Run effect when loadMentions function identity changes


    // Handler for clicking the 'Assist' button on a mention
    const handleAssistClick = useCallback(async (mention) => {
        if (!mention || isAssistantLoading) return;

        // console.log("Assist requested for:", mention.id); // Debugging
        setSelectedMention(mention);
        setAssistantResponse(null); // Clear previous response
        setAssistantError(null); // Clear previous error
        setIsAssistantLoading(true);

        try {
            // Prepare context (adjust based on what your LLM needs)
            const context = {
                text: mention.text,
                source: mention.source,
                url: mention.url,
                sentiment: mention.sentiment,
                tone: mention.tone,
                threadPopularity: mention.threadPopularity, // Add other relevant fields
            };
            const response = await fetchAssistance(mention.id, context);
            setAssistantResponse(response);
        } catch (err) {
            setAssistantError(err.message || 'Failed to get assistance.');
            setAssistantResponse(null); // Clear response data on error
        } finally {
            setIsAssistantLoading(false);
        }
    }, [isAssistantLoading]); // Dependency for useCallback

    // Handler to close the assistant view
    const handleCloseAssistant = () => {
        setSelectedMention(null);
        setAssistantResponse(null);
        setAssistantError(null);
    };

    // --- Render Logic ---
    if (isLoading && mentions.length === 0) { // Show initial loading spinner
        return <LoadingSpinner />;
    }

    if (error && mentions.length === 0) { // Show error if initial load failed
        return <ErrorDisplay message={error} onRetry={loadMentions} />;
    }

    return (
        <div className="space-y-6">
            {/* Optional: Display general error/loading status even when data exists */}
            {error && !selectedMention && <ErrorDisplay message={`Update failed: ${error}`} isMinor={true} />}
            {isLoading && !selectedMention && <div className="text-sm text-gray-500">Updating...</div>}

            {/* AI Response Assistant Modal/Section */}
            {selectedMention && (
                <ResponseAssistant
                    mention={selectedMention}
                    response={assistantResponse}
                    isLoading={isAssistantLoading}
                    error={assistantError}
                    onClose={handleCloseAssistant}
                />
            )}

            {/* Mentions List Section - Don't render list if assistant is open? Or grey it out? */}
            <div className={selectedMention ? 'opacity-50 pointer-events-none' : ''}>
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Negative Signal Feed</h2>
                {mentions.length > 0 ? (
                    <MentionList mentions={mentions} onAssistClick={handleAssistClick} />
                ) : (
                    <p className="text-gray-500 italic">No negative mentions detected currently.</p>
                )}
            </div>
        </div>
    );
}