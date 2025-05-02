// lib/api.js

// --- MOCK DATA (Keep the sample data structure and mockMentions array as before) ---
const createSampleMention = (id, overrides) => ({
  id: `mention_${id}`,
  text: `This is sample mention ${id} text. @[BrandA] is okay, but @[BrandB] needs work. How about @[YourBrand]? Feels ${
    overrides?.sentiment || "Neutral"
  }.`, // Example text with multiple brands
  source: id % 2 === 0 ? "Reddit" : "Quora",
  url: `https://example.com/mention/${id}`,
  sentiment: "Negative",
  tone: "Confused",
  intent: "Question",
  riskScore: Math.floor(Math.random() * 100),
  timestamp: new Date(Date.now() - id * 3600 * 1000).toISOString(),
  threadPopularity: Math.floor(Math.random() * 200),
  velocity: Math.random() * 5,
  ...overrides,
});

const mockMentions = [
  createSampleMention(1, {
    brand: "BrandA",
    sentiment: "Negative",
    tone: "Angry",
    intent: "Complaint",
    riskScore: 92,
    text: "Worst experience ever with @BrandA! Product broke after one use.",
  }),
  createSampleMention(2, {
    brand: "BrandB",
    sentiment: "Negative",
    tone: "Sarcastic",
    intent: "Rant",
    riskScore: 75,
    text: "Oh yeah, @BrandB customer service was *so* helpful... /s",
  }),
  createSampleMention(3, {
    brand: "BrandA",
    sentiment: "Negative",
    tone: "Confused",
    intent: "Question",
    riskScore: 60,
    text: "Does anyone know how to actually use the @BrandA app? The instructions are unclear.",
  }),
  createSampleMention(4, {
    brand: "YourBrand",
    sentiment: "Neutral",
    intent: "Question",
    riskScore: 30,
    text: "Just asking about @YourBrand availability.",
  }),
  createSampleMention(5, {
    brand: "BrandB",
    sentiment: "Positive",
    riskScore: 10,
    text: "Had a great time using @BrandB new feature!",
  }),
  createSampleMention(6, {
    brand: "BrandA",
    sentiment: "Negative",
    riskScore: 88,
    text: "@BrandA website is down again! #fail",
  }),
];

const mockAssistanceResponse = {
  suggestion:
    "Hi there, thanks for reaching out about [Brand]. Could you tell us a bit more about the specific issue you encountered? We'd like to help make this right. Please feel free to DM us with your order details or specifics.",
  strategy:
    "Empathize, reference the mentioned brand, ask for details privately, offer resolution.",
};

// --- MOCK API FUNCTIONS ---

/**
 * MOCK: Fetches prioritized mentions for a specific brand query.
 * @param {string} brandQuery - The brand name to search for.
 */
export async function fetchMentions(brandQuery) {
  console.log(`MOCK API: Fetching mentions for query: "${brandQuery}"...`);
  await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay

  if (!brandQuery || brandQuery.trim() === "") {
    // console.log("MOCK API: No query provided, returning empty array.");
    return []; // Return empty if no query
    // OR: you could return all mentions if desired when query is empty
    // return [...mockMentions];
  }

  // Simulate filtering based on brandQuery (case-insensitive)
  const queryLower = brandQuery.toLowerCase();
  const results = mockMentions.filter(
    (mention) =>
      mention.text.toLowerCase().includes(`@${queryLower}`) || // Simple @mention check
      mention.text.toLowerCase().includes(queryLower) || // General text check
      (mention.brand && mention.brand.toLowerCase() === queryLower) // Check assigned brand if exists
  );

  console.log(
    `MOCK API: Found ${results.length} mentions for "${brandQuery}".`
  );
  return [...results]; // Return a copy of the filtered results
}

/**
 * MOCK: Requests AI assistance for a specific mention.
 * @param {string} mentionId - The ID of the mention.
 * @param {object} mentionContext - Relevant details (used slightly in mock).
 */
export async function fetchAssistance(mentionId, mentionContext) {
  console.log(
    `MOCK API: Fetching assistance for mention ${mentionId}...`,
    mentionContext
  );
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate AI delay

  // Simulate potential API error randomly
  // if (Math.random() < 0.1) {
  //   console.error("MOCK API: Simulated fetchAssistance error");
  //   throw new Error('Failed to get assistance (Simulated Error)');
  // }

  // Slightly customize response based on context
  let suggestion = mockAssistanceResponse.suggestion;
  if (mentionContext?.source) {
    suggestion = suggestion.replace(
      "[Brand]",
      `your ${mentionContext.source} post`
    );
  } else {
    suggestion = suggestion.replace("[Brand]", "your feedback");
  }

  return { ...mockAssistanceResponse, suggestion }; // Return customized copy
}
