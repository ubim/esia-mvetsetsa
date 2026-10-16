// Saves community documents on the device so they can be read without internet.
export type SavedDoc = { id: string; title: string; summary: string; translation: string; created_at: string };
const KEY = "esia-community-docs";

export function loadSaved(): SavedDoc[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveDocs(docs: SavedDoc[]) {
  const map = new Map(loadSaved().map((d) => [d.id, d]));
  for (const d of docs) map.set(d.id, d);
  const all = [...map.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage full */
  }
  return all;
}
