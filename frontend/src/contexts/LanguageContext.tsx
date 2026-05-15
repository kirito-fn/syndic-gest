import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import fr from '../translations/fr';
import ar from '../translations/ar';

type Lang = 'fr' | 'ar';
type Translations = typeof fr;

interface LanguageContextType {
  lang: Lang;
  t: (path: string) => string;
  currency: string;
  dir: 'ltr' | 'rtl';
  toggleLang: () => void;
}

function resolvePath(obj: any, path: string): string {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result?.[key] === undefined) return path;
    result = result[key];
  }
  return typeof result === 'string' ? result : path;
}

const translations: Record<Lang, Translations> = { fr, ar };

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('lang');
    return saved === 'ar' ? 'ar' : 'fr';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (path: string) => resolvePath(translations[lang], path);
  const currency = lang === 'ar' ? 'د.م.' : 'MAD';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const toggleLang = () => setLang((prev) => (prev === 'fr' ? 'ar' : 'fr'));

  return <LanguageContext.Provider value={{ lang, t, currency, dir, toggleLang }}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);
