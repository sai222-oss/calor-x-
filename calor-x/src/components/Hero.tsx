import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/arabic-food-hero.jpg";
import { useLanguage } from "@/hooks/useLanguage";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/92 via-primary/75 to-black/60" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white">

          {/* Brand */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-8 animate-fade-in" style={{ background: "#FF4500", border: "1px solid #FF8C00" }}>
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            {t("hero_tag")}
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-5 leading-tight animate-fade-in" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {t("app_name")}
          </h1>

          <p className="text-lg md:text-xl opacity-90 mb-10 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {t("hero_desc")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.45s" }}>
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-2xl font-bold shadow-xl"
              style={{ background: "#FF8C00", color: "#1B1B1B" }}
              onClick={() => navigate("/signup")}
            >
              {t("hero_cta")}
            </Button>
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-2xl font-bold shadow-lg"
              style={{ background: "#ffffff", color: "#FF4500" }}
              onClick={() => navigate("/pricing")}
            >
              {t("hero_plans")}
            </Button>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: "0.6s" }}>
            {[
              { val: "15+", label: t("hero_stat_countries") },
              { val: "AI", label: t("hero_stat_ai") },
              { val: "1M+", label: t("hero_stat_dishes") },
            ].map(({ val, label }) => (
              <div
                key={label}
                className="text-center rounded-2xl px-3 py-4"
                style={{ background: "#FF4500", border: "1px solid #FF8C00" }}
              >
                <div className="text-3xl font-black mb-1" style={{ color: "#FF8C00" }}>{val}</div>
                <div className="text-xs font-semibold" style={{ color: "#ffffff" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
