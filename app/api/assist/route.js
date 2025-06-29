// app/api/assist/route.js

import { NextResponse } from "next/server";
import OpenAI from "openai";
// --- Initialize OpenAI ---
if (!process.env.OPENAI_API_KEY) {
  console.error("FATAL: OPENAI_API_KEY is not set for assist route.");
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const body = await request.json();
    const { mentionId, mentionContext } = body;

    if (!mentionContext || !mentionContext.text) {
      return NextResponse.json(
        { error: "Mention context (including text) is required" },
        { status: 400 }
      );
    }

    console.log(
      `API Route: Received assistance request for mention ID: ${mentionId}`
    );

    const system_prompt = `
            You are an expert AI assistant for a Direct-to-Consumer (DTC) brand's social media team.
            Your task is to generate a suggested response and an engagement strategy based on user-provided context about an online mention.
            
            Maintain a brand voice that is friendly, professional, and helpful.
            Do NOT use placeholders like "[Your Brand Name]" or "[Customer Name]". Craft the actual message.

            Format your output as a single, well-formed JSON object with ONLY the keys "suggestion" (string) and "strategy" (string).
            Do not include any other text, explanations, or markdown formatting around the JSON.
            Example: {"suggestion": "We're so sorry to hear about this...", "strategy": "Acknowledge -> Request DM -> Resolve"}
        `;

    const user_prompt = `
            A user has posted the following online on ${
              mentionContext.sourceType ||
              mentionContext.source ||
              "an unspecified platform"
            }:
            >>>
            "${mentionContext.text}"
            >>>

            Our AI analysis of this post provides the following context:
            - Sentiment: ${mentionContext.sentiment || "N/A"} (Score: ${
      mentionContext.sentimentScore !== undefined
        ? mentionContext.sentimentScore.toFixed(2)
        : "N/A"
    })
            - Tone: ${mentionContext.tone || "N/A"}
            - Detected Intent: ${mentionContext.intent || "N/A"}
            - Key Phrases: ${mentionContext.keyPhrases?.join(", ") || "N/A"}
            - Assessed Risk Level by AI: ${
              mentionContext.geminiRiskLevel || "N/A"
            } (Overall Risk Score: ${mentionContext.riskScore || "N/A"})
            - Source URL (if available): ${mentionContext.url || "N/A"}
            - Author: ${mentionContext.authorName || "N/A"}

            Based on ALL the information above, provide:
            1.  **Suggested Response:** Draft a concise, empathetic, and actionable response suitable for the platform (${
              mentionContext.sourceType ||
              mentionContext.source ||
              "the platform"
            }).
                - If negative or a complaint: Acknowledge the user's experience, show empathy, and offer a clear path to resolution (e.g., "DM us your order number", "email support@brand.com"). Avoid making public promises you can't keep.
                - If a question: Provide a clear and direct answer if possible, or guide them where to find it.
                - If positive feedback: Thank the user warmly.
                - If neutral or unclear: Offer to help or ask clarifying questions if appropriate.
            2.  **Engagement Strategy:** Briefly outline the key steps or goals for handling this specific mention (e.g., "Publicly acknowledge and apologize -> Request user to DM for personal details -> Investigate issue with internal team -> Offer resolution -> Follow up publicly if appropriate"). Be specific to the context.
        `;

    console.log("API Route: Sending request to OpenAI for assistance...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using a more capable model for nuanced responses
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: user_prompt },
      ],
      temperature: 0.7,
    });

    console.log("API Route: Received response from OpenAI for assistance.");
    const assistantResponse = JSON.parse(response.choices[0].message.content);

    // Validate expected keys
    if (
      typeof assistantResponse.suggestion !== "string" ||
      typeof assistantResponse.strategy !== "string"
    ) {
      throw new Error(
        "Parsed JSON response from OpenAI missing 'suggestion' or 'strategy' string properties."
      );
    }

    return NextResponse.json(assistantResponse);
  } catch (error) {
    console.error("API Route Error [POST /api/assist]:", error.stack || error);
    const message = error.message || "Failed to get AI assistance";
    return NextResponse.json(
      { error: message, details: error.stack },
      { status: 500 }
    );
  }
}
