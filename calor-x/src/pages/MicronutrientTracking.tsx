import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, FlaskConical, Pill, Lock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { usePlan } from "@/hooks/usePlan";

// RDI reference values (per day) – WHO/FDA standards
const RDI: Record<string, { label: string; label_ar: string; unit: string; rdi: number; category: "vitamin" | "mineral" }> = {
    "vitamin_a": { label: "Vitamin A", label_ar: "فيتامين أ", unit: "µg", rdi: 900, category: "vitamin" },
    "vitamin_c": { label: "Vitamin C", label_ar: "فيتامين ج", unit: "mg", rdi: 90, category: "vitamin" },
    "vitamin_d": { label: "Vitamin D", label_ar: "فيتامين د", unit: "µg", rdi: 20, category: "vitamin" },
    "vitamin_b12": { label: "Vitamin B12", label_ar: "فيتامين ب12", unit: "µg", rdi: 2.4, category: "vitamin" },
    "vitamin_e": { label: "Vitamin E", label_ar: "فيتامين هـ", unit: "mg", rdi: 15, category: "vitamin" },
    "vitamin_k": { label: "Vitamin K", label_ar: "فيتامين ك", unit: "µg", rdi: 120, category: "vitamin" },
    "iron": { label: "Iron", label_ar: "الحديد", unit: "mg", rdi: 18, category: "mineral" },
    "calcium": { label: "Calcium", label_ar: "الكالسيوم", unit: "mg", rdi: 1000, category: "mineral" },
    "potassium": { label: "Potassium", label_ar: "البوتاسيوم", unit: "mg", rdi: 3500, category: "mineral" },
    "magnesium": { label: "Magnesium", label_ar: "المغنيسيوم", unit: "mg", rdi: 420, category: "mineral" },
    "zinc": { label: "Zinc", label_ar: "الزنك", unit: "mg", rdi: 11, category: "mineral" },
    "sodium": { label: "Sodium", label_ar: "الصوديوم", unit: "mg", rdi: 2300, category: "mineral" },
};

interface MicroEntry {
    key: string;
    label: string;
    label_ar: string;
    unit: string;
    rdi: number;
    amount: number;
    pct: number;
    category: "vitamin" | "mineral";
    sources: string[];
}

