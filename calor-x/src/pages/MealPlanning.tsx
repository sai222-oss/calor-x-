import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChefHat, Calendar, BookOpen, Lock, Zap, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { usePlan } from "@/hooks/usePlan";

type Tab = "today" | "week" | "recipes";

const WEEKLY_PLAN = [
    {
        day: { ar: "الأحد", en: "Sunday" },
        meals: {
            breakfast: { ar: "فول مدمس مع بيض مسلوق + خبز عربي", en: "Foul medames with boiled eggs + Arabic bread", cal: 520, protein: 28 },
            lunch: { ar: "شاورما دجاج مع أرز + سلطة", en: "Chicken shawarma with rice + salad", cal: 720, protein: 45 },
            dinner: { ar: "شوربة عدس + سلطة خضراء", en: "Lentil soup + green salad", cal: 380, protein: 18 },
        }
    },
    {
        day: { ar: "الاثنين", en: "Monday" },
        meals: {
            breakfast: { ar: "لبن رايب مع تمر + موز", en: "Greek yogurt with dates + banana", cal: 390, protein: 20 },
            lunch: { ar: "كبسة لحم مع سلطة خضراء", en: "Lamb kabsa with green salad", cal: 780, protein: 52 },
            dinner: { ar: "صدر دجاج مشوي مع خضار مشوية", en: "Grilled chicken breast with grilled vegetables", cal: 420, protein: 48 },
        }
    },
    {
        day: { ar: "الثلاثاء", en: "Tuesday" },
        meals: {
            breakfast: { ar: "عجة بيض بالخضار + أفوكادو", en: "Vegetable egg omelette + avocado", cal: 450, protein: 26 },
            lunch: { ar: "مقلوبة دجاج مع لبن", en: "Chicken maqlouba with yogurt", cal: 690, protein: 42 },
            dinner: { ar: "سمك مشوي مع أرز بسمتي", en: "Grilled fish with basmati rice", cal: 500, protein: 45 },
        }
    },
    {
        day: { ar: "الأربعاء", en: "Wednesday" },
        meals: {
            breakfast: { ar: "حمص بالطحينة + خبز + زيتون", en: "Hummus with tahini + bread + olives", cal: 480, protein: 18 },
            lunch: { ar: "جاج مثروم مع برغل", en: "Ground chicken with bulgur", cal: 650, protein: 46 },
            dinner: { ar: "تبولة + جبنة قريش", en: "Tabbouleh + cottage cheese", cal: 340, protein: 22 },
        }
    },
    {
        day: { ar: "الخميس", en: "Thursday" },
        meals: {
            breakfast: { ar: "عصيدة بالحليب والعسل + مكسرات", en: "Oatmeal with milk, honey + nuts", cal: 500, protein: 20 },
            lunch: { ar: "منسف لحم مع أرز", en: "Mansaf with rice", cal: 850, protein: 55 },
            dinner: { ar: "سلطة فراخ مشوية", en: "Grilled chicken salad", cal: 380, protein: 40 },
        }
    },
    {
        day: { ar: "الجمعة", en: "Friday" },
        meals: {
            breakfast: { ar: "لقيمات مع عسل + قهوة عربية", en: "Luqaimat with honey + Arabic coffee", cal: 420, protein: 8 },
            lunch: { ar: "دجاج مشوي مع خبز + سلطات", en: "Grilled chicken with bread + salads", cal: 720, protein: 50 },
            dinner: { ar: "شوربة دجاج مع خضار", en: "Chicken vegetable soup", cal: 320, protein: 30 },
        }
    },
    {
        day: { ar: "السبت", en: "Saturday" },
        meals: {
            breakfast: { ar: "مشكل فطور عربي (جبنة، زيتون، بيض)", en: "Arabic breakfast spread (cheese, olives, eggs)", cal: 550, protein: 32 },
            lunch: { ar: "كوسا محشية باللحم والأرز", en: "Stuffed zucchini with meat and rice", cal: 660, protein: 38 },
            dinner: { ar: "ماكرل مشوي مع بطاطس مسلوقة", en: "Grilled mackerel with boiled potatoes", cal: 450, protein: 42 },
        }
    },
];

