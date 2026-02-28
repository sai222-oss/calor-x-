import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Lang, StringKey, translate } from "@/lib/i18n";

interface LanguageContextValue {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: (key: StringKey, vars?: Record<string, string | number>) => string;
    isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
    lang: "ar",
    setLang: () => { },
    t: (key) => key,
    isRTL: true,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [lang, setLangState] = useState<Lang>(() => {
        try {
            return (localStorage.getItem("calor_lang") as Lang) || "ar";
        } catch {
            return "ar";
        }
    });

    const setLang = (l: Lang) => {
        setLangState(l);
        try { localStorage.setItem("calor_lang", l); } catch { /* ok */ }
    };

    // Apply direction to html element
    useEffect(() => {
        const dir = lang === "ar" ? "rtl" : "ltr";
        document.documentElement.setAttribute("dir", dir);
        document.documentElement.setAttribute("lang", lang);
    }, [lang]);

    const t = (key: StringKey, vars?: Record<string, string | number>) =>
        translate(key, lang, vars);

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, isRTL: lang === "ar" }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
