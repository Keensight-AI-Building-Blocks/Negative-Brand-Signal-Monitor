import { NextResponse } from "next/server";
import { fetchMentionsFromSources } from "../../lib/mcp/mcpService";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.error("FATAL: OPENAI_API_KEY is not set for mentions route.");
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeMentionWithOpenAI(text) {
  if (!text || text.trim() === "") {
    console.warn("OpenAI Analysis: Empty text provided. Skipping analysis.");
    return {
      sentiment: "Neutral",
      sentimentScore: 0.5,
      tone: "Unknown",
      intent: "Unknown",
      keyPhrases: [],
      riskLevel: "Low",
      isOffensive: false,
      error: "Empty text provided",
    };
  }

  const system_prompt = `
    You are an expert text analyst. Analyze the following user-provided text. Provide the analysis as a valid JSON object with ONLY the following keys and no other explanatory text:
    - "sentiment": (String: "Positive", "Negative", or "Neutral")
    - "sentimentScore": (Number: from 0.0 to 1.0, where 0.0 is very negative, 0.5 is neutral, and 1.0 is very positive)
    - "tone": (String: The dominant tone, e.g., "Angry", "Confused", "Sarcastic", "Joyful", "Sad", "Appreciative", "Frustrated")
    - "intent": (String: The likely intent, e.g., "Complaint", "Question", "Feedback", "Compliment", "Rant", "Seeking Information", "Sharing Experience")
    - "keyPhrases": (Array of strings: List of 3-5 key phrases crucial for understanding the context)
    - "riskLevel": (String: "Low", "Medium", or "High" - based on overall negativity, urgency, potential for reputational damage, or calls for action)
    - "isOffensive": (Boolean: true if the text contains hate speech, vulgar language, personal attacks, or clearly offensive content, otherwise false)

    Example JSON output:
    {
      "sentiment": "Negative",
      "sentimentScore": 0.1,
      "tone": "Frustrated",
      "intent": "Complaint",
      "keyPhrases": ["product broke", "customer service unresponsive", "very disappointed"],
      "riskLevel": "High",
      "isOffensive": false
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: text },
      ],
      temperature: 0.2,
    });
    const analysisResult = JSON.parse(response.choices[0].message.content);
    return analysisResult;
  } catch (error) {
    console.error(
      `Error calling OpenAI API for analysis. Text: "${text.substring(
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
      riskLevel: "Medium",
      isOffensive: false,
      error: `OpenAI API call failed: ${error.message || "Unknown error"}`,
    };
  }
}

function calculateRiskScore(mentionContext, aiAnalysis) {
  let riskScore = 50;
  if (!aiAnalysis || aiAnalysis.error) {
    console.warn(
      `Calculating risk with missing or failed AI analysis for mention ID ${mentionContext.id}. Error: ${aiAnalysis?.error}`
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

  if (aiAnalysis.riskLevel === "High") riskScore = 90;
  else if (aiAnalysis.riskLevel === "Medium") riskScore = 60;
  else if (aiAnalysis.riskLevel === "Low") riskScore = 30;
  else {
    riskScore = (1 - (aiAnalysis.sentimentScore ?? 0.5)) * 80 + 10;
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

    const analysisPromises = mentions.map((mention) =>
      analyzeMentionWithOpenAI(mention.text)
    );
    const analyses = await Promise.all(analysisPromises);
    console.log(
      `API Route: Finished analyzing ${analyses.length} mentions with OpenAI.`
    );

    const analyzedMentions = mentions.map((mention, index) => {
      const aiAnalysis = analyses[index];
      const riskScore = calculateRiskScore(mention, aiAnalysis);

      return {
        ...mention,
        sentiment: aiAnalysis?.sentiment || "Pending",
        sentimentScore: aiAnalysis?.sentimentScore,
        tone: aiAnalysis?.tone || "Pending",
        intent: aiAnalysis?.intent || "Pending",
        keyPhrases: aiAnalysis?.keyPhrases || [],
        riskScore: riskScore,
        isOffensive: aiAnalysis?.isOffensive || false, // Add the offensive flag
        analysisError: aiAnalysis?.error,
      };
    });

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
