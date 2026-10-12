-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_VERIFICATION', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MERCADO_PAGO', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED');

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMin" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklySchedule" (
    "id" SERIAL NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startMinutes" INTEGER NOT NULL,
    "endMinutes" INTEGER NOT NULL,

    CONSTRAINT "WeeklySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeOff" (
    "id" SERIAL NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "TimeOff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birthDate" DATE NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "blockedUntil" TIMESTAMPTZ(3) NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "priceSnapshot" INTEGER NOT NULL,
    "depositAmount" INTEGER NOT NULL,
    "holdExpiresAt" TIMESTAMPTZ(3),
    "reason" TEXT,
    "privacyConsentAt" TIMESTAMPTZ(3) NOT NULL,
    "manageTokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "mercadoPagoPaymentId" TEXT,
    "verifiedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "depositPercent" INTEGER NOT NULL DEFAULT 50,
    "transferDiscountPercent" INTEGER NOT NULL DEFAULT 10,
    "mpHoldMinutes" INTEGER NOT NULL DEFAULT 10,
    "transferHoldHours" INTEGER NOT NULL DEFAULT 2,
    "bufferMinutes" INTEGER NOT NULL DEFAULT 15,
    "minAdvanceHours" INTEGER NOT NULL DEFAULT 12,
    "maxAdvanceDays" INTEGER NOT NULL DEFAULT 30,
    "bankDetails" TEXT,
    "address" TEXT,
    "neighborhood" TEXT,
    "cancellationPolicyText" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_manageTokenHash_key" ON "Booking"("manageTokenHash");

-- CreateIndex
CREATE INDEX "Booking_clientId_idx" ON "Booking"("clientId");

-- CreateIndex
CREATE INDEX "Booking_serviceId_idx" ON "Booking"("serviceId");

-- CreateIndex
CREATE INDEX "Booking_startsAt_idx" ON "Booking"("startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mercadoPagoPaymentId_key" ON "Payment"("mercadoPagoPaymentId");

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "Payment"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── Manual additions (not expressible in schema.prisma) ─────────────────────

-- No overlapping bookings (ADR-004, ADR-008). Each booking occupies
-- [startsAt, blockedUntil), i.e. the session plus the rest buffer. Only
-- cancelled and expired bookings free their slot. GiST supports range
-- overlap (&&) natively, so no extension is needed.
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_no_overlap"
  EXCLUDE USING gist (tstzrange("startsAt", "blockedUntil", '[)') WITH &&)
  WHERE ("status" NOT IN ('CANCELLED', 'EXPIRED'));

-- Value checks: the database rejects impossible data even if the API has a bug.
ALTER TABLE "Service" ADD CONSTRAINT "Service_values_check"
  CHECK ("durationMin" > 0 AND "price" >= 0);

ALTER TABLE "WeeklySchedule" ADD CONSTRAINT "WeeklySchedule_values_check"
  CHECK ("weekday" BETWEEN 0 AND 6
     AND "startMinutes" >= 0
     AND "endMinutes" <= 1440
     AND "startMinutes" < "endMinutes");

ALTER TABLE "TimeOff" ADD CONSTRAINT "TimeOff_range_check"
  CHECK ("startsAt" < "endsAt");

-- Emails are stored lowercase so Ana@Mail.com and ana@mail.com are the same client.
ALTER TABLE "Client" ADD CONSTRAINT "Client_email_lowercase_check"
  CHECK ("email" = lower("email"));

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_values_check"
  CHECK ("startsAt" < "endsAt"
     AND "endsAt" <= "blockedUntil"
     AND "priceSnapshot" >= 0
     AND "depositAmount" BETWEEN 0 AND "priceSnapshot");

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_amount_check"
  CHECK ("amount" > 0);

-- Settings is a single row (id = 1) with sane values.
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_values_check"
  CHECK ("id" = 1
     AND "depositPercent" BETWEEN 0 AND 100
     AND "transferDiscountPercent" BETWEEN 0 AND 100
     AND "mpHoldMinutes" > 0
     AND "transferHoldHours" > 0
     AND "bufferMinutes" >= 0
     AND "minAdvanceHours" >= 0
     AND "maxAdvanceDays" > 0);
