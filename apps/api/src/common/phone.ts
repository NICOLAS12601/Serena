import {
  parsePhoneNumberWithError,
  type CountryCode,
} from 'libphonenumber-js/mobile';

/**
 * Validates a mobile phone number with Google's libphonenumber rules and
 * returns it in E.164 ("+59899230654"), or null if it is not a valid mobile
 * number. Numbers without "+" are read as belonging to `defaultCountry`.
 * The same rules run in the web form (apps/web/src/lib/phone.ts).
 */
export function normalizeMobile(
  input: string,
  defaultCountry: CountryCode = 'UY',
): string | null {
  try {
    const phone = parsePhoneNumberWithError(input, defaultCountry);
    return phone.isValid() ? phone.number : null;
  } catch {
    return null;
  }
}
