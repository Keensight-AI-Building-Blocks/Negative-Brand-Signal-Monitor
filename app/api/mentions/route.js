import { NextResponse } from "next/server";
import { fetchMentionsFromSources } from "@/lib/mcp/mcpService"; // Use alias or correct path
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Initialize Gemini ---
if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL: GEMINI_API_KEY is not set for mentions route.");
  // Consider throwing an error or having a fallback if the key is absolutely essential at startup
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or your preferred model

// --- NEW: Gemini Analysis Helper ---
async function analyzeMentionWithGemini(text) {
  if (!text || text.trim() === "") {
    console.warn("Gemini Analysis: Empty text provided. Skipping analysis.");
    return {
      sentiment: "Neutral",
      sentimentScore: 0.5,
      tone: "Unknown",
      intent: "Unknown",
      keyPhrases: [],
      riskLevel: "Low", // Default to low if no text to analyze
      error: "Empty text provided",
    };
  }

  const prompt = `
    Analyze the following text content:
    "${text}"

    Provide the following analysis as a valid JSON object with ONLY the following keys and no other explanatory text:
    - "sentiment": (String: "Positive", "Negative", or "Neutral")
    - "sentimentScore": (Number: from 0.0 to 1.0, where 0.0 is very negative, 0.5 is neutral, and 1.0 is very positive)
    - "tone": (String: The dominant tone, e.g., "Angry", "Confused", "Sarcastic", "Joyful", "Sad", "Appreciative", "Frustrated")
    - "intent": (String: The likely intent, e.g., "Complaint", "Question", "Feedback", "Compliment", "Rant", "Seeking Information", "Sharing Experience")
    - "keyPhrases": (Array of strings: List of 3-5 key phrases crucial for understanding the context)
    - "riskLevel": (String: "Low", "Medium", or "High" - based on overall negativity, urgency, potential for reputational damage, or calls for action)

    Example JSON output:
    {
      "sentiment": "Negative",
      "sentimentScore": 0.1,
      "tone": "Frustrated",
      "intent": "Complaint",
      "keyPhrases": ["product broke", "customer service unresponsive", "very disappointed"],
      "riskLevel": "High"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // console.log("Gemini Analysis Raw Response for text:", text.substring(0,30)+"...", responseText); // For debugging

    let analysisResult;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch && jsonMatch[0]) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        console.warn(
          "Could not find JSON in Gemini analysis response. Text:",
          responseText
        );
        analysisResult = {
          sentiment: "Neutral",
          sentimentScore: 0.5,
          tone: "Unknown",
          intent: "Unknown",
          keyPhrases: [],
          riskLevel: "Medium",
          error: "Failed to parse Gemini response: No JSON found",
        };
      }
    } catch (parseError) {
      console.error(
        "Failed to parse Gemini JSON analysis response:",
        parseError,
        "Raw text:",
        responseText
      );
      analysisResult = {
        sentiment: "Neutral",
        sentimentScore: 0.5,
        tone: "Parse Error",
        intent: "Parse Error",
        keyPhrases: [],
        riskLevel: "Medium",
        error: `Failed to parse Gemini response: ${parseError.message}`,
      };
    }
    return analysisResult;
  } catch (error) {
    console.error(
      `Error calling Gemini API for analysis. Text: "${text.substring(
        0,
        50
      )}...":`,
      error.message || error
    );
    return {
      sentiment: "Neutral",
      sentimentScore: 0.5,
      tone: "API Error",
      intent: "API Error",
      keyPhrases: [],
      riskLevel: "Medium", // Default to medium risk on API error to be safe
      error: `Gemini API call failed: ${error.message || "Unknown error"}`,
    };
  }
}

