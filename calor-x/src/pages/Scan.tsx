import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, X, Upload, RefreshCcw, Loader2, Lock, TrendingUp, AlertTriangle, Search, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateImageHash } from "@/lib/imageHash";
import { useLanguage } from "@/hooks/useLanguage";
import { usePlan } from "@/hooks/usePlan";
import { searchFoodDatabase, FoodItem } from "@/data/foodDatabase";
import { Input } from "@/components/ui/input";

const Scan = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { plan, scanLimit, loading: planLoading } = usePlan();
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [scansToday, setScansToday] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Entry States
  const [showManualModal, setShowManualModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [manualWeight, setManualWeight] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      // Count today's scans
      const today = new Date().toISOString().split("T")[0];
      const { count } = await supabase
        .from("meal_logs")
        .select("id", { count: "exact" })
        .eq("user_id", session.user.id)
        .gte("logged_at", `${today}T00:00:00`);
      setScansToday(count ?? 0);
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setSearchResults(searchFoodDatabase(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const resetInput = () => { if (fileInputRef.current) fileInputRef.current.value = ""; };
  const handlePickFile = () => {
    setScanError(null);
    // Check scan limit before opening picker
    if (!planLoading && scansToday >= scanLimit) {
      setShowLimitModal(true);
      return;
    }
    resetInput();
    fileInputRef.current?.click();
  };
  const handleReset = () => { setPreviewImage(null); setIsUploading(false); setScanError(null); resetInput(); };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setScanError(null);

    // Double-check limit before processing
    if (scansToday >= scanLimit) {
      setShowLimitModal(true);
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) { setScanError(t("scan_err_type")); resetInput(); return; }
    if (file.size > 5 * 1024 * 1024) { setScanError(t("scan_err_size")); resetInput(); return; }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const dataUrl = await new Promise<string>((res) => { const r = new FileReader(); r.onloadend = () => res(r.result as string); r.readAsDataURL(file); });
      setPreviewImage(dataUrl);
      let imageHash = "";
      try { imageHash = await generateImageHash(dataUrl); } catch { /* ok */ }
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_").toLowerCase();
      const fileName = `${user.id}/${Date.now()}_${safeName}`;
      const { error: uploadError } = await supabase.storage.from("food-images").upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (uploadError) { setScanError(`فشل الرفع: ${uploadError.message}`); setIsUploading(false); resetInput(); return; }
      const { data: urlData } = supabase.storage.from("food-images").getPublicUrl(fileName);

      const { data: analysisData, error: analysisError } = await supabase.functions.invoke("analyze-food", {
        body: { imageUrl: urlData.publicUrl, imageHash, userId: user.id },
      });
      if (analysisError) {
        const msg = analysisError.message ?? "Unknown error";
        if (msg.includes("GEMINI_API_KEY")) {
          setScanError("مفتاح Gemini API غير مضبوط في Supabase. يرجى إضافة المفتاح في إعدادات Edge Function.");
        } else { setScanError(`فشل التحليل: ${msg}`); }
        setIsUploading(false); resetInput(); return;
      }
      navigate("/nutrition-results", { state: { nutritionData: { ...analysisData, imageUrl: urlData.publicUrl, imageHash } } });
    } catch (err: any) {
      setScanError(`خطأ: ${err?.message ?? "حدث خطأ غير متوقع"}`);
      setIsUploading(false); resetInput();
    }
  };

  const handleManualEntrySubmit = () => {
    if (!selectedFood) return;
    const weight = parseFloat(manualWeight) || selectedFood.typical_serving_g;
    const ratio = weight / 100;

    const manualNutritionData = {
      dish_label: selectedFood.name_en,
      dish_label_ar: selectedFood.name_ar,
      confidence: 1.0,
      matched_from_db: true,
      total_nutrition: {
        calories: selectedFood.per100g.calories * ratio,
        protein_g: selectedFood.per100g.protein * ratio,
        carbs_g: selectedFood.per100g.carbs * ratio,
        fat_g: selectedFood.per100g.fat * ratio,
      },
      ingredients: selectedFood.ingredients.map(ing => {
        // adjust ingredient proportional to custom weight vs typical serving
        const servingRatio = weight / selectedFood.typical_serving_g;
        const ingWeight = ing.typical_g * servingRatio;
        const ingRatio = ingWeight / 100;
        return {
          name_en: ing.name_en,
          name_ar: ing.name_ar,
          weight_g: ingWeight,
          calories: ing.per100g.calories * ingRatio,
          protein: ing.per100g.protein * ingRatio,
          carbs: ing.per100g.carbs * ingRatio,
          fat: ing.per100g.fat * ingRatio,
          per100g: ing.per100g
        };
      })
    };

    navigate("/nutrition-results", { state: { nutritionData: manualNutritionData } });
  };

  const isAtLimit = !planLoading && scansToday >= scanLimit;
  const limitMsg = plan === "free" ? t("scan_limit_free") : t("scan_limit_standard");

  if (scanError) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center p-4 bg-red-50" style={{ background: "#F8F8FC" }}>
        <Card className="w-full max-w-md p-8 text-center space-y-6 premium-card animate-fade-in border-red-200">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-900">
            فشل تحليل الصورة
          </h2>
          <p className="text-red-700 font-medium">
            {scanError}
          </p>
          <div className="pt-4 grid gap-3">
            <Button onClick={() => setScanError(null)} className="w-full py-5 font-bold" style={{ background: "#EF4444", color: "white" }}>
              المحاولة مرة أخرى (Try Again)
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full py-5">
              العودة للرئيسية (Back to Home)
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8F8FC" }}>
      {/* Clean Header matching middle screen */}
      <div className="px-6 py-4 bg-white shadow-sm flex items-center justify-between sticky top-0 z-40 rounded-b-3xl mb-6">
        <Button variant="ghost" size="icon" className="hover:bg-gray-100 text-[#1A1A2E] bg-gray-50 rounded-full" onClick={() => navigate("/dashboard")}>
          <X className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#6C63FF]" />
          <h1 className="text-lg font-black text-[#1A1A2E]">{t("scan_title")}</h1>
        </div>
        <Badge className="bg-[#6C63FF] text-white border-0 font-bold px-3 py-1 text-[10px] rounded-full shadow-md">
          {plan === 'pro' ? 'PRO' : 'FREE'}
        </Badge>
      </div>

      {/* Daily scan counter badge */}
      {!planLoading && scanLimit !== Infinity && (
        <div className="mx-4 mt-3">
          <div
            className="rounded-2xl p-3 flex items-center justify-between text-sm font-medium"
            style={{
              background: isAtLimit ? "rgba(239, 68, 68, 0.08)" : "rgba(27, 67, 50, 0.06)",
              border: `1px solid ${isAtLimit ? "rgba(239, 68, 68, 0.2)" : "rgba(27, 67, 50, 0.1)"}`,
            }}
          >
            <span style={{ color: isAtLimit ? "#EF4444" : "#6C63FF" }}>
              {isAtLimit ? "🚫 " : "📷 "}{t("scan_title")}
            </span>
            <span
              className="font-bold px-2 py-0.5 rounded-full text-xs"
              style={{
                background: isAtLimit ? "#EF4444" : "#6C63FF",
                color: "white",
              }}
            >
              {scansToday} / {scanLimit}
            </span>
          </div>
        </div>
      )}

      {/* Scan Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowLimitModal(false)}>
          <div
            className="w-full max-w-md rounded-3xl p-6 space-y-4"
            style={{ background: "#FFFFFF" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
                <Lock className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-black mb-1" style={{ color: "#6C63FF" }}>{t("scan_limit_title")}</h2>
              <p className="text-sm text-muted-foreground">{limitMsg}</p>
              <p className="text-sm font-medium mt-1" style={{ color: "#43E97B" }}>{t("scan_limit_cta")}</p>
            </div>
            <Button
              className="w-full py-5 rounded-2xl font-bold text-white"
              style={{ background: "#6C63FF" }}
              onClick={() => navigate("/pricing")}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              {t("upgrade_btn")}
            </Button>
            <Button variant="ghost" className="w-full rounded-2xl" onClick={() => setShowLimitModal(false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white">
          <div className="p-4 flex flex-col gap-4 border-b">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => { setShowManualModal(false); setSelectedFood(null); setManualWeight(""); }}>
                <X className="w-5 h-5" />
              </Button>
              <span className="font-bold">Enter Manually / إدخال يدوي</span>
              <div className="w-10"></div>
            </div>

            {!selectedFood ? (
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  autoFocus
                  placeholder="Search food (e.g., Shawarma)"
                  className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-xl">
                <span className="font-semibold text-[#6C63FF]">🥩 {lang === "ar" ? selectedFood.name_ar : selectedFood.name_en}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFood(null)} className="h-8 text-xs underline">
                  Change
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!selectedFood ? (
              <div className="space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl active:bg-gray-100 cursor-pointer"
                      onClick={() => { setSelectedFood(item); setManualWeight(item.typical_serving_g.toString()); }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🍲</span>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-gray-900">{lang === "ar" ? item.name_ar : item.name_en}</span>
                          <span className="text-[10px] text-gray-500">{item.typical_serving_g}g typical portion</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))
                ) : (
                  searchQuery.length >= 2 ? (
                    <p className="text-center text-muted-foreground mt-10">No foods found. Try a different search.</p>
                  ) : (
                    <p className="text-center text-muted-foreground mt-10">Search for Middle Eastern foods...</p>
                  )
                )}
              </div>
            ) : (
              <div className="space-y-6 pt-4">
                <div className="flex flex-col gap-2 items-center text-center">
                  <label className="font-bold text-gray-700">Enter Weight</label>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 mr-2">[</span>
                    <Input
                      type="number"
                      value={manualWeight}
                      onChange={(e) => setManualWeight(e.target.value)}
                      className="w-24 h-12 text-center font-bold text-xl bg-gray-50 border-gray-200 focus-visible:ring-[#6C63FF]"
                      min="0"
                    />
                    <span className="text-gray-400 ml-2">]</span>
                  </div>
                  <span className="text-sm font-medium text-gray-500">grams</span>
                </div>

                <Button className="w-full py-6 rounded-2xl btn-glow text-lg font-bold shadow-xl mt-4" style={{ background: "#6C63FF" }} onClick={handleManualEntrySubmit}>
                  Calculate Nutrition
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="px-4 space-y-6">
        {/* Main Floating Card matching reference image */}
        <div className="bg-white rounded-[32px] p-6 shadow-soft mx-auto w-full relative">

          <h2 className="text-sm font-bold text-[#1A1A2E] mb-4">Upload Food Image</h2>

          <Card
            className={`aspect-video w-full relative overflow-hidden flex items-center justify-center bg-[#F8F8FC] border-2 border-dashed border-gray-200 rounded-[24px] mb-6 ${isAtLimit ? "opacity-60" : "cursor-pointer hover:bg-gray-50 transition-colors"}`}
            onClick={!isUploading && !isAtLimit ? handlePickFile : isAtLimit ? () => setShowLimitModal(true) : undefined}
          >
            {previewImage ? (
              <img src={previewImage} alt="Food preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center space-y-2 p-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto bg-white shadow-sm">
                  {isAtLimit ? <Lock className="w-6 h-6 text-red-400" /> : <Camera className="w-6 h-6 text-[#6C63FF]" />}
                </div>
                <p className="text-sm font-bold text-[#1A1A2E]">
                  {isAtLimit ? t("scan_limit_title") : t("scan_tap_to_pick")}
                </p>
                <p className="text-xs text-[#8888A0] max-w-[200px] mx-auto leading-tight">
                  {isAtLimit ? t("scan_limit_cta") : t("scan_tap_subtitle")}
                </p>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#6C63FF]" />
                <p className="font-bold text-[#6C63FF] text-sm tracking-wide">{t("scan_analysing")}</p>
                <p className="text-[10px] text-[#8888A0] font-medium">{t("scan_please_wait")}</p>
              </div>
            )}
          </Card>

          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onClick={(e) => { (e.target as any).value = null }} onChange={handleFileSelect} />

          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button variant="outline" className="flex items-center justify-center gap-2 py-6 rounded-2xl border-gray-100 shadow-sm bg-gray-50 hover:bg-white text-[#1A1A2E] font-bold text-xs" onClick={handlePickFile} disabled={isUploading}>
              <Camera className="w-4 h-4 text-[#8888A0]" />
              {t("scan_camera")}
            </Button>
            <Button variant="outline" className="flex items-center justify-center gap-2 py-6 rounded-2xl border-gray-100 shadow-sm bg-gray-50 hover:bg-white text-[#1A1A2E] font-bold text-xs" onClick={handlePickFile} disabled={isUploading}>
              <Upload className="w-4 h-4 text-[#8888A0]" />
              {t("scan_upload")}
            </Button>
          </div>

          {!previewImage && !isUploading && (
            <Button variant="outline" className="w-full gap-2 rounded-full py-6 font-bold shadow-sm border-gray-200" onClick={() => setShowManualModal(true)}>
              <Search className="w-4 h-4 text-[#8888A0]" /> Enter Manually
            </Button>
          )}

          {previewImage && !isUploading && (
            <Button className="w-full gap-2 rounded-full py-6 font-bold shadow-glow text-white mt-2 btn-glow transition-all" style={{ background: "#6C63FF" }} onClick={handlePickFile}>
              <RefreshCcw className="w-4 h-4" /> Change Image
            </Button>
          )}
        </div>

        {/* Tips outside the card */}
        <div className="px-2 mt-6">
          <h3 className="font-black mb-3 text-xs text-[#1A1A2E] uppercase tracking-wider pl-2 opacity-60">{t("scan_tips_title")}</h3>
          <ul className="space-y-2 text-xs text-[#8888A0] font-medium">
            {(["scan_tip1", "scan_tip2", "scan_tip3", "scan_tip4"] as const).map(k => (
              <li key={k} className="flex gap-2 items-start bg-white p-3 rounded-2xl shadow-sm border border-gray-50">
                <span className="text-[#6C63FF] font-bold">•</span>
                <span>{t(k)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Scan;
