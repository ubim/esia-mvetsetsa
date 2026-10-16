import { describe, expect, it } from "vitest";
import { anonymousFeedback, searchDocuments } from "@/lib/community";

describe("Community", () => {
  it("submits feedback without collecting a name", () => {
    expect(anonymousFeedback("document-1", "  Protect our water.  ")).toEqual({
      document_id: "document-1", author_name: "Anonymous", message: "Protect our water.",
    });
  });
  it("finds uploaded documents regardless of case", () => {
    const docs = [
      { id: "1", title: "Mangochi Bridges", summary: "Protect water", translation: "", created_at: "2026-10-16" },
      { id: "2", title: "School", summary: "Education", translation: "", created_at: "2026-10-16" },
    ];
    expect(searchDocuments(docs, "MANGOCHI").map((doc) => doc.id)).toEqual(["1"]);
    expect(searchDocuments(docs, "missing")).toEqual([]);
  });
});