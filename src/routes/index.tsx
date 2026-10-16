import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Upload, Languages, FileDown, Loader2, Square, X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { processText } from "@/lib/translate.functions";
import { supabase } from "@/integrations/supabase/client";
import { FeedbackBell } from "@/components/FeedbackBell";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Esia Mvetsetsa — ESIA reports in Chichewa" },
      { name: "description", content: "Upload an Environmental and Social Impact Assessment report and get a Chichewa translation and simple community summary." },
      { property: "og:title", content: "Esia Mvetsetsa — ESIA reports in Chichewa" },
      { property: "og:description", content: "Translate ESIA reports from English to Chichewa with an easy community summary, then share as PDF or Word." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Phase = "idle" | "reading" | "translating" | "summary" | "done";

function Index() {
  const run = useServerFn(processText);
  const inputRef = useRef<HTMLInputElement>(null);
  const stopRef = useRef(false);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [parts, setParts] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [tab, setTab] = useState<"summary" | "full">("summary");
  const [fullDoc, setFullDoc] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const busy = phase === "reading" || phase === "summary" || phase === "translating";
  const baseName = (file?.name ?? "document").replace(/\.[^.]+$/, "");
  const translation = parts.join("\n\n");

  async function start() {
    if (!file) return;
    setError("");
    setSummary("");
    setParts([]);
    stopRef.current = false;
    setShareUrl("");
    let completedSummary = "";
    const completedParts: string[] = [];
    try {
      setPhase("reading");
      const { extractText, chunkText } = await import("@/lib/documents");
      const text = await extractText(file);
      if (text.length < 50) throw new Error("We couldn't read text from this file. Scanned images are not supported yet.");
      let chunks = chunkText(text);
      if (!fullDoc) chunks = chunks.slice(0, 3);
      setTotal(chunks.length);
      
      // TRANSLATE FIRST (with parallel processing for speed)
      setPhase("translating");
      setTab("full"); // Show translation tab
      
      // Process chunks in batches of 3 for faster translation
      const batchSize = 3;
      for (let i = 0; i < chunks.length; i += batchSize) {
        if (stopRef.current) break;
        
        const batch = chunks.slice(i, i + batchSize);
        const promises = batch.map(chunk => 
          run({ data: { text: chunk, mode: "translate" } })
        );
        
        const results = await Promise.all(promises);
        
        for (const r of results) {
          completedParts.push(r.text);
          setParts((p) => [...p, r.text]);
        }
      }
      
      // NOW CREATE SUMMARY from translated text
      setPhase("summary");
      setTab("summary"); // Show summary tab
      const fullTranslation = completedParts.join("\n\n");
      const s = await run({ 
        data: { 
          text: fullTranslation.slice(0, 38000), 
          mode: "summary" 
        } 
      });
      completedSummary = s.text;
      setSummary(s.text);
      
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPhase(completedSummary || completedParts.length ? "done" : "idle");
    } finally {
      if (completedSummary || completedParts.length) {
        addHistory({ title: `${baseName} — Chichewa`, summary: completedSummary, translation: completedParts.join("\n\n") });
      }
    }
  }

  async function share() {
    setSharing(true);
    setError("");
    const { data, error: e } = await supabase
      .from("shared_documents")
      .insert({ title: `${baseName} — Chichewa`, summary, translation })
      .select("id")
      .single();
    setSharing(false);
    if (e || !data) return setError("Couldn't share right now. Please check your internet and try again.");
    const url = `${window.location.origin}/community/${data.id}`;
    setShareUrl(url);
    if (navigator.share) navigator.share({ title: "Esia Mvetsetsa", text: `${baseName} — Chichewa`, url }).catch(() => {});
  }

  async function exportAs(kind: "pdf" | "docx") {
    const m = await import("@/lib/documents");
    const title = `${baseName} — Chichewa`;
    if (kind === "pdf") await m.exportPdf(title, summary, translation, baseName + "-chichewa");
    else await m.exportDocx(title, summary, translation, baseName + "-chichewa");
  }

  const pct = total ? Math.round((parts.length / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="bg-navy text-navy-foreground">
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:flex">
          <div className="flex min-w-0 items-center gap-3">
          <div className="shrink-0 rounded-lg bg-background p-1.5">
            <img src="/logo.svg" alt="Esia Mvetsetsa logo" className="h-9 w-9 object-contain" />
          </div>
          <span className="min-w-0 font-display text-lg font-bold sm:text-xl">Esia Mvetsetsa</span>
          </div>
          <FeedbackBell />
        </div>
        <div className="mx-auto max-w-5xl px-5 pb-12 pt-4">
          <h1 className="font-display text-3xl font-extrabold leading-tight md:text-5xl">
            Mvetsetsani malipoti a ESIA<br />m'Chichewa.
          </h1>
          <p className="mt-3 max-w-2xl text-base opacity-80">
            Upload an Environmental and Social Impact Assessment report. Get a simple Chichewa summary for your
            community and a full translation you can share as PDF or Word.
          </p>
        </div>
      </header>

      <main className="mx-auto -mt-8 max-w-5xl px-4 pb-16">
        <section className="rounded-2xl border bg-card p-4 shadow-xl sm:p-6">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {!file ? (
            <Button variant="ghost"
              onClick={() => inputRef.current?.click()}
              className="flex h-auto w-full flex-col items-center gap-3 whitespace-normal rounded-xl border-2 border-dashed border-primary/30 bg-accent/50 px-4 py-10 text-center transition-colors hover:border-primary hover:bg-accent"
            >
              <Upload className="h-10 w-10 text-primary" />
              <span className="font-display text-lg font-semibold">Kwezani chikalata · Upload document</span>
              <span className="text-sm text-muted-foreground">PDF, Word (.docx) or text file</span>
            </Button>
          ) : (
            <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="flex min-w-0 items-center gap-3 rounded-xl bg-accent px-4 py-3">
                <FileText className="h-6 w-6 shrink-0 text-primary" />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                </div>
                {!busy && (
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="ml-auto shrink-0 text-muted-foreground hover:text-foreground" aria-label="Remove file">
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
              {busy ? (
                <Button size="lg" variant="outline" onClick={() => (stopRef.current = true)} disabled={phase !== "translating"}>
                  <Square /> Stop
                </Button>
              ) : (
                <Button size="lg" className="w-full sm:w-auto" onClick={start}>
                  <Languages /> Translate to Chichewa
                </Button>
              )}
            </div>
          )}

          {file && !busy && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:flex">
              <Button variant={fullDoc ? "default" : "secondary"} aria-pressed={fullDoc} onClick={() => setFullDoc(true)} className="h-auto whitespace-normal px-3 py-2">Whole document</Button>
              <Button variant={!fullDoc ? "default" : "secondary"} aria-pressed={!fullDoc} onClick={() => setFullDoc(false)} className="h-auto whitespace-normal px-3 py-2">Quick (first pages only)</Button>
            </div>
          )}

          {busy && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                {phase === "reading" && "Reading document…"}
                {phase === "translating" && `Translating section ${Math.min(parts.length + 1, total)} of ${total}… (Fast mode: 3x speed)`}
                {phase === "summary" && "Creating detailed summary from translated text…"}
              </div>
              <Progress value={phase === "translating" ? pct : phase === "summary" ? 95 : 5} />
            </div>
          )}
          {error && <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
          {shareUrl && (
            <p className="mt-4 break-all rounded-lg bg-accent px-4 py-3 text-sm">
              Shared to the community space. Link for members: <a href={shareUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">{shareUrl}</a>
            </p>
          )}
        </section>

        {(summary || parts.length > 0) && (
          <section className="mt-8 overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="grid min-w-0 gap-3 border-b px-4 py-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
              <div className="grid min-w-0 grid-cols-2 gap-1 sm:flex">
                <TabBtn active={tab === "summary"} onClick={() => setTab("summary")}>Chidule · Summary</TabBtn>
                <TabBtn active={tab === "full"} onClick={() => setTab("full")}>
                  Kumasulira · Translation {total > 0 && `(${parts.length}/${total})`}
                </TabBtn>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={share} disabled={busy || sharing}>
                  <Share2 /> {shareUrl ? "Shared ✓" : "Share to community"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportAs("pdf")} disabled={busy}>
                  <FileDown /> PDF
                </Button>
                <Button size="sm" onClick={() => exportAs("docx")} disabled={busy}>
                  <FileDown /> Word
                </Button>
              </div>
            </div>
             <div className="max-h-[65vh] overflow-y-auto whitespace-pre-wrap break-words px-4 py-6 leading-relaxed sm:px-6">
              {tab === "summary" ? summary || "…" : translation || "Translation will appear here section by section…"}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button variant={active ? "default" : "ghost"}
      onClick={onClick}
      className="h-auto min-w-0 whitespace-normal rounded-lg px-3 py-2 text-sm font-semibold"
    >
      {children}
    </Button>
  );
}
