import { beforeEach, describe, expect, it } from "vitest";
import { addHistory, loadHistory } from "@/lib/history";

describe("Translation history", () => {
  beforeEach(() => localStorage.clear());
  it("keeps translation results so they can be reopened", () => {
    addHistory({ title: "Bridge — Chichewa", summary: "Chidule", translation: "Kumasulira" });
    const saved = loadHistory();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ title: "Bridge — Chichewa", summary: "Chidule", translation: "Kumasulira" });
  });
});