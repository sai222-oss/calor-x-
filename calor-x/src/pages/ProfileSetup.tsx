import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    height: "",
    goal: "maintain",
    activity: "moderate",
    phone_number: "",
    country: "",
    fitness_level: "beginner",
    dietary_preference: "no_restriction"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      const age = parseInt(formData.age);

      // Simple calculation for demo
      // BMR estimate
      const bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      const activityMultipliers: any = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
      const tdee = bmr * activityMultipliers[formData.activity];

      let calTarget = tdee;
      if (formData.goal === "lose") calTarget -= 500;
      if (formData.goal === "gain") calTarget += 500;

      const protTarget = weight * 2; // 2g per kg
      const fatTarget = (calTarget * 0.25) / 9;
      const carbTarget = (calTarget - (protTarget * 4) - (fatTarget * 9)) / 4;

      const [profileRes, goalsRes] = await Promise.all([
        supabase.from("profiles").upsert({
          id: user.id,
          full_name: formData.name,
          age,
          weight_kg: weight,
          height_cm: height,
          health_goal: formData.goal === "lose" ? "lose_weight" : formData.goal === "gain" ? "gain_muscle" : "maintenance",
          activity_level: formData.activity,
          onboarding_completed: true,
          phone_number: formData.phone_number || null,
          country: formData.country || null,
          fitness_level: formData.fitness_level || null,
          dietary_preferences: formData.dietary_preference !== "no_restriction" ? [formData.dietary_preference] : null
        }, { onConflict: "id" }),
        supabase.from("daily_goals").upsert({
          user_id: user.id,
          calories_target: Math.round(calTarget),
          protein_g_target: Math.round(protTarget),
          carbs_g_target: Math.round(carbTarget),
          fat_g_target: Math.round(fatTarget)
        }, { onConflict: "user_id" })
      ]);

      if (profileRes.error) throw profileRes.error;
      if (goalsRes.error) throw goalsRes.error;

      toast.success(lang === "ar" ? "تم حفظ ملفك الشخصي!" : "Profile saved!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8F8FC" }}>
      <div className="p-4 flex items-center gap-3 text-[#1A1A2E] shadow-[0_4px_20px_rgba(108,99,255,0.03)]" style={{ background: "#FFFFFF" }}>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">{t("setup_title")}</h1>
      </div>

      <div className="p-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="premium-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#6C63FF] mb-2 border-b pb-2">
              {lang === "ar" ? "المعلومات الأساسية" : "Basic Info"}
            </h2>
            <div className="space-y-2">
              <Label className="text-[#6C63FF] font-bold text-xs uppercase tracking-wider">{t("setup_name")}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl border-[#6C63FF]/10 bg-[#F8F8FC] focus:ring-brand-green"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#6C63FF] font-bold text-xs uppercase tracking-wider">{t("setup_age")}</Label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="rounded-xl border-[#6C63FF]/10 bg-[#F8F8FC]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#6C63FF] font-bold text-xs uppercase tracking-wider">{t("setup_weight")}</Label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="rounded-xl border-[#6C63FF]/10 bg-[#F8F8FC]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#6C63FF] font-bold text-xs uppercase tracking-wider">{t("setup_height")}</Label>
              <Input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="rounded-xl border-[#6C63FF]/10 bg-[#F8F8FC]"
                required
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label className="text-[#6C63FF] font-bold text-xs uppercase tracking-wider">
                {lang === "ar" ? "رقم الهاتف (اختياري)" : "Phone Number (Optional)"}
              </Label>
              <Input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="rounded-xl border-[#6C63FF]/10 bg-[#F8F8FC]"
                placeholder={lang === "ar" ? "+1234567890" : "+1234567890"}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#6C63FF] font-bold text-xs uppercase tracking-wider">
                {lang === "ar" ? "البلد (اختياري)" : "Country (Optional)"}
              </Label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="rounded-xl border-[#6C63FF]/10 bg-[#F8F8FC]"
                placeholder={lang === "ar" ? "مثال: السعودية، الإمارات" : "e.g. Saudi Arabia, UAE"}
              />
            </div>
          </div>

          <div className="premium-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-[#6C63FF] mb-2 border-b pb-2">
              {lang === "ar" ? "اللياقة والنظام الغذائي" : "Fitness & Diet"}
            </h2>
            <div className="space-y-2">
              <Label className="text-[#6C63FF] font-bold text-xs uppercase tracking-wider">{t("setup_goal")}</Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: "lose", label: t("prof_goal_fat_loss") },
                  { id: "maintain", label: t("prof_goal_maintain") },
                  { id: "gain", label: t("prof_goal_muscle") }
                ].map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, goal: g.id })}
                    className={`p-4 rounded-2xl text-sm font-bold transition-all text-center border-2 ${formData.goal === g.id ? "bg-[#6C63FF] text-white border-[#6C63FF] shadow-md" : "bg-white text-muted-foreground border-[#6C63FF]/5"}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-[#6C63FF] font-bold text-xs uppercase tracking-wider">{t("prof_activity")}</Label>
              <select
                value={formData.activity}
                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                className="w-full p-4 rounded-2xl bg-[#F8F8FC] border border-[#6C63FF]/10 text-sm font-bold text-[#6C63FF] focus:outline-none focus:border-[#6C63FF]"
              >
                <option value="sedentary">{t("prof_act_sedentary")}</option>
                <option value="light">{t("prof_act_light")}</option>
                <option value="moderate">{t("prof_act_moderate")}</option>
                <option value="active">{t("prof_act_active")}</option>
                <option value="very_active">{t("prof_act_very_active")}</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-[#6C63FF] font-bold text-xs uppercase tracking-wider">
                {lang === "ar" ? "مستوى اللياقة" : "Fitness Level"}
              </Label>
              <select
                value={formData.fitness_level}
                onChange={(e) => setFormData({ ...formData, fitness_level: e.target.value })}
                className="w-full p-4 rounded-2xl bg-[#F8F8FC] border border-[#6C63FF]/10 text-sm font-bold text-[#6C63FF] focus:outline-none focus:border-[#6C63FF]"
              >
                <option value="beginner">{lang === "ar" ? "مبتدئ" : "Beginner"}</option>
                <option value="intermediate">{lang === "ar" ? "متوسط" : "Intermediate"}</option>
                <option value="advanced">{lang === "ar" ? "متقدم" : "Advanced"}</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-[#6C63FF] font-bold text-xs uppercase tracking-wider">
                {lang === "ar" ? "التفضيل الغذائي" : "Dietary Preference"}
              </Label>
              <select
                value={formData.dietary_preference}
                onChange={(e) => setFormData({ ...formData, dietary_preference: e.target.value })}
                className="w-full p-4 rounded-2xl bg-[#F8F8FC] border border-[#6C63FF]/10 text-sm font-bold text-[#6C63FF] focus:outline-none focus:border-[#6C63FF]"
              >
                <option value="no_restriction">{lang === "ar" ? "لا قيود" : "No Restriction"}</option>
                <option value="vegetarian">{lang === "ar" ? "نباتي (فيجيتيريان)" : "Vegetarian"}</option>
                <option value="vegan">{lang === "ar" ? "نباتي صرف (فيجان)" : "Vegan"}</option>
                <option value="halal">{lang === "ar" ? "حلال" : "Halal"}</option>
                <option value="keto">{lang === "ar" ? "كيتو" : "Keto"}</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-8 rounded-3xl btn-glow text-xl font-bold shadow-2xl gap-3"
            style={{ background: "#6C63FF" }}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
              <>
                <Sparkles className="w-6 h-6 text-[#43E97B]" />
                {t("setup_start")}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
