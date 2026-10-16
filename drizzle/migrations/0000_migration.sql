CREATE TABLE public.shared_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  translation text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.shared_documents(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.shared_documents TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.feedback TO anon, authenticated;
GRANT ALL ON public.shared_documents, public.feedback TO service_role;
ALTER TABLE public.shared_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read docs" ON public.shared_documents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "share docs" ON public.shared_documents FOR INSERT TO anon, authenticated
  WITH CHECK (length(title) BETWEEN 1 AND 300 AND length(translation) + length(summary) > 0);
CREATE POLICY "read feedback" ON public.feedback FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "send feedback" ON public.feedback FOR INSERT TO anon, authenticated
  WITH CHECK (is_read = false AND length(author_name) BETWEEN 1 AND 80 AND length(message) BETWEEN 1 AND 2000);
CREATE POLICY "mark read" ON public.feedback FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (is_read = true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback;