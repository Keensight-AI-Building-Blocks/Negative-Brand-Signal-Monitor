import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Initialize Gemini ---
if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL: GEMINI_API_KEY is not set for assist route.");
  // Optionally throw an error during startup if the key is essential
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or choose another model

export async function POST(request) {
  try {
    const body = await request.json();
    // Expect mentionContext to be the full analyzed mention object from the frontend
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

    const prompt = `
            You are an AI assistant for a Direct-to-Consumer (DTC) brand's social media team.
            A user has posted the following online on ${
              mentionContext.sourceType ||
              mentionContext.source ||
              "an unspecified platform"
            }:

            "${mentionContext.text}"

            Our AI analysis of this post (derived from Gemini) provides the following context:
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
                - Maintain a brand voice that is: [Specify your brand voice, e.g., "friendly, professional, and helpful"].
                - Do NOT include placeholders like "[Your Brand Name]" or "[Customer Name]" unless it's a generic instruction to the team. Craft the actual message.
            2.  **Engagement Strategy:** Briefly outline the key steps or goals for handling this specific mention (e.g., "Publicly acknowledge and apologize -> Request user to DM for personal details -> Investigate issue with internal team using provided details -> Offer resolution (e.g., refund, replacement, discount) -> Follow up publicly if appropriate to close the loop"). Be specific to the context.
            
            Format your output as a single, well-formed JSON object with ONLY the keys "suggestion" (string) and "strategy" (string), and no other text, explanations, or markdown formatting around the JSON.
            Example: {"suggestion": "We're so sorry to hear about this...", "strategy": "Acknowledge -> Request DM -> Resolve"}
        `;

    console.log("API Route: Sending request to Gemini for assistance...");
    // console.log("API Route: Prompt for assistance:", prompt); // For debugging the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("API Route: Received response from Gemini for assistance.");
    // console.log("Gemini Assist Raw Response Text:", text); // For debugging

    let assistantResponse;
    try {
      // Improved JSON parsing: look for ```json ... ``` blocks or just { ... }
      let jsonString = text;
      const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch && jsonBlockMatch[1]) {
        jsonString = jsonBlockMatch[1];
      } else {
        // Fallback to finding the first '{' and last '}'
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonString = text.substring(jsonStart, jsonEnd + 1);
        } else {
          jsonString = null; // Indicate that no valid JSON structure was found
        }
      }

      if (jsonString) {
        assistantResponse = JSON.parse(jsonString);
        // Validate expected keys
        if (
          typeof assistantResponse.suggestion !== "string" ||
          typeof assistantResponse.strategy !== "string"
        ) {
          console.warn(
            "Gemini assistance response parsed but missing expected keys. Response:",
            assistantResponse
          );
          throw new Error(
            "Parsed JSON response missing 'suggestion' or 'strategy' string properties."
          );
        }
      } else {
        console.warn(
          "Could not extract a valid JSON structure from Gemini assistance response. Using full text as suggestion. Raw text:",
          text
        );
        assistantResponse = {
          suggestion: text.trim(), // Use the full text if no JSON
          strategy:
            "N/A - Could not parse strategy from response. Check raw AI output.",
        };
      }
    } catch (parseError) {
      console.error(
        "Failed to parse Gemini JSON assistance response:",
        parseError.message,
        "Raw text:",
        text
      );
      assistantResponse = {
        suggestion: `Error processing AI response. Raw output: ${text.trim()}`, // Fallback if JSON parsing fails
        strategy: `N/A - Error parsing strategy from response: ${parseError.message}`,
      };
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
