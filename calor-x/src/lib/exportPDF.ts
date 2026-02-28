import { supabase } from "@/integrations/supabase/client";

interface MealLog {
  dish_name: string;
  dish_name_ar: string | null;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at: string;
}

interface DayData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: MealLog[];
}

export async function exportNutritionPDF(lang: "ar" | "en" = "ar"): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: meals, error } = await supabase
    .from("meal_logs")
    .select("dish_name, dish_name_ar, calories, protein_g, carbs_g, fat_g, logged_at")
    .eq("user_id", user.id)
    .gte("logged_at", sevenDaysAgo.toISOString())
    .order("logged_at", { ascending: true });

  if (error) throw error;

  // Group by day
  const dayMap: Record<string, DayData> = {};
  (meals ?? []).forEach((meal: MealLog) => {
    const date = meal.logged_at.split("T")[0];
    if (!dayMap[date]) {
      dayMap[date] = { date, calories: 0, protein: 0, carbs: 0, fat: 0, meals: [] };
    }
    dayMap[date].calories += meal.calories || 0;
    dayMap[date].protein += meal.protein_g || 0;
    dayMap[date].carbs += meal.carbs_g || 0;
    dayMap[date].fat += meal.fat_g || 0;
    dayMap[date].meals.push(meal);
  });

  const days = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

  // Dynamic import so the bundle isn't affected if not used
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const GREEN: [number, number, number] = [27, 67, 50];
  const GOLD: [number, number, number] = [212, 175, 55];
  const LIGHT: [number, number, number] = [249, 249, 242];
  const GRAY: [number, number, number] = [107, 114, 128];
  const W = 210;
  const PAD = 16;

  // ── Header ──────────────────────────────────────────
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Calor ", PAD, 15);
  doc.setTextColor(...GOLD);
  doc.text("X", PAD + 33, 15);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const title = lang === "ar" ? "Weekly Nutrition Report" : "Weekly Nutrition Report";
  doc.text(title, PAD, 24);
  doc.text(new Date().toLocaleDateString("en-GB"), W - PAD, 24, { align: "right" });

  let y = 44;

  // ── Summary Strip ────────────────────────────────────
  const totalCals = days.reduce((s, d) => s + d.calories, 0);
  const totalProtein = days.reduce((s, d) => s + d.protein, 0);
  const totalMeals = (meals ?? []).length;
  const avgCals = Math.round(totalCals / Math.max(days.length, 1));

  const summaryBoxes = [
    { label: lang === "ar" ? "Total Calories" : "Total Calories", val: `${Math.round(totalCals)} kcal` },
    { label: lang === "ar" ? "Total Protein" : "Total Protein", val: `${Math.round(totalProtein)}g` },
    { label: lang === "ar" ? "Total Meals" : "Total Meals", val: `${totalMeals}` },
    { label: lang === "ar" ? "Avg/Day" : "Avg/Day", val: `${avgCals} kcal` },
  ];

  const boxW = (W - PAD * 2 - 6) / 4;
  summaryBoxes.forEach((box, i) => {
    const bx = PAD + i * (boxW + 2);
    doc.setFillColor(...LIGHT);
    doc.roundedRect(bx, y, boxW, 20, 3, 3, "F");
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(box.label, bx + boxW / 2, y + 7, { align: "center" });
    doc.setTextColor(...GREEN);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(box.val, bx + boxW / 2, y + 15, { align: "center" });
  });
  y += 28;

  // ── Daily Table ──────────────────────────────────────
  doc.setTextColor(...GREEN);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(lang === "ar" ? "Daily Breakdown" : "Daily Breakdown", PAD, y);
  y += 7;

  // Header row
  doc.setFillColor(...GREEN);
  doc.rect(PAD, y, W - PAD * 2, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  const colX = [PAD + 2, PAD + 42, PAD + 82, PAD + 116, PAD + 150];
  ["Date", "Calories", "Protein", "Carbs", "Fat"].forEach((h, i) => doc.text(h, colX[i], y + 5.5));
  y += 10;

  if (days.length === 0) {
    doc.setTextColor(...GRAY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("No meals logged in the last 7 days.", PAD, y + 5);
    y += 12;
  } else {
    days.forEach((day, i) => {
      if (y > 255) { doc.addPage(); y = 20; }
      doc.setFillColor(i % 2 === 0 ? 249 : 255, i % 2 === 0 ? 249 : 255, i % 2 === 0 ? 242 : 255);
      doc.rect(PAD, y, W - PAD * 2, 8, "F");
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      [day.date, `${Math.round(day.calories)}`, `${Math.round(day.protein)}g`, `${Math.round(day.carbs)}g`, `${Math.round(day.fat)}g`]
        .forEach((v, ci) => doc.text(v, colX[ci], y + 5.5));
      y += 9;
    });
  }

  y += 10;

  // ── Meal List ────────────────────────────────────────
  if (y > 245) { doc.addPage(); y = 20; }
  doc.setTextColor(...GREEN);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Meal Log", PAD, y);
  y += 7;

  (meals ?? []).forEach((meal: MealLog) => {
    if (y > 270) { doc.addPage(); y = 20; }
    const name = (lang === "ar" ? meal.dish_name_ar : meal.dish_name) || meal.dish_name || "—";
    const when = new Date(meal.logged_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(name.slice(0, 50), PAD, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(`${Math.round(meal.calories)} kcal · ${Math.round(meal.protein_g)}g protein · ${when}`, W - PAD, y, { align: "right" });
    doc.setDrawColor(230, 230, 225);
    doc.line(PAD, y + 2.5, W - PAD, y + 2.5);
    y += 9;
  });

  // ── Footer on each page ──────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(...GREEN);
    doc.rect(0, 287, W, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text("Calor X — AI-Powered Nutrition Tracking", PAD, 293);
    doc.text(`${p} / ${pageCount}`, W - PAD, 293, { align: "right" });
  }

  doc.save(`calor-x-report-${new Date().toISOString().split("T")[0]}.pdf`);
}
