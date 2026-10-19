import { priceBooking } from './pricing.js';

const settings = { transferDiscountPercent: 10, depositPercent: 50 };

describe('priceBooking', () => {
  it('charges the full price with Mercado Pago', () => {
    expect(priceBooking(1200, 'MERCADO_PAGO', 'DEPOSIT', settings)).toEqual({
      priceSnapshot: 1200,
      depositAmount: 600,
      amountDue: 600,
    });
  });

  it('applies the transfer discount before the deposit', () => {
    expect(priceBooking(1200, 'BANK_TRANSFER', 'DEPOSIT', settings)).toEqual({
      priceSnapshot: 1080,
      depositAmount: 540,
      amountDue: 540,
    });
  });

  it('asks for the whole price when paying in full', () => {
    expect(
      priceBooking(1200, 'BANK_TRANSFER', 'FULL', settings).amountDue,
    ).toBe(1080);
  });

  it('rounds to whole pesos', () => {
    expect(priceBooking(1250, 'BANK_TRANSFER', 'DEPOSIT', settings)).toEqual({
      priceSnapshot: 1125, // 1250 * 0.9
      depositAmount: 563, // 562.5 rounded
      amountDue: 563,
    });
  });
});
