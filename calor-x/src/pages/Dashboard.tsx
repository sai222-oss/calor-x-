import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Camera, MessageCircle, TrendingUp, Flame, Zap, Droplets, Loader2, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

interface DailyNutrition {
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  meals_count: number;
}
interface DailyGoals {
  calories_target: number;
  protein_g_target: number;
  carbs_g_target: number;
  fat_g_target: number;
}
interface MealLog {
  id: string;
  dish_name: string;
  dish_name_ar: string;
  calories: number;
  protein_g: number;
  logged_at: string;
}
interface ProfileData {
  full_name: string;
  health_goal: string;
}

const AppName = () => (
  <span className="text-2xl font-black tracking-wide text-white">
    Calor <span className="gold-text">X</span>
  </span>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [nutrition, setNutrition] = useState<DailyNutrition | null>(null);
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  const [recentMeals, setRecentMeals] = useState<MealLog[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const today = new Date().toISOString().split("T")[0];
      const [profileRes, goalsRes, nutritionRes, mealsRes] = await Promise.all([
        supabase.from("profiles").select("full_name, health_goal").eq("id", user.id).single(),
        supabase.from("daily_goals").select("*").eq("user_id", user.id).single(),
        supabase.from("daily_nutrition").select("*").eq("user_id", user.id).eq("date", today).single(),
        supabase.from("meal_logs").select("id, dish_name, dish_name_ar, calories, protein_g, logged_at")
          .eq("user_id", user.id).gte("logged_at", `${today}T00:00:00`).order("logged_at", { ascending: false }).limit(5),
      ]);
      setProfile(profileRes.data ?? null);
      setGoals(goalsRes.data ?? null);
      setNutrition(nutritionRes.data ?? null);
      setRecentMeals(mealsRes.data ?? []);
    } catch (e) { console.error("Dashboard load error", e); }
    finally { setLoading(false); }
  };

  const pct = (val: number, target: number) =>
    target > 0 ? Math.min(Math.round((val / target) * 100), 100) : 0;

  const goalBadges: Record<string, string> = {
    lose_weight: t("goal_lose_weight"), gain_muscle: t("goal_gain_muscle"), maintain_weight: t("goal_maintain"),
  };
  const cals = nutrition?.total_calories ?? 0;
  const protein = nutrition?.total_protein_g ?? 0;
  const carbs = nutrition?.total_carbs_g ?? 0;
  const fat = nutrition?.total_fat_g ?? 0;
  const calTarget = goals?.calories_target ?? 2000;
  const proteinTarget = goals?.protein_g_target ?? 150;
  const carbsTarget = goals?.carbs_g_target ?? 200;
  const fatTarget = goals?.fat_g_target ?? 65;
  const remainingCals = Math.max(0, calTarget - cals);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(lang === "ar" ? "ar-SA" : "en-US", { hour: "2-digit", minute: "2-digit" });

  const macros = [
    { icon: Zap, label: t("dash_protein"), value: protein, target: proteinTarget, unit: "g", color: "#1B4332" },
    { icon: Flame, label: t("dash_carbs"), value: carbs, target: carbsTarget, unit: "g", color: "#B8860B" }, // Darker gold for better contrast
    { icon: Droplets, label: t("dash_fat"), value: fat, target: fatTarget, unit: "g", color: "#374151" }, // Darker gray
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8F8F8" }}>
      {/* Light Header */}
      <div className="p-6 pb-6 bg-white border-b border-gray-100 shadow-sm" style={{ borderRadius: "0 0 24px 24px" }}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-black tracking-wide" style={{ color: "#1B4332" }}>
              Calor <span className="text-brand-gold">X</span>
            </span>
            <p className="text-sm font-medium mt-1 text-muted-foreground">
              {profile?.full_name ? t("dash_greeting", { name: profile.full_name }) : t("dash_welcome")}
            </p>
          </div>
          {profile?.health_goal && (
            <Badge className="bg-brand-green/10 text-brand-green border-0 text-xs font-bold px-3 py-1">
              {goalBadges[profile.health_goal] ?? profile.health_goal}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 mt-2">
        {/* Calorie Summary Card */}
        <Card className="p-6 premium-card border-0 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-brand-green">{t("dash_today_summary")}</h2>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-brand-green/50" />}
          </div>

          <div className="text-center">
            {/* Circular Progress */}
            <div className="relative w-48 h-48 mx-auto my-4 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#E8F5E9" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1B4332" strokeWidth="8"
                  strokeDasharray="264" strokeDashoffset={264 - (264 * pct(cals, calTarget)) / 100}
                  strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-black tracking-tight" style={{ color: "#1B4332" }}>{Math.round(cals)}</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-bold tracking-widest uppercase">{t("dash_kcal") ?? "KCAL"}</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 font-medium">
              {t("dash_of_target", { n: calTarget })} &nbsp;·&nbsp;{" "}
              <span className="font-bold text-brand-gold">
                {t("dash_remaining", { n: remainingCals })}
              </span>
            </p>
          </div>

          {/* Macro Grid */}
          <div className="grid grid-cols-3 gap-3">
            {macros.map(({ icon: Icon, label, value, target, unit, color }) => (
              <div key={label} className="text-center p-4 rounded-2xl border border-gray-100 shadow-sm" style={{ background: "#ffffff" }}>
                <Icon className="w-5 h-5 mx-auto mb-2" style={{ color }} />
                <p className="text-xl font-black" style={{ color }}>{Math.round(value)}<span className="text-xs ml-0.5">{unit}</span></p>
                <p className="text-xs font-bold mt-1" style={{ color }}>{label}</p>
                <p className="text-[11px] font-medium text-gray-500 mt-0.5">/ {target}{unit}</p>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(27, 67, 50, 0.05)" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct(value, target)}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>

          {(nutrition?.meals_count ?? 0) > 0 && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              {t("dash_meals_logged", { n: nutrition!.meals_count })}
            </p>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="p-5 text-center premium-card cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={() => navigate("/progress")}
          >
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(27, 67, 50, 0.08)" }}>
              <TrendingUp className="w-6 h-6" style={{ color: "#1B4332" }} />
            </div>
            <h3 className="font-bold text-sm" style={{ color: "#1B4332" }}>{t("dash_progress")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("dash_view_trends")}</p>
          </Card>
          <Card
            className="p-5 text-center premium-card cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={() => navigate("/ai-coach")}
          >
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(212, 175, 55, 0.1)" }}>
              <MessageCircle className="w-6 h-6" style={{ color: "#D4AF37" }} />
            </div>
            <h3 className="font-bold text-sm" style={{ color: "#1B4332" }}>{t("dash_ai_coach")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("dash_personal_tips")}</p>
          </Card>
          <Card
            className="p-5 text-center premium-card cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={() => navigate("/meal-planning")}
          >
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(27, 67, 50, 0.08)" }}>
              <ChefHat className="w-6 h-6" style={{ color: "#1B4332" }} />
            </div>
            <h3 className="font-bold text-sm" style={{ color: "#1B4332" }}>{t("meal_plan_title")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("meal_plan_tab_recipes")} · Pro</p>
          </Card>
          <Card
            className="p-5 text-center premium-card cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={() => navigate("/micronutrients")}
          >
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(212, 175, 55, 0.08)" }}>
              <Zap className="w-6 h-6" style={{ color: "#D4AF37" }} />
            </div>
            <h3 className="font-bold text-sm" style={{ color: "#1B4332" }}>{t("micro_title")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("micro_vitamins")} &amp; {t("micro_minerals")}</p>
          </Card>
        </div>

        {/* Recent Meals */}
        <Card className="p-5 premium-card">
          <h2 className="text-base font-bold mb-3" style={{ color: "#1B4332" }}>{t("dash_recent_meals")}</h2>
          {loading ? (
            <div className="py-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" /></div>
          ) : recentMeals.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{t("dash_no_meals")}</p>
              <p className="text-xs mt-1">{t("dash_scan_first")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentMeals.map((meal) => (
                <div key={meal.id} className="flex items-center justify-between p-3 rounded-2xl" style={{ background: "#F9F9F2" }}>
                  <div>
                    <p className="font-medium text-sm">{lang === "ar" ? (meal.dish_name_ar || meal.dish_name) : meal.dish_name}</p>
                    {lang === "ar" && meal.dish_name_ar && (
                      <p className="text-xs text-muted-foreground">{meal.dish_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: "#1B4332" }}>{Math.round(meal.calories)} {t("dash_kcal")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("dash_protein_short")}: {Math.round(meal.protein_g)}g · {formatTime(meal.logged_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Floating Camera Button */}
      <div className="fixed bottom-24 right-4">
        <Button
          size="lg"
          className="rounded-full w-16 h-16 shadow-xl btn-glow"
          style={{ background: "#1B4332" }}
          onClick={() => navigate("/scan")}
          aria-label={t("nav_scan")}
        >
          <Camera className="w-8 h-8 text-white" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
