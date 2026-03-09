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
    const [lang] = useState<Lang>("ar");

    const setLang = (l: Lang) => {
        // Disabled: App is enforced to Arabic only.
    };

    // Apply direction to html element
    useEffect(() => {
        document.documentElement.setAttribute("dir", "rtl");
        document.documentElement.setAttribute("lang", "ar");
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
