import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { loadSaved, saveDocs, type SavedDoc } from "@/lib/offline";
import { CommunityHeader } from "@/components/CommunityHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { anonymousFeedback } from "@/lib/community";

export const Route = createFileRoute("/community/$id")({
  head: () => ({
    meta: [
      { title: "Werengani chikalata — Esia Mvetsetsa Community" },
      { name: "description", content: "Read this ESIA report in Chichewa and send your feedback to the project team." },
      { property: "og:title", content: "Werengani chikalata — Esia Mvetsetsa Community" },
      { property: "og:description", content: "Read this ESIA report in Chichewa and share your views." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CommunityDoc,
});

function CommunityDoc() {
  const { id } = Route.useParams();
  const [doc, setDoc] = useState<SavedDoc | null>(null);
  const [tab, setTab] = useState("summary");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"" | "sending" | "sent" | "error">("");

  useEffect(() => {
    setDoc(loadSaved().find((d) => d.id === id) ?? null);
    setLoading(true);
    supabase
      .from("shared_documents")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setLoading(false);
        if (data) {
          saveDocs([data]);
          setDoc(data);
        }
      });
  }, [id]);

  async function send() {
    if (!message.trim() || status === "sending") return;
    setStatus("sending");
    try {
      const { error } = await supabase.from("feedback").insert(anonymousFeedback(id, message));
      if (error) return setStatus("error");
      setStatus("sent");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <CommunityHeader />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <Link to="/community" className="inline-flex items-center gap-1 text-sm text-primary">
          <ArrowLeft className="h-4 w-4" /> Zikalata zonse · All documents
        </Link>
        {!doc ? (
          <p className="text-muted-foreground">{loading ? "Tikutsegula… (Loading…)" : "Document unavailable. Check your connection and try again."}</p>
        ) : (
          <>
            <h1 className="break-words font-display text-2xl font-bold">{doc.title}</h1>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid h-auto w-full grid-cols-3">
                <TabsTrigger value="summary" className="min-w-0 whitespace-normal py-2">Chidule</TabsTrigger>
                <TabsTrigger value="full" className="min-w-0 whitespace-normal py-2">Kumasulira</TabsTrigger>
                <TabsTrigger value="feedback" className="min-w-0 whitespace-normal py-2"><MessageSquare className="h-4 w-4 shrink-0" /> Feedback</TabsTrigger>
              </TabsList>
            </Tabs>
            {tab !== "feedback" ? (
            <section className="border-t">
              <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap break-words py-5 leading-relaxed">
                {(tab === "summary" ? doc.summary : doc.translation) || "—"}
              </div>
            </section>
            ) : (
            <section className="space-y-3 border-t pt-5">
              <h2 className="font-display text-lg font-bold">Maganizo osadziwika · Anonymous feedback</h2>
              {status === "sent" ? (
                <p role="status" className="flex items-center gap-2 text-sm font-medium text-primary">
                  <CheckCircle2 className="h-5 w-5 shrink-0" /> Zikomo! Maganizo anu atumizidwa. (Thank you, sent.)
                </p>
              ) : (
                <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void send(); }}>
                  <label htmlFor="anonymous-message" className="text-sm font-medium">Maganizo anu · Your feedback</label>
                  <Textarea
                    id="anonymous-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    disabled={status === "sending"}
                    placeholder="Lembani maganizo anu… (Write your feedback)"
                    className="min-h-36"
                  />
                  {status === "error" && (
                    <p className="text-sm text-destructive">Sitinathe kutumiza. Onani intaneti. (Couldn't send — check your internet.)</p>
                  )}
                  <Button type="submit" className="w-full sm:w-auto" disabled={status === "sending" || !message.trim()}>
                    <Send /> {status === "sending" ? "Sending…" : "Tumizani · Send anonymously"}
                  </Button>
                </form>
              )}
            </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
