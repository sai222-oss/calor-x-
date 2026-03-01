import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, X, Upload, RefreshCcw, Loader2, Lock, TrendingUp, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateImageHash } from "@/lib/imageHash";
import { useLanguage } from "@/hooks/useLanguage";
import { usePlan } from "@/hooks/usePlan";

const Scan = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { plan, scanLimit, loading: planLoading } = usePlan();
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [scansToday, setScansToday] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const isAtLimit = !planLoading && scansToday >= scanLimit;
  const limitMsg = plan === "free" ? t("scan_limit_free") : t("scan_limit_standard");

  if (scanError) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center p-4 bg-red-50" style={{ background: "#F8F8F8" }}>
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
    <div className="min-h-screen pb-24" style={{ background: "#F8F8F8" }}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-white border-b border-gray-100 shadow-sm">
        <Button variant="ghost" size="icon" className="hover:bg-gray-100 text-gray-800" onClick={() => navigate("/dashboard")}>
          <X className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold text-[#1B4332]">{t("scan_title")}</h1>
        {previewImage && !isUploading ? (
          <Button variant="ghost" size="icon" className="hover:bg-gray-100 text-gray-800" onClick={handleReset}>
            <RefreshCcw className="w-5 h-5" />
          </Button>
        ) : <div className="w-10" />}
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
            <span style={{ color: isAtLimit ? "#EF4444" : "#1B4332" }}>
              {isAtLimit ? "🚫 " : "📷 "}{t("scan_title")}
            </span>
            <span
              className="font-bold px-2 py-0.5 rounded-full text-xs"
              style={{
                background: isAtLimit ? "#EF4444" : "#1B4332",
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
              <h2 className="text-xl font-black mb-1" style={{ color: "#1B4332" }}>{t("scan_limit_title")}</h2>
              <p className="text-sm text-muted-foreground">{limitMsg}</p>
              <p className="text-sm font-medium mt-1" style={{ color: "#D4AF37" }}>{t("scan_limit_cta")}</p>
            </div>
            <Button
              className="w-full py-5 rounded-2xl font-bold text-white"
              style={{ background: "#1B4332" }}
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

      <div className="p-4 space-y-4">
        {/* Preview */}
        <Card
          className={`aspect-square relative overflow-hidden flex items-center justify-center premium-card ${isAtLimit ? "opacity-60" : "cursor-pointer"}`}
          onClick={!isUploading && !isAtLimit ? handlePickFile : isAtLimit ? () => setShowLimitModal(true) : undefined}
        >
          {previewImage ? (
            <img src={previewImage} alt="Food preview" className="w-full h-full object-cover rounded-3xl" />
          ) : (
            <div className="text-center space-y-4 p-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-pulse-glow" style={{ background: "rgba(27, 67, 50, 0.08)" }}>
                {isAtLimit ? <Lock className="w-12 h-12 text-red-400" /> : <Camera className="w-12 h-12" style={{ color: "#1B4332" }} />}
              </div>
              <p className="text-lg font-semibold" style={{ color: isAtLimit ? "#EF4444" : "#1B4332" }}>
                {isAtLimit ? t("scan_limit_title") : t("scan_tap_to_pick")}
              </p>
              <p className="text-sm text-muted-foreground">
                {isAtLimit ? t("scan_limit_cta") : t("scan_tap_subtitle")}
              </p>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-3xl">
              <Loader2 className="w-12 h-12 animate-spin" style={{ color: "#1B4332" }} />
              <p className="font-semibold text-lg" style={{ color: "#1B4332" }}>{t("scan_analysing")}</p>
              <p className="text-sm text-muted-foreground">{t("scan_please_wait")}</p>
            </div>
          )}
        </Card>

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onClick={(e) => { (e.target as any).value = null }} onChange={handleFileSelect} />

        <div className="grid grid-cols-2 gap-4">
          <Button size="lg" className="flex flex-col gap-2 h-auto py-5 rounded-full btn-glow" style={{ background: isAtLimit ? "#9CA3AF" : "#1B4332" }} onClick={handlePickFile} disabled={isUploading}>
            <Camera className="w-7 h-7 text-white" /><span className="text-white">{t("scan_camera")}</span>
          </Button>
          <Button size="lg" variant="secondary" className="flex flex-col gap-2 h-auto py-5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700" onClick={handlePickFile} disabled={isUploading}>
            <Upload className="w-7 h-7" /><span>{t("scan_upload")}</span>
          </Button>
        </div>

        {previewImage && !isUploading && (
          <Button variant="outline" className="w-full gap-2 rounded-2xl" onClick={handleReset}>
            <RefreshCcw className="w-4 h-4" />{t("scan_another")}
          </Button>
        )}

        <Card className="p-5 premium-card">
          <h3 className="font-bold mb-3 text-sm text-muted-foreground uppercase tracking-wide">{t("scan_tips_title")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {(["scan_tip1", "scan_tip2", "scan_tip3", "scan_tip4"] as const).map(k => (
              <li key={k} className="flex gap-2"><span style={{ color: "#D4AF37" }}>•</span>{t(k)}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Scan;
