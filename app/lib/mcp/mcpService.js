// lib/mcp/mcpService.js
import * as redditAdapter from "./adapters/redditAdapter";

const adapters = {
  reddit: redditAdapter,
};

export async function fetchMentionsFromSources(brandQuery, sources) {
  const sourcesToQuery = sources || Object.keys(adapters); // Default to all adapters if none specified
  console.log(
    `MCP Service: Fetching mentions for "${brandQuery}" from sources: ${sourcesToQuery.join(
      ", "
    )}`
  );

  const fetchPromises = sourcesToQuery
    .filter(
      (source) =>
        adapters[source] && typeof adapters[source].fetchMentions === "function"
    ) // Check if adapter and function exist
    .map((source) => {
      console.log(`MCP Service: Calling ${source} adapter...`);
      return adapters[source].fetchMentions(brandQuery).catch((error) => {
        // Catch errors from individual adapters so one failing doesn't stop others
        console.error(
          `MCP Service: Error fetching from ${source} adapter:`,
          error.message
        );
        return []; // Return empty array for this source on error
      });
    });

  try {
    const resultsBySource = await Promise.all(fetchPromises);
    const allMentions = resultsBySource.flat(); // Combine results from all sources

    console.log(`MCP Service: Aggregated ${allMentions.length} mentions.`);

    allMentions.sort(
      (a, b) => new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt)
    );

    return allMentions;
  } catch (error) {
    console.error(
      `MCP Service: Critical error during mention aggregation:`,
      error
    );
    return []; // Return empty array on critical failure
  }
}
