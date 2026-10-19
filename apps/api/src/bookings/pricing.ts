// Amounts of a booking, always computed by the API from the database (the
// browser shows the same math, but what it sends is never trusted).
// The web app mirrors these rules in apps/web/src/app/reservar/booking-wizard.tsx.

export type PaymentMethod = 'MERCADO_PAGO' | 'BANK_TRANSFER';
export type PaymentPlan = 'DEPOSIT' | 'FULL';

export type Pricing = {
  /** Price agreed for this booking, transfer discount already applied. */
  priceSnapshot: number;
  /** Non-refundable part (ADR-010). */
  depositAmount: number;
  /** What the client pays now: the deposit or the whole price. */
  amountDue: number;
};

export function priceBooking(
  servicePrice: number,
  method: PaymentMethod,
  plan: PaymentPlan,
  settings: { transferDiscountPercent: number; depositPercent: number },
): Pricing {
  const priceSnapshot =
    method === 'BANK_TRANSFER'
      ? Math.round(
          (servicePrice * (100 - settings.transferDiscountPercent)) / 100,
        )
      : servicePrice;
  const depositAmount = Math.round(
    (priceSnapshot * settings.depositPercent) / 100,
  );
  return {
    priceSnapshot,
    depositAmount,
    amountDue: plan === 'FULL' ? priceSnapshot : depositAmount,
  };
}
