import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Camera, MessageCircle, TrendingUp, Flame, Zap, Droplets, Loader2, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { usePlan } from "@/hooks/usePlan";

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
  onboarding_completed?: boolean;
}

const AppName = () => (
  <span className="text-2xl font-black tracking-wide text-[#1A1A2E]">
    Calor <span className="text-[#6C63FF]">X</span>
  </span>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { isPro } = usePlan();
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
        supabase.from("profiles").select("full_name, health_goal, onboarding_completed").eq("id", user.id).single(),
        supabase.from("daily_goals").select("*").eq("user_id", user.id).single(),
        supabase.from("daily_nutrition").select("*").eq("user_id", user.id).eq("date", today).single(),
        supabase.from("meal_logs").select("id, dish_name, dish_name_ar, calories, protein_g, logged_at")
          .eq("user_id", user.id).gte("logged_at", `${today}T00:00:00`).order("logged_at", { ascending: false }).limit(5),
      ]);
      if (!profileRes.data || (!profileRes.data.onboarding_completed && !profileRes.data.health_goal)) {
        navigate("/profile-setup", { replace: true });
        return;
      }

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
    { icon: Droplets, label: t("dash_protein"), value: protein, target: proteinTarget, unit: "g", color: "#43E97B" }, // Mint Green for Protein
    { icon: Zap, label: t("dash_carbs"), value: carbs, target: carbsTarget, unit: "g", color: "#FF6584" }, // Coral Pink for Carbs
    { icon: Flame, label: t("dash_fat"), value: fat, target: fatTarget, unit: "g", color: "#6C63FF" }, // Purple for Fat
  ];

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F8F8FC" }}>

      {/* Top Navigation Bar */}
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 z-40 bg-[#F8F8FC]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#6C63FF] shadow-lg shadow-[#6C63FF]/30 flex items-center justify-center">
            <span className="text-white font-black text-xs">C<span className="text-white/80">X</span></span>
          </div>
          <div>
            <h1 className="text-lg font-black text-[#1A1A2E] leading-tight">Calor X</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isPro && (
            <Badge className="bg-white text-[#6C63FF] border-0 font-bold px-3 py-1 text-xs rounded-full shadow-sm">
              💎 PRO
            </Badge>
          )}
          <div className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center border border-gray-100 p-1 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate("/profile")}>
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${profile?.full_name || 'User'}&backgroundColor=f0efff`} alt="avatar" className="w-full h-full rounded-full" />
          </div>
        </div>
      </div>

      <div className="px-5 pt-2 pb-6 space-y-5 relative z-20">

        {/* 3D Greeting Card */}
        <div className="relative bg-gradient-to-br from-[#6C63FF] to-[#8fd3f4] rounded-[32px] p-6 shadow-elevated overflow-hidden group">
          {/* Decorative 3D elements */}
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white opacity-20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1 pr-4">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest mb-3 shadow-sm border border-white/10">
                {t("dash_daily_streak_badge", { n: 3 })}
              </span>
              <h1 className="text-2xl font-black text-white leading-tight mb-2">
                {t("dash_welcome")},<br />{profile?.full_name || "Guest"}!
              </h1>
              <p className="text-xs font-medium text-white/90 max-w-[200px] leading-relaxed">
                {t("dash_ready_crush")}
              </p>
            </div>

            {/* 3D Emoji Art */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full shadow-inner border border-white/30"></div>
              <span className="text-6xl drop-shadow-2xl -translate-y-2 group-hover:-translate-y-4 transition-transform duration-500 cursor-pointer">
                🥗
              </span>
              <div className="absolute -bottom-1 w-12 h-3 bg-black/20 rounded-full blur-md group-hover:w-10 group-hover:opacity-10 transition-all duration-500"></div>
            </div>
          </div>
        </div>

        {/* Floating Calorie Summary Card */}
        <Card className="p-6 bg-white rounded-[32px] shadow-elevated border-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-[#1A1A2E]">{t("dash_today_summary")}</h2>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-[#6C63FF]" />}
            {!loading && profile?.health_goal && (
              <Badge className="bg-[#F0EFFF] text-[#6C63FF] border-0 text-[10px] font-black px-3 py-1 uppercase tracking-wide">
                {goalBadges[profile.health_goal] ?? profile.health_goal}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            {/* Minimal Circular Progress */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#F8F8FC" strokeWidth="12" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="url(#gradient)" strokeWidth="12"
                  strokeDasharray="276" strokeDashoffset={276 - (276 * pct(cals, calTarget)) / 100}
                  strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6C63FF" />
                    <stop offset="100%" stopColor="#43E97B" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-black tracking-tight text-[#1A1A2E]">{Math.round(cals)}</p>
                <p className="text-[9px] text-[#8888A0] mt-0.5 font-bold tracking-widest uppercase">{t("dash_kcal")}</p>
              </div>
            </div>

            <div className="flex-1 pl-6 space-y-4">
              {macros.map(({ label, value, target, unit, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-[#1A1A2E] bg-gray-50 px-2 py-0.5 rounded-md">{label}</span>
                    <span style={{ color }}>{Math.round(value)}<span className="text-[10px] opacity-70">{unit}</span> / {target}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F8F8FC" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct(value, target)}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Captivating Quick Actions (Vibrant cards) */}
        <div>
          <h2 className="text-lg font-black text-[#1A1A2E] mb-3 ml-2">{t("dash_quick_actions")}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card
              className="relative overflow-hidden p-5 rounded-[28px] border-0 shadow-soft cursor-pointer hover:scale-[1.02] transition-transform group"
              style={{ background: "linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)" }}
              onClick={() => navigate("/ai-coach")}
            >
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-white opacity-20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="flex justify-between items-start mb-8">
                <MessageCircle className="w-8 h-8 text-white" />
                {!isPro && <Badge className="bg-white/30 text-white border-0 text-[10px] font-black uppercase">PRO</Badge>}
              </div>
              <h3 className="font-black text-lg text-white leading-tight">{t("dash_ai_coach")}</h3>
              <p className="text-xs text-white/80 font-medium mt-1">{t("dash_smart_advice")}</p>
            </Card>

            <Card
              className="relative overflow-hidden p-5 rounded-[28px] border-0 shadow-soft cursor-pointer hover:scale-[1.02] transition-transform group"
              style={{ background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" }}
              onClick={() => navigate("/progress")}
            >
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-white opacity-20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
              <TrendingUp className="w-8 h-8 text-white mb-8" />
              <h3 className="font-black text-lg text-white leading-tight">{t("dash_progress")}</h3>
              <p className="text-xs text-white/80 font-medium mt-1">{t("dash_view_trends")}</p>
            </Card>

            <Card
              className="relative overflow-hidden p-5 rounded-[28px] border-0 shadow-soft cursor-pointer hover:scale-[1.02] transition-transform group"
              style={{ background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)" }}
              onClick={() => navigate("/meal-planning")}
            >
              <div className="flex justify-between items-start mb-8">
                <ChefHat className="w-8 h-8 text-[#1A1A2E] opacity-70" />
                {!isPro && <Badge className="bg-black/10 text-[#1A1A2E] border-0 text-[10px] font-black uppercase">PRO</Badge>}
              </div>
              <h3 className="font-black text-lg text-[#1A1A2E] leading-tight">{t("meal_plan_title")}</h3>
              <p className="text-xs text-[#1A1A2E]/60 font-medium mt-1">{t("dash_daily_recipes")}</p>
            </Card>

            <Card
              className="relative overflow-hidden p-5 rounded-[28px] border-0 shadow-soft cursor-pointer hover:scale-[1.02] transition-transform group"
              style={{ background: "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)" }}
              onClick={() => navigate("/micronutrients")}
            >
              <div className="flex justify-between items-start mb-8">
                <Zap className="w-8 h-8 text-white" />
                {!isPro && <Badge className="bg-white/30 text-white border-0 text-[10px] font-black uppercase">PRO</Badge>}
              </div>
              <h3 className="font-black text-lg text-white leading-tight">{t("micro_title")}</h3>
              <p className="text-xs text-white/80 font-medium mt-1">{t("dash_vitamins")}</p>
            </Card>
          </div>
        </div>

        {/* Recent Meals styled vibrantly */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-3 mx-2">
            <h2 className="text-lg font-black text-[#1A1A2E]">{t("dash_recent_meals")}</h2>
          </div>

          <Card className="p-1 bg-white rounded-[32px] shadow-sm border-0">
            {loading ? (
              <div className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#6C63FF]" /></div>
            ) : recentMeals.length === 0 ? (
              <div className="py-8 text-center text-[#8888A0]">
                <div className="w-16 h-16 rounded-full bg-[#F0EFFF] flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-6 h-6 text-[#6C63FF]" />
                </div>
                <p className="text-sm font-bold text-[#1A1A2E] mb-1">{t("dash_no_meals")}</p>
                <p className="text-xs">{t("dash_scan_first")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1 p-2 border-0">
                {recentMeals.map((meal) => (
                  <div key={meal.id} className="flex items-center p-3 rounded-[24px] hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="w-14 h-14 rounded-2xl bg-[#F0EFFF] flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                      <span className="text-2xl">🍲</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-[#1A1A2E] truncate">
                        {lang === "ar" ? (meal.dish_name_ar || meal.dish_name) : meal.dish_name}
                      </p>
                      <p className="text-xs font-medium text-[#8888A0] mt-0.5">
                        {formatTime(meal.logged_at)} • {Math.round(meal.protein_g)} {t("dash_protein_g")}
                      </p>
                    </div>
                    <div className="text-right ml-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <p className="font-black text-sm text-[#6C63FF]">{Math.round(meal.calories)}</p>
                      <p className="text-[9px] font-bold text-[#8888A0] uppercase">{t("dash_kcal")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Floating Generate Button matching the reference image */}
      <div className="fixed bottom-24 left-0 right-0 px-6 z-40 pointer-events-none">
        <Button
          size="lg"
          className="w-full py-7 rounded-full text-lg font-black shadow-elevated text-white transition-all hover:scale-[1.02] active:scale-95 pointer-events-auto"
          style={{ background: "linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)" }}
          onClick={() => navigate("/scan")}
        >
          <Camera className="w-5 h-5 mr-2" />
          {t("dash_generate_scan")}
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