const MicronutrientTracking = () => {
    const navigate = useNavigate();
    const { t, lang } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [micros, setMicros] = useState<MicroEntry[]>([]);
    const [activeCategory, setActiveCategory] = useState<"vitamin" | "mineral">("vitamin");

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate("/auth"); return; }

            // Fetch last 7 days of meal logs that have vitamins_minerals
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { data: meals } = await supabase
                .from("meal_logs")
                .select("dish_name, dish_name_ar, vitamins_minerals, ingredients")
                .eq("user_id", user.id)
                .gte("logged_at", sevenDaysAgo.toISOString());

            if (!meals?.length) { setLoading(false); return; }

            // Aggregate vitamins_minerals across all meals and ingredients
            const totals: Record<string, { amount: number; sources: string[] }> = {};

            meals.forEach((meal) => {
                const dishName = (lang === "ar" ? meal.dish_name_ar : meal.dish_name) || meal.dish_name || "";

                // Check meal-level vitamins_minerals
                const vm = meal.vitamins_minerals as Record<string, number> | null;
                if (vm && typeof vm === "object") {
                    Object.entries(vm).forEach(([key, val]) => {
                        const normKey = key.toLowerCase().replace(/[\s-]/g, "_");
                        if (!totals[normKey]) totals[normKey] = { amount: 0, sources: [] };
                        totals[normKey].amount += Number(val) || 0;
                        if (dishName && !totals[normKey].sources.includes(dishName)) {
                            totals[normKey].sources.push(dishName);
                        }
                    });
                }

                // Check ingredient-level vitamins_minerals
                const ingredients = meal.ingredients as any[] | null;
                if (Array.isArray(ingredients)) {
                    ingredients.forEach((ing) => {
                        const ingName = lang === "ar" ? (ing.name_ar || ing.name) : (ing.name || ing.name_ar);
                        const ingVm = ing.vitamins_minerals as Record<string, number> | null;
                        if (ingVm && typeof ingVm === "object") {
                            Object.entries(ingVm).forEach(([key, val]) => {
                                const normKey = key.toLowerCase().replace(/[\s-]/g, "_");
                                if (!totals[normKey]) totals[normKey] = { amount: 0, sources: [] };
                                totals[normKey].amount += Number(val) || 0;
                                if (ingName && !totals[normKey].sources.includes(ingName)) {
                                    totals[normKey].sources.push(ingName);
                                }
                            });
                        }
                    });
                }
            });

            // Map to RDI keys
            const entries: MicroEntry[] = Object.entries(RDI).map(([rdiKey, rdiData]) => {
                // Try to find matching key in totals
                const matchKey = Object.keys(totals).find(k =>
                    k === rdiKey ||
                    k.includes(rdiKey.replace("vitamin_", "").replace("_", "")) ||
                    rdiKey.includes(k.replace("vitamin_", "").replace("_", ""))
                );
                const amount = matchKey ? totals[matchKey].amount : 0;
                const sources = matchKey ? totals[matchKey].sources : [];
                return {
                    key: rdiKey,
                    label: rdiData.label,
                    label_ar: rdiData.label_ar,
                    unit: rdiData.unit,
                    rdi: rdiData.rdi,
                    amount: Math.round(amount * 10) / 10,
                    pct: Math.min(Math.round((amount / rdiData.rdi) * 100), 150),
                    category: rdiData.category,
                    sources,
                };
            });

            setMicros(entries);
            setLoading(false);
        };
        load();
    }, [navigate, lang]);

    const filteredMicros = micros.filter(m => m.category === activeCategory);
    const hasAnyData = micros.some(m => m.amount > 0);

    const getPctColor = (pct: number) => {
        if (pct >= 80) return "#FF4500";
        if (pct >= 40) return "#FF8C00";
        return "#EF4444";
    };

    const { isPro, loading: planLoading } = usePlan();

    const header = (
        <div className="p-4 text-white flex items-center gap-3 sticky top-0 z-10" style={{ background: "linear-gradient(135deg, #FF4500, #FF6B35)" }}>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate("/progress")}>
                <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
                <h1 className="text-lg font-bold">{t("micro_title")}</h1>
                <p className="text-xs opacity-80">{t("micro_7day")}</p>
            </div>
            <FlaskConical className="w-5 h-5 opacity-80" />
        </div>
    );

    if (!planLoading && !isPro) {
        return (
            <div className="min-h-screen flex flex-col" style={{ background: "#FFF5F0" }}>
                {header}
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #FF8C00, #B8860B)" }}>
                        <Lock className="w-12 h-12 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black mb-2" style={{ color: "#FF4500" }}>{t("coach_locked_title")}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{t("coach_locked_desc")}</p>
                    </div>

                    <Card className="w-full max-w-xs p-5 text-left space-y-3 premium-card">
                        {[
                            { icon: "🔬", text: "تتبع الفيتامينات والمعادن" },
                            { icon: "📊", text: "تحليل دقيق لنقص التغذية" },
                            { icon: "🍎", text: "اقتراحات أطعمة لسد النقص" },
                        ].map(({ icon, text }) => (
                            <div key={text} className="flex items-center gap-3">
                                <span className="text-xl">{icon}</span>
                                <span className="text-sm font-medium" style={{ color: "#FF4500" }}>{text}</span>
                            </div>
                        ))}
                    </Card>

                    <Button
                        className="w-full max-w-xs py-6 rounded-2xl font-bold text-lg btn-glow"
                        style={{ background: "#FF4500", color: "white" }}
                        onClick={() => navigate("/pricing")}
                    >
                        <Zap className="w-5 h-5 mr-2" />
                        {t("upgrade_btn")}
                    </Button>
                    <p className="text-xs text-muted-foreground">{t("price_footer")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24" style={{ background: "#FFF5F0" }}>
            {header}

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#FF4500" }} />
                </div>
            ) : !hasAnyData ? (
                <div className="p-8 text-center space-y-4 pt-20">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(27, 67, 50, 0.08)" }}>
                        <Pill className="w-10 h-10" style={{ color: "#FF4500", opacity: 0.4 }} />
                    </div>
                    <p className="text-base font-medium text-muted-foreground">{t("micro_no_data")}</p>
                    <Button className="rounded-2xl px-6" style={{ background: "#FF4500" }} onClick={() => navigate("/scan")}>
                        {t("scan_title")}
                    </Button>
                </div>
            ) : (
                <div className="p-4 space-y-4">
                    {/* Subtitle */}
                    <p className="text-sm text-muted-foreground">{t("micro_subtitle")}</p>

                    {/* Category tabs */}
                    <div className="flex gap-2">
                        {(["vitamin", "mineral"] as const).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                                style={{
                                    background: activeCategory === cat ? "#FF4500" : "white",
                                    color: activeCategory === cat ? "white" : "#6B7280",
                                    border: "1px solid rgba(27, 67, 50, 0.1)",
                                }}
                            >
                                {cat === "vitamin" ? t("micro_vitamins") : t("micro_minerals")}
                            </button>
                        ))}
                    </div>

                    {/* Micronutrient cards */}
                    <div className="space-y-3">
                        {filteredMicros.map((micro) => (
                            <Card key={micro.key} className="p-4 premium-card">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="font-bold text-sm" style={{ color: "#FF4500" }}>
                                            {lang === "ar" ? micro.label_ar : micro.label}
                                        </p>
                                        {micro.sources.length > 0 && (
                                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                                {t("micro_sources")}: {micro.sources.slice(0, 2).join(", ")}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-lg" style={{ color: getPctColor(micro.pct) }}>
                                            {micro.pct}%
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {micro.amount} / {micro.rdi} {micro.unit}
                                        </p>
                                    </div>
                                </div>
                                {/* Progress bar */}
                                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(27, 67, 50, 0.08)" }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(micro.pct, 100)}%`,
                                            background: getPctColor(micro.pct),
                                        }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">{t("micro_rdi")}</p>
                            </Card>
                        ))}
                    </div>

                    {/* Legend */}
                    <Card className="p-4 premium-card">
                        <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
                            {lang === "ar" ? "دليل الألوان" : "Color Guide"}
                        </h3>
                        <div className="space-y-1.5">
                            {[
                                { color: "#FF4500", label: lang === "ar" ? "≥ 80% — ممتاز" : "≥ 80% — Excellent" },
                                { color: "#FF8C00", label: lang === "ar" ? "40–79% — جيد" : "40–79% — Good" },
                                { color: "#EF4444", label: lang === "ar" ? "< 40% — يحتاج تحسين" : "< 40% — Needs improvement" },
                            ].map(({ color, label }) => (
                                <div key={color} className="flex items-center gap-2 text-xs">
                                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                                    <span className="text-muted-foreground">{label}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )
            }
        </div >
    );
};

export default MicronutrientTracking;
