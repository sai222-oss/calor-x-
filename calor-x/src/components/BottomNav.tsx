import { useNavigate, useLocation } from "react-router-dom";
import { Home, Camera, MessageCircle, User } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const APP_PATHS = ["/dashboard", "/scan", "/nutrition-results", "/progress", "/ai-coach", "/profile", "/profile-setup"];

const BottomNav = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { t, lang } = useLanguage();

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
            <div className="grid grid-cols-4 max-w-lg mx-auto">
                {tabs.map(({ icon: Icon, label, path }) => {
                    const active = pathname === path || (path !== "/dashboard" && pathname.startsWith(path));
                    return (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className="flex flex-col items-center gap-1.5 py-4 px-2 transition-all duration-200"
                            aria-label={label}
                        >
                            <div className={`relative transition-all duration-200 ${active ? "-translate-y-1" : ""}`}>
                                <Icon
                                    className="w-6 h-6"
                                    style={{ color: active ? "#6C63FF" : "#B4B4C5" }}
                                    strokeWidth={active ? 2.5 : 2}
                                />
                            </div>
                            <span
                                className="text-[10px] font-bold leading-none"
                                style={{ color: active ? "#6C63FF" : "#B4B4C5" }}
                            >{label}</span>
                        </button>
                    );
                })}

            </div>
        </nav>
    );
};

export default BottomNav;
