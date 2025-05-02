// app/api/assist/route.js
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Initialize Gemini ---
if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL: GEMINI_API_KEY is not set.");
  // Optionally throw an error during startup if the key is essential
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or choose another model

export async function POST(request) {
  try {
    const body = await request.json();
    const { mentionId, mentionContext } = body; // Expect mentionId and context (like text, sentiment, tone, source)

    if (!mentionContext || !mentionContext.text) {
      return NextResponse.json(
        { error: "Mention context (including text) is required" },
        { status: 400 }
      );
    }

    console.log(
      `API Route: Received assistance request for mention ID: ${mentionId}`
    );

    // --- Construct Prompt for LLM ---
    const prompt = `
            You are an AI assistant for a Direct-to-Consumer (DTC) brand's social media team.
            A customer or user has posted the following online (${
              mentionContext.source || "Unknown Source"
            }):

            "${mentionContext.text}"

            Analysis indicates:
            - Sentiment: ${mentionContext.sentiment || "N/A"}
            - Tone: ${mentionContext.tone || "N/A"}
            - Intent (if known): ${mentionContext.intent || "N/A"}

            Based on this, provide:
            1.  **Suggested Response:** Draft a concise, empathetic, and helpful response suitable for the platform (${
              mentionContext.source || "the platform"
            }). Aim to de-escalate if negative, clarify if confused, or acknowledge feedback constructively. Ask for details privately (DM/email) if needed for resolution. Keep it brand-appropriate (assume friendly but professional).
            2.  **Engagement Strategy:** Briefly outline the key steps or goals for handling this mention (e.g., "Acknowledge -> Empathize -> Offer Private Support -> Resolve Issue").

            Format your output as a JSON object with keys "suggestion" and "strategy".
        `;

    // --- Call Gemini API ---
    console.log("API Route: Sending request to Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("API Route: Received response from Gemini.");
    // console.log("Gemini Raw Response Text:", text); // For debugging

    // --- Parse Gemini Response ---
    // Attempt to parse the JSON directly from the response text
    let assistantResponse;
    try {
      // Find the start and end of the JSON block (robustness)
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = text.substring(jsonStart, jsonEnd + 1);
        assistantResponse = JSON.parse(jsonString);
      } else {
        // Fallback if JSON structure isn't found - use the whole text as suggestion
        console.warn(
          "Could not parse structured JSON from Gemini response. Using full text as suggestion."
        );
        assistantResponse = {
          suggestion: text.trim(),
          strategy: "N/A - Could not parse strategy from response.",
        };
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON response:", parseError);
      console.error("Gemini Raw Text:", text); // Log raw text on error
      // Fallback if JSON parsing fails
      assistantResponse = {
        suggestion: text.trim(),
        strategy: "N/A - Error parsing strategy from response.",
      };
    }

    return NextResponse.json(assistantResponse);
  } catch (error) {
    console.error("API Route Error [POST /api/assist]:", error);
    // Handle potential Gemini API errors specifically if the SDK provides codes
    const message = error.message || "Failed to get AI assistance";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
