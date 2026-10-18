// Phone validation with Google's libphonenumber rules (JavaScript port).
// The "mobile" build only accepts numbers that can be mobile phones: the
// field is "Teléfono (WhatsApp)" and Uruguayan landlines have no WhatsApp.
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberWithError,
  type CountryCode,
} from "libphonenumber-js/mobile";

export type PhoneCheck =
  { ok: true; e164: string; display: string } | { ok: false; message: string };

/**
 * Checks that the number is a valid mobile number for the country.
 * A number starting with "+" is read as international, whatever the country.
 * Returns the number in E.164 (e.g. "+59899230654"), the format stored and
 * used for WhatsApp links.
 */
export function checkMobile(input: string, country: CountryCode): PhoneCheck {
  const invalid = {
    ok: false as const,
    message:
      country === "UY"
        ? "Ese número no parece un celular uruguayo. Revisá que esté completo, por ejemplo 099 123 456."
        : "Ese número no parece un celular válido para el país elegido. Revisá que esté completo.",
  };
  if (!input.trim()) return invalid;
  try {
    const phone = parsePhoneNumberWithError(input, country);
    if (!phone.isValid()) return invalid;
    return {
      ok: true,
      e164: phone.number,
      display: phone.formatInternational(),
    };
  } catch {
    return invalid;
  }
}

/** Countries for the selector: Uruguay first, then the rest by name in Spanish. */
export function countryOptions(): { code: CountryCode; label: string }[] {
  const names = new Intl.DisplayNames(["es"], { type: "region" });
  const options = getCountries().map((code) => ({
    code,
    label: `${names.of(code) ?? code} +${getCountryCallingCode(code)}`,
  }));
  options.sort((a, b) => a.label.localeCompare(b.label, "es"));
  const uruguay = options.findIndex((option) => option.code === "UY");
  return [...options.splice(uruguay, 1), ...options];
}
