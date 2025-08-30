import { useI18n } from "../locale/LocaleProvider";
import "./LanguageBar.css";

const langs = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "te", label: "తెలుగు" }
];

export default function LanguageBar() {
  const { lang, setLang } = useI18n();

  return (
    <div className="langbar">
      <div className="langbar-inner">
        {langs.map((l) => (
          <button
            key={l.code}
            className={`lang-item ${lang === l.code ? "active" : ""}`}
            onClick={() => setLang(l.code)}
            title={l.label}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
