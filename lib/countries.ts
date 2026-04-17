import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import countryToCurrency from "country-to-currency";

countries.registerLocale(enLocale);

export interface CountryOption {
  code: string;
  name: string;
}

export function getCountryOptions(): CountryOption[] {
  const names = countries.getNames("en", { select: "official" });
  return Object.entries(names)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCurrencyForCountry(code: string): string {
  return (countryToCurrency as Record<string, string>)[code] ?? "";
}

export function getCurrencyOptions(): string[] {
  return [...new Set(Object.values(countryToCurrency as Record<string, string>))].sort();
}
