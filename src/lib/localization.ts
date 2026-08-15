import english from "../../locales/en.json";
import hindi from "../../locales/hi.json";

export type SupportedLocale = "en" | "hi";
export type Dictionary = typeof english;

const dictionaries: Readonly<Record<SupportedLocale, Dictionary>> = {
  en: english,
  hi: hindi,
};

/**
 * Local dictionary resolver for the mock MVP. Routing, persistence, and
 * browser-language detection remain intentionally out of scope for now.
 */
export function getDictionary(locale: SupportedLocale): Dictionary {
  return dictionaries[locale];
}
