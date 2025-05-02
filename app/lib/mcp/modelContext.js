// lib/mcp/modelContext.js (or .ts if using TypeScript)

/**
 * Defines the standard structure for a mention context passed
 * between the MCP ingestion layer and processing layers.
 */
export const createModelContext = ({
  id, // Unique ID across all sources (e.g., "reddit_t3_xyz123")
  sourceType, // 'reddit' | 'quora' | 'twitter' | etc.
  sourceIdentifier, // Original ID on the platform (e.g., "t3_xyz123")
  url, // Direct URL to the content
  text, // Main content body/text
  title, // Optional title
  author, // Optional { id, name, url }
  parent, // Optional { id, url, title }
  metadata, // Source-specific data { createdAt (ISO), redditScore, etc. }
  fetchedAt, // ISO timestamp of ingestion
  tags = [], // Optional initial tags (e.g., [brandQuery])
  rawSourceData, // Optional raw data for debugging
}) => ({
  id: id || `${sourceType}_${sourceIdentifier}_${Date.now()}`, // Ensure unique ID
  sourceType: sourceType || "unknown",
  sourceIdentifier: sourceIdentifier || "unknown",
  url: url || "#",
  text: text || "",
  title: title || null,
  author: author || null,
  parent: parent || null,
  metadata: {
    createdAt: metadata?.createdAt || new Date().toISOString(),
    ...metadata, // Spread other metadata fields
  },
  fetchedAt: fetchedAt || new Date().toISOString(),
  tags: tags || [],
  rawSourceData: rawSourceData || null,

  // --- Fields added later by processing steps ---
  // sentiment: null,
  // tone: null,
  // intent: null,
  // riskScore: null,
});

// Example Usage:
// const mc = createModelContext({
//     sourceType: 'reddit',
//     sourceIdentifier: post.data.id,
//     /* ... other fields mapped from Reddit API ... */
//     metadata: { createdAt: new Date(post.data.created_utc * 1000).toISOString(), redditScore: post.data.score },
//     tags: [brandQuery]
// });
