/**
 * Translation API Route
 * POST /api/translate
 */

import { json } from "@tanstack/react-start";
import { translateText, translateDocument, batchTranslate } from "../translation";

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const { text, texts, sourceLang = "en", targetLang = "ny", mode = "single" } = body;

    if (!text && !texts) {
      return json(
        { error: "Missing required field: text or texts" },
        { status: 400 }
      );
    }

    let result;

    switch (mode) {
      case "batch":
        if (!Array.isArray(texts)) {
          return json(
            { error: "texts must be an array for batch mode" },
            { status: 400 }
          );
        }
        result = await batchTranslate(texts, targetLang, sourceLang);
        break;

      case "document":
        result = await translateDocument(text, targetLang, sourceLang);
        break;

      case "single":
      default:
        result = await translateText(text, targetLang, sourceLang);
        break;
    }

    if (result && "error" in result && result.error) {
      return json({ error: result.error }, { status: 500 });
    }

    return json({ success: true, data: result });
  } catch (error) {
    console.error("Translation route error:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Translation failed",
      },
      { status: 500 }
    );
  }
}
