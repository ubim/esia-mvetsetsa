/**
 * Summarization API Route
 * POST /api/summarize
 */

import { json } from "@tanstack/react-start";
import { summarizeDocument, generateStructuredSummary } from "../summarization";

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const {
      text,
      maxLength = 500,
      language = "en",
      provider = "extractive", // Default to free extractive method
      mode = "simple",
    } = body;

    if (!text) {
      return json(
        { error: "Missing required field: text" },
        { status: 400 }
      );
    }

    let result;

    if (mode === "structured") {
      result = await generateStructuredSummary(text, language);
    } else {
      result = await summarizeDocument(text, maxLength, language, provider);
    }

    if (result && "error" in result && result.error) {
      return json({ error: result.error }, { status: 500 });
    }

    return json({ success: true, data: result });
  } catch (error) {
    console.error("Summarization route error:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Summarization failed",
      },
      { status: 500 }
    );
  }
}
