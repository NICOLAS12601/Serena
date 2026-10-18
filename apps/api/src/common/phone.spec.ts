import { normalizeMobile } from './phone.js';

describe('normalizeMobile', () => {
  it('accepts Uruguayan mobiles in local format and returns E.164', () => {
    expect(normalizeMobile('099 230654')).toBe('+59899230654');
    expect(normalizeMobile('091-234-567')).toBe('+59891234567');
  });

  it('rejects incomplete numbers and landlines', () => {
    expect(normalizeMobile('099 23065')).toBeNull();
    expect(normalizeMobile('2901 1234')).toBeNull();
    expect(normalizeMobile('hola')).toBeNull();
  });

  it('accepts foreign mobiles written with their country code', () => {
    expect(normalizeMobile('+54 9 11 2345-6789')).toBe('+5491123456789');
    expect(normalizeMobile('+34 612 345 678')).toBe('+34612345678');
  });
});
