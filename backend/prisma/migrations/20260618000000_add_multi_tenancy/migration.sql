-- CreateTable: Tenant
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- Insert default tenant for existing data
INSERT INTO "Tenant" ("name") VALUES ('Empresa Padrão');

-- Add tenantId columns as nullable first (to allow backfill before NOT NULL)
ALTER TABLE "User" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "Project" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "FinancialTransaction" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "Supplier" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "Customer" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "Worker" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "WorkLog" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "CostCenter" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "InventoryItem" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "Contract" ADD COLUMN "tenantId" INTEGER;
ALTER TABLE "Quote" ADD COLUMN "tenantId" INTEGER;

-- Backfill existing records with default tenant (id=1)
UPDATE "User" SET "tenantId" = 1;
UPDATE "Project" SET "tenantId" = 1;
UPDATE "FinancialTransaction" SET "tenantId" = 1;
UPDATE "Supplier" SET "tenantId" = 1;
UPDATE "Customer" SET "tenantId" = 1;
UPDATE "Worker" SET "tenantId" = 1;
UPDATE "WorkLog" SET "tenantId" = 1;
UPDATE "CostCenter" SET "tenantId" = 1;
UPDATE "InventoryItem" SET "tenantId" = 1;
UPDATE "Contract" SET "tenantId" = 1;
UPDATE "Quote" SET "tenantId" = 1;

-- Set NOT NULL constraints
ALTER TABLE "User" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Project" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "FinancialTransaction" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Supplier" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Customer" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Worker" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "WorkLog" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "CostCenter" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "InventoryItem" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Contract" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Quote" ALTER COLUMN "tenantId" SET NOT NULL;

-- AddForeignKey constraints
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkLog" ADD CONSTRAINT "WorkLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex on tenantId for all tables
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");
CREATE INDEX "Project_tenantId_idx" ON "Project"("tenantId");
CREATE INDEX "FinancialTransaction_tenantId_idx" ON "FinancialTransaction"("tenantId");
CREATE INDEX "Supplier_tenantId_idx" ON "Supplier"("tenantId");
CREATE INDEX "Customer_tenantId_idx" ON "Customer"("tenantId");
CREATE INDEX "Worker_tenantId_idx" ON "Worker"("tenantId");
CREATE INDEX "WorkLog_tenantId_idx" ON "WorkLog"("tenantId");
CREATE INDEX "CostCenter_tenantId_idx" ON "CostCenter"("tenantId");
CREATE INDEX "InventoryItem_tenantId_idx" ON "InventoryItem"("tenantId");
CREATE INDEX "Contract_tenantId_idx" ON "Contract"("tenantId");
CREATE INDEX "Quote_tenantId_idx" ON "Quote"("tenantId");

-- Enable RLS on Tenant table (consistent with existing tables)
ALTER TABLE "public"."Tenant" ENABLE ROW LEVEL SECURITY;
