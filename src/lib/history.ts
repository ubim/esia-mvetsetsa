// Saves translations on the device so past work can be reopened from History.
export type HistoryEntry = {
  id: string;
  title: string;
  summary: string;
  translation: string;
  created_at: string;
};

const KEY = "esia-history";

export function loadHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addHistory(entry: Omit<HistoryEntry, "id" | "created_at">) {
  const all = [{ ...entry, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...loadHistory()].slice(0, 50);
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage full */
  }
  return all;
}

export function removeHistory(id: string) {
  const all = loadHistory().filter((e) => e.id !== id);
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage full */
  }
  return all;
}
