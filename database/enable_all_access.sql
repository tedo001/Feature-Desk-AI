-- ================================================================
-- PERMISSIVE ACCESS SCRIPT (DANGER: Allow all operations for everyone)
-- Run this in Supabase Dashboard > SQL Editor
-- ================================================================

-- 1. Grant usage on schema to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Grant all privileges on all tables to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- 3. Grant all privileges on all sequences to anon and authenticated roles
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 4. Enable RLS and create a permissive policy for ALL tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        -- Enable Row Level Security (required for policies to work)
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
        
        -- Drop existing policy if it exists to avoid errors
        EXECUTE format('DROP POLICY IF EXISTS "Enable all access" ON public.%I;', r.tablename);
        
        -- Create the permissive policy: FOR ALL operations (SELECT, INSERT, UPDATE, DELETE)
        -- USING (true): Rows are visible to everyone
        -- WITH CHECK (true): Rows can be inserted/updated by everyone
        EXECUTE format('CREATE POLICY "Enable all access" ON public.%I FOR ALL USING (true) WITH CHECK (true);', r.tablename);
    END LOOP;
END $$;
