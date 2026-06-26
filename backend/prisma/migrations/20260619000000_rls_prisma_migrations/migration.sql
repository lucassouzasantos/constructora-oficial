-- Enable RLS on Prisma's internal migration tracking table
-- This prevents external access via Supabase PostgREST/REST API
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
