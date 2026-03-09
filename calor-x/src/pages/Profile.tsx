import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, User, LogOut, Info, Camera,
  Dumbbell, Target, Activity, Loader2, Edit2, Headphones, Mail, MessageCircle, Star, Zap, ChevronRight, BadgeCheck
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
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [weeklyMeals, setWeeklyMeals] = useState(0);
  const [totalCaloriesTracked, setTotalCaloriesTracked] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  useEffect(() => {
    // Setup Lemon Squeezy
    // @ts-ignore
    window.lemonSqueezyActive = true;
    const script = document.createElement("script");
    script.src = "https://app.lemonsqueezy.com/js/lemon.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.createLemonSqueezy) {
        // @ts-ignore
        window.createLemonSqueezy();
        // @ts-ignore
        if (window.LemonSqueezy) {
          // @ts-ignore
          window.LemonSqueezy.Setup({ eventHandler: (e: any) => console.log(e) });
        }
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
      // @ts-ignore
      window.lemonSqueezyActive = false;
    };
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      setEmail(user.email ?? "");
      setAvatarUrl(user.user_metadata?.avatar_url || null);
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

  const handleUpgrade = () => {
    navigate("/pricing");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("food-images").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("food-images").getPublicUrl(filePath);
      const url = publicUrlData.publicUrl;

      await supabase.auth.updateUser({ data: { avatar_url: url } });
      setAvatarUrl(url);
      toast.success(t("res_save_success") || "Image added successfully!");
    } catch (err) {
      console.error(err);
      toast.error(t("res_save_error") || "Error uploading image");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); toast.success(t("prof_logout_ok")); navigate("/"); };

  const bmi = profile?.weight_kg && profile?.height_cm ? (profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1) : null;
  const bmiCategory = bmi
    ? Number(bmi) < 18.5 ? { label: t("prof_bmi_under"), color: "#3B82F6" }
      : Number(bmi) < 25 ? { label: t("prof_bmi_healthy"), color: "#6C63FF" }
        : Number(bmi) < 30 ? { label: t("prof_bmi_over"), color: "#6C63FF" }
          : { label: t("prof_bmi_obese"), color: "#EF4444" }
    : null;

  const goalLabels: Record<string, { label: string; color: string }> = {
    lose_weight: { label: t("prof_goal_fat_loss"), color: "bg-[#F8F8FC] text-[#6C63FF]" },
    gain_muscle: { label: t("prof_goal_muscle"), color: "bg-[#F8F8FC] text-[#1A1A2E]" },
    maintain_weight: { label: t("prof_goal_maintain"), color: "bg-[#F2F2F2] text-[#6B7280]" },
  };
  const activityLabels: Record<string, string> = {
    sedentary: t("prof_act_sedentary"), light: t("prof_act_light"), moderate: t("prof_act_moderate"),
    active: t("prof_act_active"), very_active: t("prof_act_very_active"),
  };
  const goal = profile?.health_goal ? goalLabels[profile.health_goal] : null;

  return (
    <div className="min-h-screen pb-8" style={{ background: "#F8F8FC" }}>
      <div className="p-4 bg-white shadow-[0_4px_20px_rgba(108,99,255,0.03)] flex items-center gap-3">
        <Button variant="ghost" size="icon" className="hover:bg-gray-50 p-0" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-6 h-6 text-[#1A1A2E]" />
        </Button>
        <h1 className="text-xl font-bold text-[#1A1A2E]">{t("prof_title")}</h1>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="py-16 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: "#6C63FF" }} /></div>
        ) : (
          <>
            {/* Avatar */}
            <Card className="p-6 text-center premium-card">
              <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer">
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                <div className="w-full h-full rounded-full overflow-hidden bg-[#F0EFFF] flex items-center justify-center border-2 border-white shadow-md">
                  {uploadingAvatar ? <Loader2 className="w-6 h-6 animate-spin text-[#6C63FF]" /> : avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-[#6C63FF]" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-[#6C63FF] w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md cursor-pointer z-0">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#1A1A2E] mb-1 flex items-center justify-center gap-1">
                {profile?.full_name ?? t("prof_user")}
                {isPro && (
                  <BadgeCheck
                    className="w-6 h-6"
                    fill="#6C63FF"
                    stroke="white"
                  />
                )}
              </h2>
              <p className="text-sm text-[#8888A0] mb-3">{email}</p>

              <div className="flex justify-center mb-2">
                {isPro ? (
                  <Badge className="bg-[#6C63FF] hover:bg-[#6C63FF] text-white border-none px-3 py-1 rounded-full uppercase tracking-wider text-[10px] font-bold">
                    PRO
                  </Badge>
                ) : (
                  <Badge className="bg-[#EAE9F2] hover:bg-[#EAE9F2] text-[#8888A0] border-none px-3 py-1 rounded-full uppercase tracking-wider text-[10px] font-bold">
                    FREE
                  </Badge>
                )}
              </div>

              {!isPro && (
                <div className="mt-6 p-5 rounded-[20px] flex flex-col items-center gap-3 text-left shadow-[0_8px_30px_rgba(108,99,255,0.15)]" style={{ background: "linear-gradient(135deg, #6C63FF, #5A52D5)" }}>
                  <div className="w-full">
                    <h3 className="text-white font-bold text-lg mb-1">Calor X Pro</h3>
                    <p className="text-white/80 text-sm">افتح جميع ميزات المدرب الذكي والماكرو المتقدمة.</p>
                  </div>
                  <Button
                    className="w-full py-6 rounded-full font-bold bg-white text-[#6C63FF] hover:bg-[#F8F8FC] shadow-sm transition-all hover:-translate-y-0.5 mt-2"
                    onClick={handleUpgrade}
                    disabled={loadingCheckout}
                  >
                    {loadingCheckout ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    اشترك الآن - 3$/شهرياً
                  </Button>
                </div>
              )}

              {goal && (
                <Badge className={`mt-4 ${goal.color} border-0`}>
                  <Dumbbell className="w-3 h-3 mr-1" />{goal.label}
                </Badge>
              )}
            </Card>

            {/* Biometrics */}
            <Card className="p-5 premium-card">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-[#1A1A2E]">
                <Activity className="w-4 h-4 text-[#6C63FF]" />{t("prof_biometrics")}
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: t("prof_weight"), value: profile?.weight_kg ? `${profile.weight_kg}kg` : "—" },
                  { label: t("prof_height"), value: profile?.height_cm ? `${profile.height_cm}cm` : "—" },
                  { label: t("prof_age"), value: profile?.age ? `${profile.age}` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-xl bg-[#F8F8FC] border border-[#F0EFFF]">
                    <div className="text-xl font-bold text-[#1A1A2E]">{value}</div>
                    <div className="text-xs text-[#8888A0] mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              {bmi && (
                <div className="mt-3 p-3 rounded-xl flex items-center justify-between bg-[#F8F8FC] border border-[#F0EFFF]">
                  <p className="text-sm font-semibold text-[#8888A0]">{t("prof_bmi")}</p>
                  <div className="text-right">
                    <p className="text-xl font-bold" style={{ color: bmiCategory?.color }}>{bmi}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: bmiCategory?.color }}>{bmiCategory?.label}</p>
                  </div>
                </div>
              )}
              {profile?.activity_level && (
                <div className="mt-2 p-3 rounded-xl flex items-center justify-between bg-[#F8F8FC] border border-[#F0EFFF]">
                  <p className="text-sm font-semibold text-[#8888A0]">{t("prof_activity")}</p>
                  <Badge variant="secondary" className="bg-white border-[#EAE9F2] text-[#1A1A2E]">{activityLabels[profile.activity_level] ?? profile.activity_level}</Badge>
                </div>
              )}
            </Card>

            {/* Targets */}
            {goals && (
              <Card className="p-5 premium-card">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-[#1A1A2E]">
                  <Target className="w-4 h-4 text-[#6C63FF]" />{t("prof_daily_targets")}
                </h3>
                <div className="space-y-3">
                  {[
                    { label: t("prog_calories"), value: goals.calories_target, unit: "kcal", color: "#6C63FF" },
                    { label: t("prog_protein"), value: goals.protein_g_target, unit: "g", color: "#6B7280" },
                    { label: t("prog_carbs"), value: goals.carbs_g_target, unit: "g", color: "#9CA3AF" },
                    { label: t("prog_fat"), value: goals.fat_g_target, unit: "g", color: "#D1D5DB" },
                  ].map(({ label, value, unit, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#8888A0]">{label}</span>
                      <span className="font-bold text-sm" style={{ color }}>{Math.round(value)} {unit}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Weekly */}
            <Card className="p-5 premium-card">
              <h3 className="font-bold mb-4 text-[#1A1A2E]">{t("prof_this_week")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl text-center bg-[#F0EFFF] border border-[#EAE9F2]">
                  <p className="text-2xl font-black text-[#6C63FF]">{weeklyMeals}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8888A0] mt-0.5">{t("prof_meals_logged")}</p>
                </div>
                <div className="p-3 rounded-xl text-center bg-[#F8F8FC] border border-[#EAE9F2]">
                  <p className="text-2xl font-black text-[#1A1A2E]">{Math.round(totalCaloriesTracked / 1000 * 10) / 10}k</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8888A0] mt-0.5">{t("prof_kcal_tracked")}</p>
                </div>
              </div>
            </Card>

            {/* Support */}
            <Card className="p-5 premium-card" >
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: "#1A1A2E" }}>
                <Headphones className="w-4 h-4" style={{ color: "#6C63FF" }} />{t("support_title")}
              </h3>
              <div className="mb-3 p-3 rounded-2xl" style={{ background: "#F8F8FC" }}>
                {isPro ? (
                  <Badge className="bg-[#6C63FF]/10 text-[#6C63FF] border-0 text-xs">{t("support_priority")}</Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("support_free")}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full gap-2 bg-white border border-gray-200 shadow-sm text-gray-700"
                  onClick={() => window.open("mailto:support@calorx.app?subject=Support Request", "_blank")}
                >
                  <Mail className="w-4 h-4" />{t("support_email_btn")}
                </Button>
                <Button
                  className="flex-1 rounded-full gap-2 text-white"
                  style={{ background: "#1A1A2E" }}
                  onClick={() => window.open("https://wa.me/+1234567890?text=Hello%2C%20I%20need%20support%20with%20Calor%20X", "_blank")}
                >
                  <MessageCircle className="w-4 h-4" />واتساب
                </Button>
              </div>
            </Card>

            {/* Actions */}
            <Card className="divide-y divide-[#F8F8FC] premium-card overflow-hidden border-none shadow-[0_4px_20px_rgba(108,99,255,0.08)]">
              <button className="w-full p-4 flex items-center justify-between hover:bg-[#F8F8FC] transition-colors text-left" onClick={() => navigate("/profile-setup")}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F0EFFF] flex items-center justify-center">
                    <Edit2 className="w-4 h-4 text-[#6C63FF]" />
                  </div>
                  <span className="font-semibold text-[#1A1A2E]">{t("prof_edit")}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#8888A0]" />
              </button>
              <button className="w-full p-4 flex items-center justify-between hover:bg-[#F8F8FC] transition-colors text-left" onClick={() => navigate("/privacy")}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F0EFFF] flex items-center justify-center">
                    <Info className="w-4 h-4 text-[#6C63FF]" />
                  </div>
                  <span className="font-semibold text-[#1A1A2E]">{t("prof_privacy")}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#8888A0]" />
              </button>
              <button className="w-full p-4 flex items-center justify-between hover:bg-[#F8F8FC] transition-colors text-left" onClick={() => navigate("/terms")}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F0EFFF] flex items-center justify-center">
                    <Info className="w-4 h-4 text-[#6C63FF]" />
                  </div>
                  <span className="font-semibold text-[#1A1A2E]">{t("prof_terms")}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#8888A0]" />
              </button>
              <button className="w-full p-4 flex items-center justify-between hover:bg-[#F8F8FC] transition-colors text-left" onClick={handleLogout}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-[#1A1A2E]" />
                  </div>
                  <span className="font-semibold text-[#1A1A2E]">{t("prof_logout")}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#8888A0]" />
              </button>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
