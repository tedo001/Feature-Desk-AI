-- ================================================================
-- ENABLE REALTIME FOR ALL TABLES (Skips Views automatically)
-- Run this in Supabase Dashboard > SQL Editor
-- ================================================================

-- 1. Create the publication if it doesn't exist (Supabase usually has this)
CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');

-- 2. Add ALL physical tables to the publication
-- This loop uses pg_tables so it naturally ignores Views (like student_exams)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I;', r.tablename);
        EXCEPTION
            WHEN duplicate_object THEN
                -- Table already in publication, skip it
                RAISE NOTICE 'Table % is already in realtime publication', r.tablename;
            WHEN OTHERS THEN
                -- Log other errors but continue
                RAISE NOTICE 'Could not add table % to realtime: %', r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;
