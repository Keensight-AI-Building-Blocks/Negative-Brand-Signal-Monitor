// lib/api.js

// Base URL for your API routes (adjust if needed, usually relative)
const API_BASE_URL = "/api";

/**
 * Fetches prioritized mentions from the backend.
 * Assumes the API route is /api/mentions
 */
export async function fetchMentions() {
  try {
    const response = await fetch(`${API_BASE_URL}/mentions`); // GET request by default
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    // Add basic validation if needed
    return data.mentions || []; // Expect an object like { mentions: [...] }
  } catch (error) {
    console.error("Error fetching mentions:", error);
    throw error; // Re-throw to be caught by the component
  }
}

/**
 * Requests AI assistance for a specific mention.
 * Assumes the API route is /api/assist
 * @param {string} mentionId - The ID of the mention to get assistance for.
 * @param {object} mentionContext - Relevant details of the mention.
 */
export async function fetchAssistance(mentionId, mentionContext) {
  try {
    const response = await fetch(`${API_BASE_URL}/assist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mentionId, context: mentionContext }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to parse error response" }));
      throw new Error(
        `HTTP error! Status: ${response.status} - ${
          errorData.message || "Unknown error"
        }`
      );
    }
    const data = await response.json();
    // Add basic validation if needed
    return data; // Expect an object like { suggestion: "...", strategy: "..." }
  } catch (error) {
    console.error("Error fetching AI assistance:", error);
    throw error; // Re-throw to be caught by the component
  }
}

// Add other API call functions as needed (e.g., updating status, etc.)
