import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, Brain, TrendingUp } from "lucide-react";

import { useLanguage } from "@/hooks/useLanguage";

const Onboarding = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleStart = () => {
    // Check if user is already logged in (we'll implement auth later)
    const isLoggedIn = false; // TODO: Replace with actual auth check

    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/profile-setup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/90 via-primary/70 to-accent/80 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">{t("app_name")}</h1>
        <p className="text-xl font-arabic mb-8">مساعدك الذكي للتغذية الصحية</p>

        <div className="space-y-6 bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="flex items-center gap-4 text-right" dir="rtl">
            <div className="flex-1">
              <h3 className="font-bold mb-2">مسح ذكي للطعام</h3>
              <p className="text-sm opacity-90">التعرف على الأطباق العربية بدقة عالية</p>
            </div>
            <Smartphone className="w-12 h-12" />
          </div>

          <div className="flex items-center gap-4 text-right" dir="rtl">
            <div className="flex-1">
              <h3 className="font-bold mb-2">مدرب AI شخصي</h3>
              <p className="text-sm opacity-90">نصائح مخصصة لأهدافك الصحية</p>
            </div>
            <Brain className="w-12 h-12" />
          </div>

          <div className="flex items-center gap-4 text-right" dir="rtl">
            <div className="flex-1">
              <h3 className="font-bold mb-2">تتبع تقدمك</h3>
              <p className="text-sm opacity-90">راقب سعراتك وعناصرك الغذائية</p>
            </div>
            <TrendingUp className="w-12 h-12" />
          </div>
        </div>

        <Button
          size="lg"
          variant="secondary"
          className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all"
          onClick={handleStart}
        >
          <span className="font-arabic">ابدأ الآن مع تجربة مجانية لمدة 7 أيام</span>
          <ArrowLeft className="mr-2 h-5 w-5" />
        </Button>

      </div>
    </div>
  );
};

export default Onboarding;
