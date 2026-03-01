import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Target, Calendar, Flame, Zap, Droplets, Loader2, FileDown, FlaskConical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useLanguage } from "@/hooks/useLanguage";
import { usePlan } from "@/hooks/usePlan";
import { StringKey } from "@/lib/i18n";
import { exportNutritionPDF } from "@/lib/exportPDF";
import { toast } from "sonner";

interface DayData { dayKey: StringKey; dayLabel: string; calories: number; protein: number; }
interface Goals { calories_target: number; protein_g_target: number; carbs_g_target: number; fat_g_target: number; }

const DAY_KEYS: StringKey[] = ["day_sun", "day_mon", "day_tue", "day_wed", "day_thu", "day_fri", "day_sat"];
const EN_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Progress = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { isPro } = usePlan();
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [totalMeals, setTotalMeals] = useState(0);
  const [streak, setStreak] = useState(0);
  const [todayTotals, setTodayTotals] = useState({ cal: 0, protein: 0, carbs: 0, fat: 0 });

  const handleExportPDF = async () => {
    if (!isPro) { toast.info(t("pdf_pro_only")); navigate("/pricing"); return; }
    setPdfLoading(true);
    try {
      await exportNutritionPDF(lang as "ar" | "en");
      toast.success(t("pdf_export_success"));
    } catch {
      toast.error(t("pdf_export_error"));
    } finally { setPdfLoading(false); }
  };

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const today = new Date();
      const days = Array.from({ length: 7 }).map((_, i) => { const d = new Date(today); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split("T")[0]; });
      const [goalsRes, nutritionRes, allMealsRes] = await Promise.all([
        supabase.from("daily_goals").select("*").eq("user_id", user.id).single(),
        supabase.from("daily_nutrition").select("date, total_calories, total_protein_g, total_carbs_g, total_fat_g").eq("user_id", user.id).in("date", days),
        supabase.from("meal_logs").select("id", { count: "exact" }).eq("user_id", user.id),
      ]);
      setGoals(goalsRes.data ?? null);
      setTotalMeals(allMealsRes.count ?? 0);
      const mapped = days.map(date => {
        const row = nutritionRes.data?.find(r => r.date === date);
        const d = new Date(date + "T12:00:00");
        return { dayKey: DAY_KEYS[d.getDay()], dayLabel: EN_DAYS[d.getDay()], calories: Math.round(row?.total_calories ?? 0), protein: Math.round(row?.total_protein_g ?? 0) };
      });
      setWeekData(mapped);
      const todayStr = today.toISOString().split("T")[0];
      const todayRow = nutritionRes.data?.find(r => r.date === todayStr);
      if (todayRow) setTodayTotals({ cal: Math.round(todayRow.total_calories), protein: Math.round(todayRow.total_protein_g), carbs: Math.round(todayRow.total_carbs_g), fat: Math.round(todayRow.total_fat_g) });
      let s = 0; for (let i = mapped.length - 1; i >= 0; i--) { if (mapped[i].calories > 0) s++; else break; }
      setStreak(s);
      setLoading(false);
    };
    load();
  }, [navigate]);

  const chartData = weekData.map(d => ({ ...d, label: lang === "ar" ? t(d.dayKey) : d.dayLabel }));
  const pct = (val: number, target: number) => target > 0 ? Math.min(Math.round((val / target) * 100), 100) : 0;
  const calTarget = goals?.calories_target ?? 2000;
  const protTarget = goals?.protein_g_target ?? 150;
  const carbTarget = goals?.carbs_g_target ?? 200;
  const fatTarget = goals?.fat_g_target ?? 65;

  const macros = [
    { icon: Flame, label: t("prog_calories"), value: todayTotals.cal, target: calTarget, unit: "kcal", color: "#FF8C00" },
    { icon: Zap, label: t("prog_protein"), value: todayTotals.protein, target: protTarget, unit: "g", color: "#FF4500" },
    { icon: TrendingUp, label: t("prog_carbs"), value: todayTotals.carbs, target: carbTarget, unit: "g", color: "#6B7280" },
    { icon: Droplets, label: t("prog_fat"), value: todayTotals.fat, target: fatTarget, unit: "g", color: "#9CA3AF" },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FFF5F0" }}>
      <div className="p-4 flex items-center gap-3 text-white" style={{ background: "#FF4500" }}>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">{t("prog_title")}</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "#FF4500" }} /></div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-5 text-center premium-card">
              <p className="text-4xl font-black" style={{ color: "#FF8C00" }}>{streak}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("prog_day_streak")}</p>
            </Card>
            <Card className="p-5 text-center premium-card">
              <p className="text-4xl font-black" style={{ color: "#FF4500" }}>{totalMeals}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("prog_total_meals")}</p>
            </Card>
          </div>

          {/* Chart */}
          <Card className="p-5 premium-card">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4" style={{ color: "#FF4500" }} />
              <h2 className="font-bold" style={{ color: "#FF4500" }}>{t("prog_7day_cal")}</h2>
            </div>
            {chartData.every(d => d.calories === 0) ? (
              <div className="py-8 text-center">
                <TrendingUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">{t("prog_no_meals_week")}</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} barSize={30}>
                    <XAxis dataKey="label" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
                      formatter={(v: number) => [`${v} kcal`, t("prog_calories")]}
                    />
                    <Bar dataKey="calories" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.calories >= calTarget ? "#FF8C00" : entry.calories > 0 ? "#FF4500" : "#E5E7EB"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 justify-center text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#FF4500" }} />{lang === "ar" ? "دون الهدف" : "Below goal"}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "#FF8C00" }} />{lang === "ar" ? "الهدف محقق ✓" : "Goal reached ✓"}</span>
                </div>
              </>
            )}
          </Card>

          {/* Today vs Goals */}
          <Card className="p-5 premium-card">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4" style={{ color: "#FF8C00" }} />
              <h2 className="font-bold" style={{ color: "#FF4500" }}>{t("prog_today_vs_goals")}</h2>
            </div>
            {goals ? (
              <div className="space-y-4">
                {macros.map(({ icon: Icon, label, value, target, unit, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {value}{unit} / {target}{unit} &nbsp;
                        <span className="font-semibold" style={{ color: pct(value, target) >= 100 ? "#FF8C00" : "#FF4500" }}>
                          {pct(value, target)}%
                        </span>
                      </span>
                    </div>
                    {/* Green bg, gold fill progress bar */}
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(27, 67, 50, 0.1)" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct(value, target)}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("prog_setup_goals")} → <button className="underline" style={{ color: "#FF4500" }} onClick={() => navigate("/profile-setup")}>{t("setup")}</button>
              </p>
            )}
          </Card>

          {/* Micronutrient link */}
          <Card
            className="p-5 premium-card cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
            onClick={() => navigate("/micronutrients")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(27, 67, 50, 0.08)" }}>
                <FlaskConical className="w-5 h-5" style={{ color: "#FF4500" }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: "#FF4500" }}>{t("micro_title")}</p>
                <p className="text-xs text-muted-foreground">{t("micro_subtitle")}</p>
              </div>
              <ArrowLeft className="w-4 h-4 ml-auto rotate-180 text-muted-foreground" />
            </div>
          </Card>

          {/* PDF Export */}
          <Button
            className="w-full py-5 rounded-2xl font-bold gap-2"
            style={isPro ? { background: "#FF4500" } : { background: "#6B7280" }}
            onClick={handleExportPDF}
            disabled={pdfLoading}
          >
            {pdfLoading
              ? <><Loader2 className="w-5 h-5 animate-spin" />{t("pdf_exporting")}</>
              : <><FileDown className="w-5 h-5" />{t("pdf_export_btn")}{!isPro && " (Pro)"}</>
            }
          </Button>
        </div>
      )}
    </div>
  );
};

export default Progress;
