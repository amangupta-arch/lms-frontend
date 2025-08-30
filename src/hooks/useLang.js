import { useI18n } from "../locale/LocaleProvider";
export default function useLang() {
  const { lang } = useI18n();
  return lang;
}
