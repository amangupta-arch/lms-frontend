import en from "./en.json";
import hi from "./hi.json";
import bn from "./bn.json";
import te from "./te.json";

export const LOCALES = ["en", "hi", "bn", "te"];

export const messages = { en, hi, bn, te };

export function normalizeLang(raw) {
  const r = (raw || "").toLowerCase();
  if (r.startsWith("hi")) return "hi";
  if (r.startsWith("bn")) return "bn";
  if (r.startsWith("te")) return "te";
  return "en";
}