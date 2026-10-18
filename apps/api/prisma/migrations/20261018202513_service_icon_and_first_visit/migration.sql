-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "icon" TEXT,
ADD COLUMN     "isFirstVisit" BOOLEAN NOT NULL DEFAULT false;
