/*
  Warnings:

  - Added the required column `paymentPlan` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentPlan" AS ENUM ('DEPOSIT', 'FULL');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paymentPlan" "PaymentPlan" NOT NULL;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "whatsappNumber" TEXT;
