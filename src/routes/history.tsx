import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Trash2, FileDown, History as HistoryIcon } from "lucide-react";
import { loadHistory, removeHistory, type HistoryEntry } from "@/lib/history";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Mbiri · History — Esia Mvetsetsa" },
      { name: "description", content: "Your past ESIA translations saved on this device." },
      { property: "og:title", content: "Mbiri · History — Esia Mvetsetsa" },
      { property: "og:description", content: "Your past ESIA translations saved on this device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [open, setOpen] = useState<HistoryEntry | null>(null);
  const [tab, setTab] = useState<"summary" | "full">("summary");

  useEffect(() => setItems(loadHistory()), []);

  async function exportAs(kind: "pdf" | "docx", e: HistoryEntry) {
    const m = await import("@/lib/documents");
    const base = e.title.replace(/\s*—\s*Chichewa$/, "");
    if (kind === "pdf") await m.exportPdf(e.title, e.summary, e.translation, base + "-chichewa");
    else await m.exportDocx(e.title, e.summary, e.translation, base + "-chichewa");
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
          <HistoryIcon className="h-6 w-6" />
          <h1 className="font-display text-lg font-bold">Mbiri · History</h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-3 px-4 py-6 pb-24">
        {items.length === 0 && (
          <p className="text-muted-foreground">Palibe mbiri pano. Translations you finish will appear here, saved on this device.</p>
        )}
        {items.map((e) => (
          <Button variant="ghost"
            key={e.id}
            onClick={() => {
              setOpen(e);
              setTab("summary");
            }}
            className="flex h-auto w-full justify-start gap-3 rounded-lg border bg-card p-4 text-left shadow-sm hover:border-primary"
          >
            <FileText className="h-6 w-6 shrink-0 text-primary" />
            <div className="min-w-0">
              <div className="truncate font-semibold">{e.title}</div>
              <div className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</div>
            </div>
          </Button>
        ))}

        {open && (
          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="grid min-w-0 gap-2 border-b px-3 py-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex min-w-0 gap-1">
                {(["summary", "full"] as const).map((t) => (
                  <Button variant={tab === t ? "default" : "ghost"} size="sm"
                    key={t}
                    onClick={() => setTab(t)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    {t === "summary" ? "Chidule" : "Kumasulira konse"}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => exportAs("pdf", open)}>
                  <FileDown /> PDF
                </Button>
                <Button size="sm" onClick={() => exportAs("docx", open)}>
                  <FileDown /> Word
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setItems(removeHistory(open.id));
                    setOpen(null);
                  }}
                  aria-label="Delete"
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </div>
            <div className="max-h-[55vh] overflow-y-auto whitespace-pre-wrap break-words px-5 py-5 leading-relaxed">
              {(tab === "summary" ? open.summary : open.translation) || "—"}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
