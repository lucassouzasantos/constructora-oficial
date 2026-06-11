-- Enable Row Level Security on all public tables.
-- The NestJS backend connects via direct PostgreSQL URL (postgres superuser)
-- which bypasses RLS, so this does not affect application functionality.
-- This blocks direct access via Supabase PostgREST/REST API.

ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."FinancialTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Supplier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ProjectStage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ProjectBudget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Worker" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."WorkLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CostCenter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."InventoryItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Contract" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Quote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."QuoteStage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."QuoteItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."QuoteIndirectCost" ENABLE ROW LEVEL SECURITY;
