-- ============================================================
-- Department D Budget System — Supabase Schema
-- Run this in your Supabase SQL Editor (Database → SQL Editor)
-- ============================================================

-- ─── 1. Users (public profile, extends auth.users) ────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email       TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'viewer'
                CHECK (role IN ('admin', 'editor', 'viewer')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- ─── 2. Budget Years ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.years (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year         INTEGER NOT NULL UNIQUE,
  total_budget NUMERIC NOT NULL DEFAULT 0,
  notes        TEXT DEFAULT '',
  is_active    BOOLEAN DEFAULT TRUE,
  created_by   UUID REFERENCES auth.users,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. Categories ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#64748b',
  is_active  BOOLEAN DEFAULT TRUE,
  "order"    INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. Expenses ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.expenses (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_id              UUID NOT NULL REFERENCES public.years ON DELETE RESTRICT,
  category_id          UUID NOT NULL REFERENCES public.categories ON DELETE RESTRICT,
  title                TEXT NOT NULL,
  description          TEXT DEFAULT '',
  amount               NUMERIC NOT NULL,
  date                 DATE NOT NULL,
  paid_by              TEXT NOT NULL,
  payment_method       TEXT NOT NULL,
  vendor               TEXT DEFAULT '',
  invoice_number       TEXT DEFAULT '',
  reimbursement_status TEXT NOT NULL DEFAULT 'לא רלוונטי',
  reimbursement_date   DATE,
  external_link        TEXT DEFAULT '',
  notes                TEXT DEFAULT '',
  -- Attachments stored as JSONB array: [{id, name, url, storagePath, uploadedAt, uploadedBy, uploadedByName, size, type}]
  attachments          JSONB DEFAULT '[]'::jsonb,
  created_by           UUID REFERENCES auth.users,
  created_by_name      TEXT NOT NULL DEFAULT '',
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_by           UUID REFERENCES auth.users,
  updated_by_name      TEXT DEFAULT ''
);

-- ─── 5. Settings (single row) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
  id              TEXT PRIMARY KEY DEFAULT 'main',
  department_name TEXT DEFAULT 'מחלקה ד׳',
  system_name     TEXT DEFAULT 'מערכת ניהול תקציב',
  external_link   TEXT DEFAULT '',
  active_year_id  UUID REFERENCES public.years,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_by      UUID REFERENCES auth.users
);

-- Insert default settings row
INSERT INTO public.settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- ─── 6. Indexes ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS expenses_year_id_idx   ON public.expenses (year_id);
CREATE INDEX IF NOT EXISTS expenses_category_idx  ON public.expenses (category_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx      ON public.expenses (date DESC);
CREATE INDEX IF NOT EXISTS categories_order_idx   ON public.categories ("order");

-- ─── 7. Row Level Security ────────────────────────────────────────────────────
ALTER TABLE public.users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.years     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings  ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- USERS policies
CREATE POLICY "users: authenticated can read all"
  ON public.users FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "users: admin can insert"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (current_user_role() = 'admin');

CREATE POLICY "users: admin can update"
  ON public.users FOR UPDATE TO authenticated
  USING (current_user_role() = 'admin');

CREATE POLICY "users: own profile update"
  ON public.users FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- YEARS policies
CREATE POLICY "years: authenticated can read"
  ON public.years FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "years: admin can write"
  ON public.years FOR ALL TO authenticated
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

-- CATEGORIES policies
CREATE POLICY "categories: authenticated can read"
  ON public.categories FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "categories: editor+ can write"
  ON public.categories FOR ALL TO authenticated
  USING (current_user_role() IN ('admin', 'editor'))
  WITH CHECK (current_user_role() IN ('admin', 'editor'));

-- EXPENSES policies
CREATE POLICY "expenses: authenticated can read"
  ON public.expenses FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "expenses: editor+ can insert"
  ON public.expenses FOR INSERT TO authenticated
  WITH CHECK (current_user_role() IN ('admin', 'editor'));

CREATE POLICY "expenses: editor+ can update"
  ON public.expenses FOR UPDATE TO authenticated
  USING (current_user_role() IN ('admin', 'editor'));

CREATE POLICY "expenses: admin can delete"
  ON public.expenses FOR DELETE TO authenticated
  USING (current_user_role() = 'admin');

-- SETTINGS policies
CREATE POLICY "settings: authenticated can read"
  ON public.settings FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "settings: admin can write"
  ON public.settings FOR ALL TO authenticated
  USING (current_user_role() = 'admin')
  WITH CHECK (current_user_role() = 'admin');

-- ─── 8. Storage Bucket ────────────────────────────────────────────────────────
-- Run this OR create the bucket manually in Supabase Dashboard → Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('expenses', 'expenses', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "storage: authenticated can read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'expenses');

CREATE POLICY "storage: editor+ can upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'expenses' AND current_user_role() IN ('admin', 'editor'));

CREATE POLICY "storage: editor+ can delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'expenses' AND current_user_role() IN ('admin', 'editor'));

-- ─── 9. Seed: Default Categories ─────────────────────────────────────────────
INSERT INTO public.categories (name, color, "order") VALUES
  ('ציוד משרדי',      '#3b82f6', 1),
  ('ציוד טיפולי',     '#8b5cf6', 2),
  ('פעילויות לילדים', '#f59e0b', 3),
  ('כיבוד',           '#10b981', 4),
  ('תחזוקה',          '#6b7280', 5),
  ('רכישות שונות',    '#ef4444', 6),
  ('החזרים',          '#ec4899', 7),
  ('אחר',             '#64748b', 8)
ON CONFLICT DO NOTHING;

-- ─── 10. Seed: Default Years ─────────────────────────────────────────────────
INSERT INTO public.years (year, total_budget) VALUES
  (2024, 50000),
  (2025, 55000),
  (2026, 60000)
ON CONFLICT (year) DO NOTHING;
