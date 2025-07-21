// lib/api.js
/**
 * Fetches mentions for a given brand query from the backend API.
 * @param {string} brandQuery - The brand to search for.
 * @returns {Promise<Array>} A promise that resolves to an array of mentions.
 */
export async function fetchMentions(brandQuery) {
  const response = await fetch(
    `/api/mentions?brandQuery=${encodeURIComponent(brandQuery)}`
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch mentions");
  }
  return response.json();
}

/**
 * Requests AI-powered response assistance for a specific mention.
 * @param {string} mentionId - The ID of the mention.
 * @param {object} mentionContext - The full context of the mention.
 * @returns {Promise<object>} A promise that resolves to the AI-generated suggestion and strategy.
 */
export async function fetchAssistance(mentionId, mentionContext) {
  const response = await fetch("/api/assist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mentionId, mentionContext }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch assistance");
  }
  return response.json();
}

/**
 * Verifies if a search query corresponds to a real brand.
 * @param {string} query - The search term to verify.
 * @returns {Promise<{isBrand: boolean, brandName: string}>} A promise that resolves to the verification result.
 */
export async function verifyBrand(query) {
  const response = await fetch("/api/verify-brand", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Brand verification failed");
  }
  return response.json();
}
