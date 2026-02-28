import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, User, LogOut, Info,
  Dumbbell, Target, Activity, Loader2, Edit2, Headphones, Mail, MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { usePlan } from "@/hooks/usePlan";

interface ProfileData {
  full_name: string | null; height_cm: number | null; weight_kg: number | null;
  age: number | null; gender: string | null; activity_level: string | null;
  health_goal: string | null; dietary_preferences: string[] | null; allergies: string[] | null;
}
interface Goals { calories_target: number; protein_g_target: number; carbs_g_target: number; fat_g_target: number; }

const Profile = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { isPro, plan } = usePlan();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [weeklyMeals, setWeeklyMeals] = useState(0);
  const [totalCaloriesTracked, setTotalCaloriesTracked] = useState(0);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      setEmail(user.email ?? "");
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const [profileRes, goalsRes, statsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("daily_goals").select("*").eq("user_id", user.id).single(),
        supabase.from("meal_logs").select("calories").eq("user_id", user.id).gte("logged_at", weekAgo.toISOString()),
      ]);
      setProfile(profileRes.data ?? null);
      setGoals(goalsRes.data ?? null);
      const meals = statsRes.data ?? [];
      setWeeklyMeals(meals.length);
      setTotalCaloriesTracked(meals.reduce((s, m) => s + (m.calories || 0), 0));
    } catch (e) { console.error("Profile load error", e); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); toast.success(t("prof_logout_ok")); navigate("/"); };

  const bmi = profile?.weight_kg && profile?.height_cm ? (profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1) : null;
  const bmiCategory = bmi
    ? Number(bmi) < 18.5 ? { label: t("prof_bmi_under"), color: "#3B82F6" }
      : Number(bmi) < 25 ? { label: t("prof_bmi_healthy"), color: "#1B4332" }
        : Number(bmi) < 30 ? { label: t("prof_bmi_over"), color: "#D4AF37" }
          : { label: t("prof_bmi_obese"), color: "#EF4444" }
    : null;

  const goalLabels: Record<string, { label: string; color: string }> = {
    lose_weight: { label: t("prof_goal_fat_loss"), color: "bg-red-50 text-red-600" },
    gain_muscle: { label: t("prof_goal_muscle"), color: "bg-blue-50 text-blue-600" },
    maintain_weight: { label: t("prof_goal_maintain"), color: "bg-green-50 text-green-700" },
  };
  const activityLabels: Record<string, string> = {
    sedentary: t("prof_act_sedentary"), light: t("prof_act_light"), moderate: t("prof_act_moderate"),
    active: t("prof_act_active"), very_active: t("prof_act_very_active"),
  };
  const goal = profile?.health_goal ? goalLabels[profile.health_goal] : null;

  return (
    <div className="min-h-screen pb-8" style={{ background: "#F9F9F2" }}>
      <div className="p-4 text-white flex items-center gap-3" style={{ background: "linear-gradient(135deg, #1B4332, #2D6A4F)" }}>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">{t("prof_title")}</h1>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: "#1B4332" }} /></div>
        ) : (
          <>
            {/* Avatar */}
            <Card className="p-6 text-center premium-card">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #1B4332, #2D6A4F)" }}>
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-xl font-bold" style={{ color: "#1B4332" }}>{profile?.full_name ?? t("prof_user")}</h2>
              <p className="text-sm text-muted-foreground mt-1">{email}</p>
              {goal && (
                <Badge className={`mt-3 ${goal.color} border-0`}>
                  <Dumbbell className="w-3 h-3 mr-1" />{goal.label}
                </Badge>
              )}
            </Card>

            {/* Biometrics */}
            <Card className="p-5 premium-card">
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#1B4332" }}>
                <Activity className="w-4 h-4" style={{ color: "#D4AF37" }} />{t("prof_biometrics")}
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: t("prof_weight"), value: profile?.weight_kg ? `${profile.weight_kg}kg` : "—" },
                  { label: t("prof_height"), value: profile?.height_cm ? `${profile.height_cm}cm` : "—" },
                  { label: t("prof_age"), value: profile?.age ? `${profile.age}` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-2xl" style={{ background: "#F9F9F2" }}>
                    <div className="text-2xl font-bold" style={{ color: "#1B4332" }}>{value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              {bmi && (
                <div className="mt-4 p-3 rounded-2xl flex items-center justify-between" style={{ background: "#F9F9F2" }}>
                  <p className="text-sm font-medium">{t("prof_bmi")}</p>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: bmiCategory?.color }}>{bmi}</p>
                    <p className="text-xs" style={{ color: bmiCategory?.color }}>{bmiCategory?.label}</p>
                  </div>
                </div>
              )}
              {profile?.activity_level && (
                <div className="mt-3 p-3 rounded-2xl flex items-center justify-between" style={{ background: "#F9F9F2" }}>
                  <p className="text-sm font-medium">{t("prof_activity")}</p>
                  <Badge variant="secondary">{activityLabels[profile.activity_level] ?? profile.activity_level}</Badge>
                </div>
              )}
            </Card>

            {/* Targets */}
            {goals && (
              <Card className="p-5 premium-card">
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#1B4332" }}>
                  <Target className="w-4 h-4" style={{ color: "#D4AF37" }} />{t("prof_daily_targets")}
                </h3>
                <div className="space-y-3">
                  {[
                    { label: t("prog_calories"), value: goals.calories_target, unit: "kcal" },
                    { label: t("prog_protein"), value: goals.protein_g_target, unit: "g" },
                    { label: t("prog_carbs"), value: goals.carbs_g_target, unit: "g" },
                    { label: t("prog_fat"), value: goals.fat_g_target, unit: "g" },
                  ].map(({ label, value, unit }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="font-semibold text-sm" style={{ color: "#1B4332" }}>{Math.round(value)} {unit}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Weekly */}
            <Card className="p-5 premium-card">
              <h3 className="font-bold mb-4" style={{ color: "#1B4332" }}>{t("prof_this_week")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl text-center" style={{ background: "#F9F9F2" }}>
                  <p className="text-2xl font-bold" style={{ color: "#1B4332" }}>{weeklyMeals}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("prof_meals_logged")}</p>
                </div>
                <div className="p-3 rounded-2xl text-center" style={{ background: "#F9F9F2" }}>
                  <p className="text-2xl font-bold" style={{ color: "#D4AF37" }}>{Math.round(totalCaloriesTracked / 1000 * 10) / 10}k</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("prof_kcal_tracked")}</p>
                </div>
              </div>
            </Card>

            {/* Support */}
            <Card className="p-5 premium-card" >
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: "#1B4332" }}>
                <Headphones className="w-4 h-4" style={{ color: "#D4AF37" }} />{t("support_title")}
              </h3>
              <div className="mb-3 p-3 rounded-2xl" style={{ background: "#F9F9F2" }}>
                {isPro ? (
                  <Badge className="bg-yellow-50 text-yellow-700 border-0 text-xs">{t("support_priority")}</Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("support_free")}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-2xl gap-2"
                  onClick={() => window.open("mailto:support@calorx.app?subject=Support Request", "_blank")}
                >
                  <Mail className="w-4 h-4" />{t("support_email_btn")}
                </Button>
                <Button
                  className="flex-1 rounded-2xl gap-2 text-white"
                  style={{ background: "#25D366" }}
                  onClick={() => window.open("https://wa.me/+1234567890?text=Hello%2C%20I%20need%20support%20with%20Calor%20X", "_blank")}
                >
                  <MessageCircle className="w-4 h-4" />WhatsApp
                </Button>
              </div>
            </Card>

            {/* Actions */}
            <Card className="divide-y premium-card overflow-hidden" style={{ borderColor: "rgba(27, 67, 50, 0.08)" }}>
              <button className="w-full p-4 flex items-center gap-3 hover:bg-brand-green/5 transition-colors text-left" onClick={() => navigate("/profile-setup")}>
                <Edit2 className="w-5 h-5" style={{ color: "#1B4332" }} /><span>{t("prof_edit")}</span>
              </button>
              <button className="w-full p-4 flex items-center gap-3 hover:bg-brand-green/5 transition-colors text-left" onClick={() => navigate("/privacy")}>
                <Info className="w-5 h-5" style={{ color: "#D4AF37" }} /><span>{t("prof_privacy")}</span>
              </button>
              <button className="w-full p-4 flex items-center gap-3 hover:bg-brand-green/5 transition-colors text-left" onClick={() => navigate("/terms")}>
                <Info className="w-5 h-5" style={{ color: "#6B7280" }} /><span>{t("prof_terms")}</span>
              </button>
              <button className="w-full p-4 flex items-center gap-3 hover:bg-red-50 transition-colors text-red-500 text-left" onClick={handleLogout}>
                <LogOut className="w-5 h-5" /><span>{t("prof_logout")}</span>
              </button>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
