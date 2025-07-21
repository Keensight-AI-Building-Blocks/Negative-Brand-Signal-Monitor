// app/api/verify-brand/route.js

import { NextResponse } from "next/server";
import OpenAI from "openai";

// --- Initialize OpenAI ---
if (!process.env.OPENAI_API_KEY) {
  console.error("FATAL: OPENAI_API_KEY is not set for verify-brand route.");
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Handles POST requests to verify if a query is a known brand.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "A valid search query is required." },
        { status: 400 }
      );
    }

    const system_prompt = `
      You are a brand verification expert. Your task is to determine if a given search term is a real brand, company, or product.
      Respond with a JSON object with ONLY two keys:
      - "isBrand": (boolean) true if it is a known brand/company/product, otherwise false.
      - "brandName": (string) The official name of the brand if it is one, otherwise the original query.

      Example a DTC brand:
      - Input: "Olipop" -> Output: {"isBrand": true, "brandName": "Olipop"}
      - Input: "a funny saying" -> Output: {"isBrand": false, "brandName": "a funny saying"}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106", // Efficient model for this task
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: query },
      ],
      temperature: 0.1, // Low temperature for deterministic output
    });

    const verificationResult = JSON.parse(response.choices[0].message.content);

    // Validate the response from OpenAI to ensure it matches the expected format
    if (typeof verificationResult.isBrand !== "boolean") {
      throw new Error(
        "Invalid response format from OpenAI: 'isBrand' is not a boolean."
      );
    }

    return NextResponse.json(verificationResult);
  } catch (error) {
    console.error(
      `API Route Error [POST /api/verify-brand]:`,
      error.stack || error
    );
    const message = error.message || "Failed to verify brand";
    return NextResponse.json(
      { error: message, details: error.stack },
      { status: 500 }
    );
  }
}
