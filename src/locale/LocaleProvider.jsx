import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { messages, normalizeLang } from "../i18n";

const LocaleContext = createContext({ lang: "en", t: (k) => k, setLang: () => {} });

export function LocaleProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("lang");
    return saved || normalizeLang(navigator.language);
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const t = useMemo(() => {
    const dict = messages[lang] || messages.en;

    // simple nested getter: t("a.b.c")
    return (key, fallback = key) => {
      const parts = key.split(".");
      let cur = dict;
      for (const p of parts) {
        if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
        else return fallback;
      }
      return typeof cur === "string" ? cur : fallback;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  return useContext(LocaleContext);
}
