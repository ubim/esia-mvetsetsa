import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Maganizo a anthu — Esia Mvetsetsa" },
      { name: "description", content: "All feedback shared by community members on translated ESIA documents." },
      { property: "og:title", content: "Maganizo a anthu — Esia Mvetsetsa" },
      { property: "og:description", content: "All feedback shared by community members on translated ESIA documents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FeedbackPage,
});

type Item = {
  id: string;
  author_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
  shared_documents: { title: string } | null;
};

function FeedbackPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("feedback")
      .select("id, author_name, message, is_read, created_at, shared_documents(title)")
      .order("created_at", { ascending: false });
    if (data) setItems(data as Item[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel("feedback-page")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "feedback" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  async function markAllRead() {
    const unread = items.filter((i) => !i.is_read);
    if (unread.length === 0) return;
    await supabase.from("feedback").update({ is_read: true }).in("id", unread.map((i) => i.id));
    load();
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="bg-navy text-navy-foreground">
        <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 sm:flex">
          <div className="flex min-w-0 items-center gap-3">
          <MessageSquare className="h-6 w-6 shrink-0" />
          <h1 className="font-display text-lg font-bold">Maganizo a anthu · Feedback</h1>
          </div>
          {items.some((i) => !i.is_read) && (
            <Button variant="ghost" onClick={markAllRead} className="ml-auto shrink-0 text-xs">
              Mark all read
            </Button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-3 px-4 py-6 pb-24">
        {loading && <p className="text-muted-foreground">Tikutsegula… (Loading…)</p>}
        {!loading && items.length === 0 && <p className="text-muted-foreground">No feedback yet.</p>}
        {items.map((i) => (
          <div key={i.id} className={`rounded-xl border bg-card p-4 shadow-sm ${i.is_read ? "" : "border-primary/50 bg-accent"}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 break-words font-semibold">{i.author_name}</div>
              {!i.is_read && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">New</span>}
            </div>
            <div className="break-words text-xs text-muted-foreground">
              on {i.shared_documents?.title ?? "a document"} · {new Date(i.created_at).toLocaleString()}
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm">{i.message}</p>
          </div>
        ))}
      </main>
    </div>
  );
}
