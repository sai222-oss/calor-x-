import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/arabic-food-hero.jpg";
import { useLanguage } from "@/hooks/useLanguage";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#1A1A2E]">
      {/* Dynamic Background Image */}
      <div
        className="absolute inset-0 z-0 h-full w-full bg-cover bg-center opacity-60 mix-blend-overlay"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      {/* Gradient overlays for premium depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] via-[#1A1A2E]/80 to-transparent z-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 z-0" />

      {/* Hero Content */}
      <div className="relative z-10 w-full px-6 pt-20 animate-fade-in flex flex-col items-center justify-center h-full">
        <div className="max-w-3xl w-full text-center space-y-6">
          <div className="inline-block mb-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_15px_rgba(108,99,255,0.3)]">
            <span className="text-white font-bold text-sm tracking-wide uppercase drop-shadow-md">
              {t("app_name")}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl" style={{ fontFamily: "'Inter', sans-serif" }}>
            {t("hero_tag")}
          </h1>

          <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-lg">
            {t("hero_desc")}
          </p>

          <div className="pt-8">
            <Button
              size="lg"
              className="py-7 px-10 rounded-full font-black text-xl text-white shadow-[0_10px_40px_rgba(108,99,255,0.5)] transition-all hover:scale-105 active:scale-95 border border-white/10"
              style={{ background: "linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)" }}
              onClick={() => navigate("/auth")}
            >
              {t("hero_cta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

