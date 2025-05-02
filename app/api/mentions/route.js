// app/api/mentions/route.js
import { NextResponse } from "next/server";
import axios from "axios";
import { fetchMentionsFromSources } from "@/lib/mcp/mcpService"; // Use alias or correct path

// --- Hugging Face Helper (Can be moved to a separate lib/analysis.js) ---
async function analyzeTextWithHuggingFace(text, modelUrl) {
  if (!text || !modelUrl || !process.env.HF_API_TOKEN) return null;
  try {
    const response = await axios.post(
      modelUrl,
      { inputs: text, options: { wait_for_model: true } }, // wait_for_model can help with 503s
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 15000, // Increased timeout
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 503) {
      console.warn(
        `HF model ${modelUrl} is loading/unavailable (503). Skipping analysis.`
      );
      return { isLoading: true };
    }
    console.error(
      `Error calling HF API (${modelUrl}) Text: "${text.substring(0, 50)}...":`,
      error.response?.data || error.message
    );
    return null;
  }
}

// --- Parsing & Scoring Logic (Can be moved to separate lib/analysis.js) ---

function parseSentiment(hfResult) {
  let sentiment = "Neutral";
  let score = 0.5; // Default score
  if (hfResult && !hfResult.isLoading && Array.isArray(hfResult[0])) {
    try {
      const topResult = hfResult[0].reduce((max, current) =>
        current.score > max.score ? current : max
      );
      sentiment =
        topResult.label === "POSITIVE"
          ? "Positive"
          : topResult.label === "NEGATIVE"
          ? "Negative"
          : "Neutral";
      // Adjust score: closer to 1 for positive, closer to 0 for negative
      score =
        topResult.label === "POSITIVE"
          ? topResult.score
          : topResult.label === "NEGATIVE"
          ? 1 - topResult.score
          : 0.5;
    } catch (e) {
      console.warn("Error parsing sentiment:", e);
    }
  } else if (hfResult?.isLoading) {
    sentiment = "Analysis Pending";
    score = -1; // Indicate pending
  } else {
    console.warn(`Unexpected sentiment result format:`, hfResult);
  }
  return { sentiment, score };
}

function parseTone(hfResult) {
  let tone = "Unknown";
  if (hfResult && !hfResult.isLoading && Array.isArray(hfResult[0])) {
    try {
      // *ADJUST BASED ON YOUR EMOTION MODEL OUTPUT*
      const topResult = hfResult[0].reduce((max, current) =>
        current.score > max.score ? current : max
      );
      tone = topResult.label; // e.g., 'anger', 'joy', 'sadness'
    } catch (e) {
      console.warn("Error parsing tone:", e);
    }
  } else if (hfResult?.isLoading) {
    tone = "Analysis Pending";
  } else {
    console.warn(`Unexpected tone result format:`, hfResult);
  }
  return tone;
}

function calculateRiskScore(mentionContext, sentimentInfo, tone) {
  // Basic Risk Score (using standardized ModelContext)
  let riskScore = 50; // Default neutral
  if (sentimentInfo.sentiment === "Negative") riskScore += 30;
  if (["Angry", "anger", "fear", "sadness"].includes(tone?.toLowerCase()))
    riskScore += 15;
  if (sentimentInfo.sentiment === "Positive") riskScore -= 20;

  // Use platform-specific metadata if available
  const popularity =
    mentionContext.metadata?.redditScore ??
    mentionContext.metadata?.quoraViews ??
    0;
  riskScore += Math.min(popularity / 10, 15); // Add points for popularity (capped)

  const ageHours =
    (Date.now() - new Date(mentionContext.metadata.createdAt).getTime()) /
    (1000 * 60 * 60);
  if (ageHours < 24) riskScore += 5; // Small boost for recent mentions

  riskScore = Math.max(0, Math.min(100, Math.round(riskScore))); // Clamp 0-100
  return riskScore;
}

// --- Main GET Handler ---
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const brandQuery = searchParams.get("brandQuery");
  const sourcesParam = searchParams.get("sources"); // e.g., ?sources=reddit,quora
  const requestedSources = sourcesParam ? sourcesParam.split(",") : undefined; // Undefined means use default (all)

  if (!brandQuery) {
    return NextResponse.json(
      { error: "Brand query is required" },
      { status: 400 }
    );
  }

  console.log(`API Route: Received mention search for: ${brandQuery}`);

  try {
    // 1. Fetch Standardized Mentions via MCP Service
    const mentions = await fetchMentionsFromSources(
      brandQuery,
      requestedSources
    );

    if (!mentions || mentions.length === 0) {
      console.log("API Route: No mentions found by MCP Service.");
      return NextResponse.json([]); // Return empty array if no mentions
    }
    console.log(`API Route: Received ${mentions.length} mentions from MCP.`);

    // 2. Analyze Mentions (Sentiment, Tone) - Batching might be more efficient for HF API if possible
    const analysisPromises = mentions.map(async (mention) => {
      const [sentimentResult, toneResult] = await Promise.all([
        analyzeTextWithHuggingFace(
          mention.text,
          process.env.HF_SENTIMENT_MODEL_URL
        ),
        analyzeTextWithHuggingFace(mention.text, process.env.HF_TONE_MODEL_URL),
      ]);

      const sentimentInfo = parseSentiment(sentimentResult);
      const tone = parseTone(toneResult);

      // 3. Calculate Risk Score
      const riskScore = calculateRiskScore(mention, sentimentInfo, tone);

      // 4. Augment the ModelContext object with analysis results
      return {
        ...mention, // Spread the original standardized mention data
        sentiment: sentimentInfo.sentiment,
        tone: tone,
        intent: "Comment", // Placeholder - intent analysis is separate
        riskScore: riskScore,
        // Add any other fields the frontend specifically needs at the top level
        // (though accessing via 'metadata' in frontend is better practice)
        threadPopularity: mention.metadata?.redditScore,
        velocity:
          mention.metadata?.redditNumComments /
          ((Date.now() - new Date(mention.metadata.createdAt).getTime()) /
            (1000 * 3600) +
            1), // Example velocity calc
        authorName: mention.author?.name, // Example mapping
        subreddit: mention.metadata?.redditSubreddit, // Example mapping
      };
    });

    const analyzedMentions = await Promise.all(analysisPromises);
    console.log(
      `API Route: Finished analyzing ${analyzedMentions.length} mentions.`
    );

    // 5. Final Sort (optional, mcpService already sorts by date) & Return
    analyzedMentions.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0)); // Sort by risk score

    return NextResponse.json(analyzedMentions);
  } catch (error) {
    console.error("API Route Error [GET /api/mentions]:", error);
    const message = error.message || "Failed to fetch or process mentions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
