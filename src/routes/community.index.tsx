import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Search, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { loadSaved, saveDocs, type SavedDoc } from "@/lib/offline";
import { CommunityHeader } from "@/components/CommunityHeader";
import { Input } from "@/components/ui/input";
import { searchDocuments } from "@/lib/community";

export const Route = createFileRoute("/community/")({
  head: () => ({
    meta: [
      { title: "Malo a Anthu — Esia Mvetsetsa Community" },
      { name: "description", content: "Read ESIA reports translated into Chichewa and share your views with the project team." },
      { property: "og:title", content: "Malo a Anthu — Esia Mvetsetsa Community" },
      { property: "og:description", content: "Community space to read Chichewa ESIA reports and leave feedback." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CommunityList,
});

function CommunityList() {
  const [docs, setDocs] = useState<SavedDoc[]>([]);
  const [offline, setOffline] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const filteredDocs = searchDocuments(docs, query);

  useEffect(() => {
    setDocs(loadSaved());
    supabase
      .from("shared_documents")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        setLoading(false);
        if (error || !data) return setOffline(true);
        setDocs(saveDocs(data));
      });
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <CommunityHeader />
      <main className="mx-auto max-w-3xl space-y-3 px-4 py-6">
        <h1 className="font-display text-2xl font-bold">Zikalata · Documents</h1>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input type="search" aria-label="Search uploaded documents" placeholder="Search · Sakani zikalata" value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 pl-10" />
        </div>
        {offline && (
          <p className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm">
            <WifiOff className="h-4 w-4" /> Mulibe intaneti. Mukuwerenga zikalata zosungidwa. (Offline — showing saved documents.)
          </p>
        )}
        {loading && docs.length === 0 && <p className="text-muted-foreground">Tikutsegula… (Loading…)</p>}
        {!loading && docs.length === 0 && <p className="text-muted-foreground">Palibe zikalata pano. (No documents yet.)</p>}
        {docs.length > 0 && filteredDocs.length === 0 && <p role="status" className="text-muted-foreground">No documents match your search.</p>}
        {filteredDocs.map((d) => (
          <Link
            key={d.id}
            to="/community/$id"
            params={{ id: d.id }}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm hover:border-primary"
          >
            <FileText className="h-6 w-6 shrink-0 text-primary" />
            <div className="min-w-0">
              <div className="truncate font-semibold">{d.title}</div>
              <div className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</div>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}
