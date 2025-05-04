// lib/api.js
import axios from "axios"; // Use axios or native fetch

/**
 * Fetches prioritized mentions for a specific brand query from the backend API.
 * @param {string} brandQuery - The brand name to search for.
 */
export async function fetchMentions(brandQuery) {
  console.log(`API Lib: Fetching mentions for query: "${brandQuery}"...`);
  if (!brandQuery || brandQuery.trim() === "") {
    console.log("API Lib: No query provided, returning empty array.");
    return [];
  }

  try {
    // Use a relative URL to call the internal Next.js API route
    const response = await axios.get(
      `/api/mentions?brandQuery=${encodeURIComponent(brandQuery.trim())}`
    );
    console.log(
      `API Lib: Received ${response.data?.length ?? 0} mentions from backend.`
    );
    return response.data || []; // Ensure returning an array
  } catch (error) {
    console.error(
      "API Lib Error fetching mentions:",
      error.response?.data || error.message
    );
    // Throw a more specific error message to the component
    const errorMessage =
      error.response?.data?.error ||
      `Failed to fetch mentions for "${brandQuery}". Check network or server logs.`;
    throw new Error(errorMessage);
  }
}

/**
 * Requests AI assistance for a specific mention from the backend API.
 * @param {string} mentionId - The ID of the mention.
 * @param {object} mentionContext - Relevant details (text, sentiment, tone, source etc.).
 */
export async function fetchAssistance(mentionId, mentionContext) {
  console.log(`API Lib: Fetching assistance for mention ${mentionId}...`);
  if (!mentionId || !mentionContext) {
    throw new Error("Mention ID and context are required for assistance.");
  }

  try {
    // Use a relative URL to call the internal Next.js API route
    const response = await axios.post("/api/assist", {
      mentionId,
      mentionContext,
    });
    console.log("API Lib: Received assistance from backend.");
    return response.data;
  } catch (error) {
    console.error(
      "API Lib Error fetching assistance:",
      error.response?.data || error.message
    );
    const errorMessage =
      error.response?.data?.error ||
      "Failed to get AI assistance. Check network or server logs.";
    throw new Error(errorMessage);
  }
}