const RECIPES = [
    { name: { ar: "صدر دجاج بالليمون", en: "Lemon Chicken Breast" }, cal: 320, protein: 52, time: "20 دقيقة", desc: { ar: "غني بالبروتين، منخفض الكربوهيدرات، مثالي بعد التمرين", en: "High protein, low carb, perfect post-workout" } },
    { name: { ar: "سمك السلمون المشوي", en: "Grilled Salmon" }, cal: 380, protein: 45, time: "15 دقيقة", desc: { ar: "أوميغا 3 عالي، ممتاز لبناء العضلات", en: "High Omega-3, excellent for muscle building" } },
    { name: { ar: "حمص البروتين العالي", en: "High-Protein Hummus" }, cal: 280, protein: 18, time: "10 دقيقة", desc: { ar: "وجبة خفيفة ممتازة بعد الجيم", en: "Excellent gym snack packed with plant protein" } },
    { name: { ar: "سلطة التونة العربية", en: "Arabic Tuna Salad" }, cal: 260, protein: 38, time: "10 دقيقة", desc: { ar: "خفيفة وسريعة وغنية بالبروتين", en: "Light, quick, and protein-packed" } },
    { name: { ar: "بيض بالسبانخ والجبنة", en: "Eggs with Spinach & Cheese" }, cal: 340, protein: 28, time: "10 دقيقة", desc: { ar: "إفطار قوي لبداية يوم نشيط", en: "Power breakfast for an active day" } },
    { name: { ar: "كفتة الدجاج المشوية", en: "Grilled Chicken Kofta" }, cal: 420, protein: 48, time: "25 دقيقة", desc: { ar: "بروتين عالي الجودة مع نكهة عربية أصيلة", en: "High-quality protein with authentic Arabic flavor" } },
    { name: { ar: "عدس برتقالي بالكركم", en: "Orange Lentil with Turmeric" }, cal: 290, protein: 22, time: "20 دقيقة", desc: { ar: "بروتين نباتي ومضاد للالتهابات", en: "Plant protein and anti-inflammatory" } },
    { name: { ar: "شيش طاووق بالزبادي", en: "Shish Tawook with Yogurt" }, cal: 450, protein: 55, time: "30 دقيقة", desc: { ar: "وجبة جيم مثالية غنية بالبروتين", en: "Perfect gym meal, protein-rich" } },
];

