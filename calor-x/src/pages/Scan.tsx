import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, X, Upload, RefreshCcw, Loader2, Lock, TrendingUp, AlertTriangle, Search, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { motion, AnimatePresence } from "framer-motion";
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

  const webcamRef = useRef<Webcam>(null);
  const [isCameraLive, setIsCameraLive] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Scanning Scanner logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCameraLive && !previewImage && !isUploading) {
      const codeReader = new BrowserMultiFormatReader();
      interval = setInterval(async () => {
        if (webcamRef.current && webcamRef.current.video) {
          try {
            const result = await codeReader.decodeFromVideoElement(webcamRef.current.video);
            if (result) {
              clearInterval(interval);
              capturePhoto(); // Auto capture on successful scan
            }
          } catch (e) {
            // normal behavior when no barcode is in frame
          }
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isCameraLive, previewImage, isUploading]);

  // Manual Entry States
  const [showManualModal, setShowManualModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [manualWeight, setManualWeight] = useState("");
  const [nutritionData, setNutritionData] = useState<any>(null);

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

  const startCamera = async () => {
    if (!planLoading && scansToday >= scanLimit) {
      setShowLimitModal(true); return;
    }
    setCameraError(null);
    setIsCameraLive(true);
    setPreviewImage(null);
  };

  const stopCamera = () => {
    setIsCameraLive(false);
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setIsCameraLive(false);
        setPreviewImage(imageSrc);

        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "scan.jpg", { type: "image/jpeg" });
            processFile(file);
          });
      }
    }
  };

  const processFile = async (file: File) => {
    setScanError(null);
    if (scansToday >= scanLimit) { setShowLimitModal(true); return; }
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) { setScanError(t("scan_err_type")); resetInput(); return; }
    if (file.size > 5 * 1024 * 1024) { setScanError(t("scan_err_size")); resetInput(); return; }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      // Read file as data URL for preview + base64 for edge function
      const dataUrl = await new Promise<string>((res) => { const r = new FileReader(); r.onloadend = () => res(r.result as string); r.readAsDataURL(file); });
      setPreviewImage(dataUrl);

      let imageHash = "";
      try { imageHash = await generateImageHash(dataUrl); } catch { /* ok */ }

      // Extract base64 payload (strip the data URL prefix)
      const base64Data = dataUrl.split(",")[1];
      const mimeType = file.type || "image/jpeg";

      // Upload to storage for persistent URL reference
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_").toLowerCase();
      const fileName = `${user.id}/${Date.now()}_${safeName}`;
      const { error: uploadError } = await supabase.storage.from("food-images").upload(fileName, file, { cacheControl: "3600", upsert: false });
      const { data: urlData } = supabase.storage.from("food-images").getPublicUrl(fileName);
      const imageUrl = uploadError ? "" : urlData.publicUrl;

      // Send only the imageUrl to avoid hitting Supabase Edge Function payload limits (which causes non-2xx status codes on large images)
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke("analyze-food", {
        body: { mimeType, imageUrl, imageHash, userId: user.id },
      });

      if (analysisError) {
        // Extract the real error message: it may be buried in context or message
        let msg = "Unknown error";
        try {
          const ctx = (analysisError as any).context;
          if (ctx) {
            const body = typeof ctx === "string" ? JSON.parse(ctx) : ctx;
            msg = body?.error || body?.message || analysisError.message || msg;
          } else {
            msg = analysisError.message || msg;
          }
        } catch { msg = analysisError.message || msg; }
        setScanError(`فشل التحليل: ${msg}`);
        setIsUploading(false); resetInput(); return;
      }

      if (analysisData?.error) {
        setScanError(`فشل التحليل: ${analysisData.error}`);
        setIsUploading(false); resetInput(); return;
      }

      setNutritionData({ ...analysisData, imageUrl: imageUrl || dataUrl, imageHash });
      setIsUploading(false);
    } catch (err: any) {
      setScanError(`خطأ: ${err?.message ?? "حدث خطأ غير متوقع"}`);
      setIsUploading(false); resetInput();
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
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

    setNutritionData(manualNutritionData);
    setShowManualModal(false);
    setPreviewImage(null); // Optional: ensure preview image holds nothing
  };

  const isAtLimit = !planLoading && scansToday >= scanLimit;
  const limitMsg = plan === "free" ? t("scan_limit_free") : t("scan_limit_standard");

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col overflow-hidden">
      {/* Header over Camera/Content */}
      <div className="absolute top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <Button variant="ghost" size="icon" className="hover:bg-white/20 text-white rounded-full bg-black/40 backdrop-blur-sm" onClick={() => navigate("/dashboard")}>
          <X className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2 text-white">
          <Camera className="w-5 h-5" />
          <h1 className="text-lg font-black">{t("scan_title")}</h1>
        </div>
        <Badge className="bg-[#6C63FF] text-white border-0 font-bold px-3 py-1 text-[10px] rounded-full shadow-md">
          {plan === 'pro' ? 'PRO' : 'FREE'}
        </Badge>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative w-full flex flex-col">
        {/* Animated Switcher concept using standard conditional rendering and CSS transitions */}
        {previewImage ? (
          <div className="absolute inset-0 z-0 animate-in fade-in duration-500">
            <img src={previewImage} alt="Captured food" className="w-full h-full object-cover" />

            {/* Rescan / X Button */}
            <Button
              className="absolute top-24 left-6 z-50 bg-black/50 hover:bg-black/70 rounded-full w-12 h-12 p-0 backdrop-blur-md"
              onClick={() => {
                setPreviewImage(null);
                setNutritionData(null);
                setScanError(null);
                if (!isCameraLive) startCamera();
              }}
            >
              <X className="w-6 h-6 text-white" />
            </Button>
          </div>
        ) : (
          <div className="absolute inset-0 z-0 flex flex-col animate-in fade-in duration-500">
            {/* Top 45% Camera Feed */}
            <div className="relative w-full h-[45vh] bg-black overflow-hidden flex items-center justify-center">
              {isCameraLive ? (
                <>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "environment" }}
                    onUserMediaError={() => setCameraError("Camera access denied or unavailable.")}
                    className="w-full h-full object-cover"
                  />
                  {cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center z-50">
                      <p className="text-red-400 font-bold">{cameraError}</p>
                    </div>
                  )}
                  {/* Viewfinder Overlay strictly positioned absolute inset-0 */}
                  {!cameraError && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-[60vw] h-[60vw] max-w-[250px] max-h-[250px] border-4 border-[#43E97B] rounded-3xl shadow-[0_0_0_100vh_rgba(0,0,0,0.5)] box-content relative">
                        <div className="absolute -inset-1 border-4 border-[#43E97B] rounded-3xl opacity-50 blur-sm"></div>
                      </div>
                    </div>
                  )}
                </>
              ) : !isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button onClick={startCamera} className="bg-[#6C63FF] text-white rounded-full px-6 py-3 font-bold">
                    <Camera className="w-5 h-5 mr-2" /> {t("scan_camera")}
                  </Button>
                </div>
              )}
            </div>

            {/* Bottom 55% Instructional / Action Area */}
            <div className="flex-1 bg-[#121212] flex flex-col items-center pt-8 px-6 rounded-t-3xl -mt-6 z-10 relative">
              <div className="w-12 h-1 bg-white/20 rounded-full mb-8"></div>

              <Lock className="w-8 h-8 text-white/50 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{t("scan_tap_to_pick") || "Point at food"}</h3>
              <p className="text-white/60 text-center text-sm max-w-xs mb-auto">
                {t("scan_tap_subtitle") || "Position the food inside the frame and we'll analyze the nutritional value automatically."}
              </p>

              <div className="w-full grid grid-cols-2 gap-4 pb-12 mt-8">
                {isCameraLive ? (
                  <Button className="col-span-2 py-7 rounded-2xl text-lg font-bold bg-[#43E97B] hover:bg-[#3bc266] text-black shadow-[0_0_20px_rgba(67,233,123,0.3)] transition-all active:scale-95" onClick={capturePhoto}>
                    <Camera className="w-6 h-6 mr-2" /> {t("scan_capture")}
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="py-6 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold" onClick={handlePickFile} disabled={isUploading}>
                      <Upload className="w-4 h-4 mr-2" /> {t("scan_upload")}
                    </Button>
                    <Button variant="outline" className="py-6 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold" onClick={() => setShowManualModal(true)}>
                      <Search className="w-4 h-4 mr-2" /> {t("scan_enter_manually")}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in">
            <Loader2 className="w-12 h-12 animate-spin text-[#43E97B] mb-4" />
            <p className="font-bold text-white text-lg">{t("scan_analysing")}</p>
            <p className="text-white/60 text-sm mt-2">{t("scan_please_wait")}</p>
          </div>
        )}

        {/* Nutrition Data Bottom Sheet with Framer Motion */}
        <AnimatePresence>
          {nutritionData && !isUploading && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-50"
            >
              <div className="bg-white/15 backdrop-blur-xl border-t border-white/20 rounded-t-[32px] p-6 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-6"></div>

                <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-1">Detected Food</p>
                <h2 className="text-3xl font-black text-white mb-6 leading-tight">
                  {lang === 'ar' ? nutritionData.dish_label_ar : nutritionData.dish_label}
                </h2>

                <div className="grid grid-cols-4 gap-3 mb-8">
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-orange-500/10 border border-orange-500/30">
                    <span className="text-orange-400 text-xl font-bold">{Math.round(nutritionData.total_nutrition?.calories || 0)}</span>
                    <span className="text-orange-400/80 text-[10px] font-medium uppercase mt-1">kcal</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                    <span className="text-blue-400 text-xl font-bold">{Math.round(nutritionData.total_nutrition?.protein_g || 0)}g</span>
                    <span className="text-blue-400/80 text-[10px] font-medium uppercase mt-1">Protein</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-green-500/10 border border-green-500/30">
                    <span className="text-green-400 text-xl font-bold">{Math.round(nutritionData.total_nutrition?.carbs_g || 0)}g</span>
                    <span className="text-green-400/80 text-[10px] font-medium uppercase mt-1">Carbs</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-red-500/10 border border-red-500/30">
                    <span className="text-red-400 text-xl font-bold">{Math.round(nutritionData.total_nutrition?.fat_g || 0)}g</span>
                    <span className="text-red-400/80 text-[10px] font-medium uppercase mt-1">Fats</span>
                  </div>
                </div>

                <Button
                  className="w-full py-6 rounded-2xl text-lg font-bold bg-white text-black hover:bg-gray-100 transition-all shadow-xl"
                  onClick={() => navigate("/nutrition-results", { state: { nutritionData } })}
                >
                  Log to Diary
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onClick={(e) => { (e.target as any).value = null }} onChange={handleFileSelect} />

      {/* Scan Error Alert Overlay */}
      {scanError && !isUploading && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md p-8 text-center space-y-6 bg-white border-0 shadow-2xl rounded-3xl">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900">
              {t("scan_err_analysis_failed_title")}
            </h2>
            <p className="text-red-700 font-medium">{scanError}</p>
            <div className="pt-4 grid gap-3">
              <Button onClick={() => setScanError(null)} className="w-full py-5 font-bold bg-red-500 hover:bg-red-600 text-white rounded-2xl animate-fade-in">
                {t("scan_try_again")}
              </Button>
              <Button variant="outline" onClick={() => { setScanError(null); navigate("/dashboard"); }} className="w-full py-5 rounded-2xl">
                {t("scan_back_home")}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Scan Limit Modal */}
      {showLimitModal && (
        <div className="absolute inset-0 z-[100] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowLimitModal(false)}>
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl mb-8" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 bg-red-100">
                <Lock className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-black mb-1 text-[#6C63FF]">{t("scan_limit_title")}</h2>
              <p className="text-sm text-gray-500">{limitMsg}</p>
            </div>
            <Button className="w-full py-5 rounded-2xl font-bold text-white bg-[#6C63FF] hover:bg-[#5b52e5]" onClick={() => navigate("/pricing")}>
              <TrendingUp className="w-5 h-5 mr-2" /> {t("upgrade_btn")}
            </Button>
            <Button variant="ghost" className="w-full rounded-2xl text-black hover:bg-gray-100" onClick={() => setShowLimitModal(false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="absolute inset-0 z-[100] flex flex-col bg-white text-black animate-in slide-in-from-bottom duration-300">
          <div className="p-4 flex flex-col gap-4 border-b">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => { setShowManualModal(false); setSelectedFood(null); setManualWeight(""); }}>
                <X className="w-5 h-5" />
              </Button>
              <span className="font-bold">{t("scan_enter_manually")}</span>
              <div className="w-10"></div>
            </div>
            {!selectedFood ? (
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input autoFocus placeholder={t("scan_search_food")} className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-xl">
                <span className="font-semibold text-[#6C63FF]">🥩 {lang === "ar" ? selectedFood.name_ar : selectedFood.name_en}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFood(null)} className="h-8 text-xs underline">{t("scan_change")}</Button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-white">
            {!selectedFood ? (
              <div className="space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl active:bg-gray-100 cursor-pointer" onClick={() => { setSelectedFood(item); setManualWeight(item.typical_serving_g.toString()); }}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🍲</span>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-gray-900">{lang === "ar" ? item.name_ar : item.name_en}</span>
                          <span className="text-[10px] text-gray-500">{item.typical_serving_g} {t("scan_typical_portion")}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))
                ) : (
                  searchQuery.length >= 2 ? <p className="text-center text-muted-foreground mt-10">{t("scan_no_foods")}</p> : <p className="text-center text-muted-foreground mt-10">{t("scan_search_placeholder")}</p>
                )}
              </div>
            ) : (
              <div className="space-y-6 pt-4">
                <div className="flex flex-col gap-2 items-center text-center">
                  <label className="font-bold text-gray-700">{t("scan_enter_weight")}</label>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 mr-2">[</span>
                    <Input type="number" value={manualWeight} onChange={(e) => setManualWeight(e.target.value)} className="w-24 h-12 text-center font-bold text-xl bg-gray-50 border-gray-200 focus-visible:ring-[#6C63FF]" min="0" />
                    <span className="text-gray-400 ml-2">]</span>
                  </div>
                  <span className="text-sm font-medium text-gray-500">{t("scan_grams")}</span>
                </div>
                <Button className="w-full py-6 rounded-2xl text-lg font-bold shadow-xl mt-4 bg-[#6C63FF] text-white" onClick={handleManualEntrySubmit}>
                  {t("scan_calc_nutrition")}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scan;
