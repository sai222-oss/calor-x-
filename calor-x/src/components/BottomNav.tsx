import { useNavigate, useLocation } from "react-router-dom";
import { Home, Camera, MessageCircle, User, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const APP_PATHS = ["/dashboard", "/scan", "/nutrition-results", "/progress", "/ai-coach", "/profile", "/profile-setup"];

const BottomNav = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { t, lang, setLang } = useLanguage();

    const isAppPage = APP_PATHS.some(p => pathname.startsWith(p));
    if (!isAppPage) return null;

    const tabs = [
        { icon: Home, label: t("nav_home"), path: "/dashboard" },
        { icon: Camera, label: t("nav_scan"), path: "/scan" },
        { icon: MessageCircle, label: t("nav_coach"), path: "/ai-coach" },
        { icon: User, label: t("nav_profile"), path: "/profile" },
    ];

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white"
            style={{
                borderColor: "rgba(0,0,0,0.05)",
                boxShadow: "0 -4px 20px rgba(0,0,0,0.02)",
            }}
        >
            <div className="grid grid-cols-5 max-w-lg mx-auto">
                {tabs.map(({ icon: Icon, label, path }) => {
                    const active = pathname === path || (path !== "/dashboard" && pathname.startsWith(path));
                    return (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className="flex flex-col items-center gap-1 py-3 px-2 transition-all duration-200"
                            aria-label={label}
                        >
                            <div className={`relative p-1.5 rounded-2xl transition-all duration-200 ${active ? "bg-brand-green/10" : ""}`}>
                                <Icon
                                    className="w-5 h-5"
                                    style={{ color: active ? "#1B4332" : "#6B7280" }}
                                    strokeWidth={active ? 2.5 : 2}
                                />
                                {active && (
                                    <span
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                                        style={{ background: "#D4AF37" }}
                                    />
                                )}
                            </div>
                            <span
                                className="text-[10px] font-bold leading-none"
                                style={{ color: active ? "#1B4332" : "#4B5563" }}
                            >{label}</span>
                        </button>
                    );
                })}

                {/* Language Toggle */}
                <button
                    onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                    className="flex flex-col items-center gap-1 py-3 px-2 transition-all duration-200"
                    aria-label="Toggle language"
                >
                    <div className="relative p-1.5 rounded-2xl transition-all duration-200" style={{ background: "rgba(212, 175, 55, 0.1)" }}>
                        <Globe className="w-5 h-5" style={{ color: "#D4AF37" }} />
                    </div>
                    <span className="text-[10px] font-semibold leading-none" style={{ color: "#D4AF37" }}>
                        {lang === "ar" ? "EN" : "عر"}
                    </span>
                </button>
            </div>
        </nav>
    );
};

export default BottomNav;
