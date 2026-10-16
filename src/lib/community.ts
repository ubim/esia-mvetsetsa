import type { SavedDoc } from "@/lib/offline";

export function searchDocuments(docs: SavedDoc[], query: string) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return docs.filter((doc) => words.every((word) =>
    `${doc.title} ${doc.summary} ${doc.translation}`.toLocaleLowerCase().includes(word),
  ));
}

export function anonymousFeedback(documentId: string, message: string) {
  const trimmed = message.trim();
  if (!trimmed || trimmed.length > 2000) throw new Error("Enter feedback of up to 2,000 characters.");
  return { document_id: documentId, author_name: "Anonymous", message: trimmed };
}