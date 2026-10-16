import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Item = { id: string; author_name: string; message: string; is_read: boolean; created_at: string; shared_documents: { title: string } | null };

export function FeedbackBell() {
  const [items, setItems] = useState<Item[]>([]);

  async function load() {
    const { data } = await supabase
      .from("feedback")
      .select("id, author_name, message, is_read, created_at, shared_documents(title)")
      .order("created_at", { ascending: false })
      .limit(30);
    if (data) setItems(data as Item[]);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel("feedback-bell")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "feedback" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const unread = items.filter((i) => !i.is_read);

  async function markRead(open: boolean) {
    if (open || unread.length === 0) return;
    await supabase.from("feedback").update({ is_read: true }).in("id", unread.map((i) => i.id));
    load();
  }

  return (
    <Popover onOpenChange={markRead}>
      <PopoverTrigger className="relative ml-auto shrink-0 rounded-full p-2 hover:bg-background/10" aria-label="Feedback notifications">
        <Bell className="h-6 w-6" />
        {unread.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-destructive-foreground">
            {unread.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="max-h-96 w-80 max-w-[calc(100vw-2rem)] overflow-y-auto break-words p-0">
        <div className="border-b px-4 py-3 font-semibold">Maganizo a anthu · Feedback</div>
        {items.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground">No feedback yet.</p>}
        {items.map((i) => (
          <div key={i.id} className={`border-b px-4 py-3 text-sm ${i.is_read ? "" : "bg-accent"}`}>
            <div className="font-semibold">{i.author_name}</div>
            <div className="text-xs text-muted-foreground">
              on {i.shared_documents?.title ?? "a document"} · {new Date(i.created_at).toLocaleString()}
            </div>
            <p className="mt-1 whitespace-pre-wrap">{i.message}</p>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
