/**
 * Document Processing API Route
 * POST /api/process-document
 */

import { json } from "@tanstack/react-start";
import { processDocument } from "../document-processor";

export async function POST({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return json(
        { error: "Missing required field: file" },
        { status: 400 }
      );
    }

    const result = await processDocument(file);

    if (result.error) {
      return json({ error: result.error }, { status: 400 });
    }

    return json({ success: true, data: result });
  } catch (error) {
    console.error("Document processing route error:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Document processing failed",
      },
      { status: 500 }
    );
  }
}
