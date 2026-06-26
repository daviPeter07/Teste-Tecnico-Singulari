-- AlterEnum
ALTER TYPE "CurationRunStatus" ADD VALUE IF NOT EXISTS 'QUEUED';

-- AlterEnum
ALTER TYPE "CurationRunStatus" ADD VALUE IF NOT EXISTS 'PARTIAL';

-- AlterTable
ALTER TABLE "curation_runs"
ADD COLUMN "items_processed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "items_failed" INTEGER NOT NULL DEFAULT 0;