const MealPlanning = () => {
    const navigate = useNavigate();
    const { t, lang } = useLanguage();
    const { isPro, loading: planLoading } = usePlan();
    const [activeTab, setActiveTab] = useState<Tab>("today");
    const [aiSuggestion, setAiSuggestion] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    const generatePlan = async () => {
        setAiLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase.functions.invoke("coach", {
                body: {
                    message: lang === "ar"
                        ? "بناءً على ملفي الشخصي وأهدافي الغذائية، اقترح لي خطة وجبات مفصلة ليوم واحد (إفطار، غداء، عشاء، وجبة خفيفة) من المطبخ العربي مع السعرات والبروتين لكل وجبة."
                        : "Based on my profile and nutrition goals, suggest a detailed 1-day meal plan (breakfast, lunch, dinner, snack) from Arabic cuisine with calories and protein for each meal.",
                    userId: user?.id,
                    conversationHistory: [],
                },
            });
            if (error) throw error;
            setAiSuggestion(data?.reply ?? "");
        } catch {
            toast.error(t("coach_error"));
        } finally {
            setAiLoading(false);
        }
    };

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: "today", label: t("meal_plan_tab_today"), icon: Sparkles },
        { id: "week", label: t("meal_plan_tab_week"), icon: Calendar },
        { id: "recipes", label: t("meal_plan_tab_recipes"), icon: BookOpen },
    ];

    // Paywall for non-Pro users
    if (!planLoading && !isPro) {
        return (
            <div className="min-h-screen" style={{ background: "#F8F8FC" }}>
                <div className="p-4 text-white flex items-center gap-3" style={{ background: "#6C63FF" }}>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate("/dashboard")}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-lg font-bold">{t("meal_plan_title")}</h1>
                </div>
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 pt-16">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #1A1A2E, #6C63FF)" }}>
                        <Lock className="w-12 h-12 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black mb-2" style={{ color: "#6C63FF" }}>{t("upgrade_title")}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{t("meal_plan_locked")}</p>
                    </div>
                    <Card className="w-full max-w-xs p-5 text-left space-y-3 premium-card">
                        {["🍽️ خطة وجبات أسبوعية", "🤖 اقتراحات AI مخصصة", "📖 وصفات عربية صحية", "💪 تغذية مبنية على أهدافك"].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <span className="text-xl">{item.slice(0, 2)}</span>
                                <span className="text-sm font-medium" style={{ color: "#6C63FF" }}>{item.slice(3)}</span>
                            </div>
                        ))}
                    </Card>
                    <Button className="w-full max-w-xs py-6 rounded-2xl font-bold text-lg btn-glow" style={{ background: "#6C63FF" }} onClick={() => navigate("/pricing")}>
                        <Zap className="w-5 h-5 mr-2" />{t("upgrade_btn")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24" style={{ background: "#F8F8FC" }}>
            {/* Header */}
            <div className="p-4 text-white flex items-center gap-3" style={{ background: "linear-gradient(135deg, #6C63FF, #FF6584)" }}>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate("/dashboard")}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold">{t("meal_plan_title")}</h1>
                    <p className="text-xs opacity-80">Pro Plan</p>
                </div>
                <Badge className="bg-yellow-400/20 text-yellow-300 border-0 text-xs">⭐ Pro</Badge>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-3 sticky top-0 z-10" style={{ background: "#F8F8FC", borderBottom: "1px solid rgba(27, 67, 50, 0.1)" }}>
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl text-xs font-semibold transition-all"
                        style={{
                            background: activeTab === id ? "#6C63FF" : "transparent",
                            color: activeTab === id ? "white" : "#6B7280",
                        }}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            <div className="p-4 space-y-4">
                {/* TODAY TAB */}
                {activeTab === "today" && (
                    <div className="space-y-4">
                        <Card className="p-5 premium-card">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-5 h-5" style={{ color: "#6C63FF" }} />
                                <h2 className="font-bold" style={{ color: "#1A1A2E" }}>{t("meal_plan_ai_title")}</h2>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                {lang === "ar"
                                    ? "سيقوم الذكاء الاصطناعي بتوليد خطة وجبات مخصصة لك بناءً على ملفك الشخصي وأهدافك."
                                    : "The AI will generate a personalized meal plan based on your profile and goals."}
                            </p>
                            {aiSuggestion ? (
                                <div className="bg-white/50 rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#6C63FF" }}>
                                    {aiSuggestion}
                                </div>
                            ) : null}
                            <Button
                                className="w-full mt-4 rounded-2xl py-5 btn-glow font-bold"
                                style={{ background: "#6C63FF" }}
                                onClick={generatePlan}
                                disabled={aiLoading}
                            >
                                {aiLoading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin mr-2" />{t("meal_plan_ai_loading")}</>
                                ) : (
                                    <><Sparkles className="w-5 h-5 mr-2" />{t("meal_plan_ai_btn")}</>
                                )}
                            </Button>
                        </Card>
                    </div>
                )}

                {/* WEEK TAB */}
                {activeTab === "week" && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4" style={{ color: "#6C63FF" }} />
                            <h2 className="font-bold text-sm" style={{ color: "#6C63FF" }}>{t("meal_plan_week_title")}</h2>
                        </div>
                        {WEEKLY_PLAN.map((day, i) => (
                            <Card key={i} className="p-4 premium-card">
                                <h3 className="font-bold mb-3 pb-2 border-b" style={{ color: "#6C63FF", borderColor: "rgba(27, 67, 50, 0.1)" }}>
                                    {lang === "ar" ? day.day.ar : day.day.en}
                                </h3>
                                <div className="space-y-2">
                                    {(["breakfast", "lunch", "dinner"] as const).map((mealKey) => {
                                        const meal = day.meals[mealKey];
                                        const mealLabel = mealKey === "breakfast" ? (lang === "ar" ? "الإفطار" : "Breakfast")
                                            : mealKey === "lunch" ? (lang === "ar" ? "الغداء" : "Lunch")
                                                : (lang === "ar" ? "العشاء" : "Dinner");
                                        return (
                                            <div key={mealKey} className="flex items-start justify-between gap-2 p-2.5 rounded-xl" style={{ background: "#F8F8FC" }}>
                                                <div className="flex-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{mealLabel}</span>
                                                    <p className="text-sm font-medium mt-0.5" style={{ color: "#6C63FF" }}>
                                                        {lang === "ar" ? meal.ar : meal.en}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-bold" style={{ color: "#1A1A2E" }}>{meal.cal} {t("meal_plan_recipe_cal")}</p>
                                                    <p className="text-[10px] text-muted-foreground">{meal.protein}g {t("meal_plan_recipe_protein")}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* RECIPES TAB */}
                {activeTab === "recipes" && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="w-4 h-4" style={{ color: "#6C63FF" }} />
                            <h2 className="font-bold text-sm" style={{ color: "#6C63FF" }}>
                                {lang === "ar" ? "وصفات صحية عالية البروتين" : "High-Protein Healthy Recipes"}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {RECIPES.map((recipe, i) => (
                                <Card key={i} className="p-4 premium-card">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-base mb-1" style={{ color: "#6C63FF" }}>
                                                {lang === "ar" ? recipe.name.ar : recipe.name.en}
                                            </h3>
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {lang === "ar" ? recipe.desc.ar : recipe.desc.en}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1.5">⏱ {recipe.time}</p>
                                        </div>
                                        <div className="text-right ml-4 shrink-0">
                                            <p className="text-xl font-black" style={{ color: "#1A1A2E" }}>{recipe.cal}</p>
                                            <p className="text-[10px] text-muted-foreground">{t("meal_plan_recipe_cal")}</p>
                                            <p className="text-sm font-bold mt-1" style={{ color: "#6C63FF" }}>{recipe.protein}g</p>
                                            <p className="text-[10px] text-muted-foreground">{t("meal_plan_recipe_protein")}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MealPlanning;
