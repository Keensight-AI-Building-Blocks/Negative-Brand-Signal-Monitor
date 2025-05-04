// lib/mcp/modelContext.js (or .ts if using TypeScript)

export const createModelContext = ({
  id,
  sourceType, // 'reddit'
  sourceIdentifier,
  url,
  text,
  title,
  author,
  parent,
  metadata,
  fetchedAt,
  tags = [],
  rawSourceData,
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
});