// --- ADAPTED: Calculate Risk Score ---
function calculateRiskScore(mentionContext, geminiAnalysis) {
  let riskScore = 50;

  if (!geminiAnalysis || geminiAnalysis.error) {
    console.warn(
      `Calculating risk with missing or failed Gemini analysis for mention ID ${mentionContext.id}. Error: ${geminiAnalysis?.error}`
    );
    const popularity =
      mentionContext.metadata?.redditScore ??
      mentionContext.metadata?.quoraViews ??
      0;
    riskScore += Math.min(Math.floor(popularity / 10), 15);

    if (mentionContext.metadata?.createdAt) {
      const ageHours =
        (Date.now() - new Date(mentionContext.metadata.createdAt).getTime()) /
        (1000 * 60 * 60);
      if (ageHours < 24) riskScore += 5;
    } else {
      riskScore += 2;
    }
    return Math.max(0, Math.min(100, Math.round(riskScore)));
  }

  if (geminiAnalysis.riskLevel === "High") riskScore = 90;
  else if (geminiAnalysis.riskLevel === "Medium") riskScore = 60;
  else if (geminiAnalysis.riskLevel === "Low") riskScore = 30;
  else {
    riskScore = (1 - (geminiAnalysis.sentimentScore ?? 0.5)) * 80 + 10;
  }

  const popularity =
    mentionContext.metadata?.redditScore ??
    mentionContext.metadata?.quoraViews ??
    0;
  riskScore += Math.min(Math.floor(popularity / 10), 10);

  if (mentionContext.metadata?.createdAt) {
    const ageHours =
      (Date.now() - new Date(mentionContext.metadata.createdAt).getTime()) /
      (1000 * 60 * 60);
    if (ageHours < 24 && riskScore < 90) riskScore += 5;
  }

  return Math.max(0, Math.min(100, Math.round(riskScore)));
}

// Helper function for introducing a delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Main GET Handler ---
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const brandQuery = searchParams.get("brandQuery");
  const sourcesParam = searchParams.get("sources");
  const requestedSources = sourcesParam ? sourcesParam.split(",") : undefined;

  if (!brandQuery) {
    return NextResponse.json(
      { error: "Brand query is required" },
      { status: 400 }
    );
  }

  console.log(`API Route: Received mention search for: ${brandQuery}`);

  try {
    const mentions = await fetchMentionsFromSources(
      brandQuery,
      requestedSources
    );

    if (!mentions || mentions.length === 0) {
      console.log("API Route: No mentions found by MCP Service.");
      return NextResponse.json([]);
    }
    console.log(`API Route: Received ${mentions.length} mentions from MCP.`);

    const analyzedMentions = [];
    // Gemini free tier allows about 15 requests per minute.
    // 60 seconds / 15 requests = 4 seconds per request. Add a buffer.
    const delayBetweenCalls = 4500; // 4.5 seconds

    for (let i = 0; i < mentions.length; i++) {
      const mention = mentions[i];
      console.log(
        `Analyzing mention ${i + 1} of ${mentions.length}: ${mention.id}`
      );
      const geminiAnalysis = await analyzeMentionWithGemini(mention.text);
      const riskScore = calculateRiskScore(mention, geminiAnalysis);

      let velocity = 0;
      if (mention.metadata?.redditNumComments && mention.metadata?.createdAt) {
        const ageHours =
          (Date.now() - new Date(mention.metadata.createdAt).getTime()) /
          (1000 * 3600);
        velocity =
          mention.metadata.redditNumComments / (ageHours > 0 ? ageHours : 1); // Avoid division by zero or negative
      }

      analyzedMentions.push({
        ...mention,
        sentiment: geminiAnalysis?.sentiment || "Pending",
        sentimentScore: geminiAnalysis?.sentimentScore,
        tone: geminiAnalysis?.tone || "Pending",
        intent: geminiAnalysis?.intent || "Pending",
        keyPhrases: geminiAnalysis?.keyPhrases || [],
        riskScore: riskScore,
        geminiRiskLevel: geminiAnalysis?.riskLevel || "Pending",
        threadPopularity: mention.metadata?.redditScore,
        velocity: parseFloat(velocity.toFixed(2)),
        authorName: mention.author?.name,
        subreddit: mention.metadata?.redditSubreddit,
        analysisError: geminiAnalysis?.error,
      });

      // If it's not the last mention, wait before the next call
      if (i < mentions.length - 1) {
        console.log(
          `Rate Limiting: Waiting ${
            delayBetweenCalls / 1000
          }s before next Gemini call...`
        );
        await sleep(delayBetweenCalls);
      }
    }

    console.log(
      `API Route: Finished analyzing ${analyzedMentions.length} mentions with Gemini (with rate limiting).`
    );

    analyzedMentions.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));

    return NextResponse.json(analyzedMentions);
  } catch (error) {
    console.error("API Route Error [GET /api/mentions]:", error.stack || error);
    const message = error.message || "Failed to fetch or process mentions";
    return NextResponse.json(
      { error: message, details: error.stack },
      { status: 500 }
    );
  }
}
