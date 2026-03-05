import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/arabic-food-hero.jpg";
import { useLanguage } from "@/hooks/useLanguage";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-end overflow-hidden bg-[#F8F8FC]">
      {/* Background Image covering top portion */}
      <div
        className="absolute inset-0 z-0 h-[65vh] w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F8F8FC]" />
      </div>

      {/* Floating White Card at bottom */}
      <div className="relative z-10 w-full px-4 pb-8 pt-0 animate-slide-up">
        <div className="bg-white rounded-[32px] p-8 shadow-soft text-center mx-auto max-w-sm w-full">
          <h1 className="text-2xl font-black mb-3 text-[#1A1A2E] leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
            {t("app_name")} - {t("hero_tag")}
          </h1>
          <p className="text-sm text-[#8888A0] mb-8 font-medium leading-relaxed">
            {t("hero_desc")}
          </p>
          <Button
            size="lg"
            className="w-full py-6 rounded-full font-bold text-lg text-white shadow-lg transition-all hover:opacity-90 hover:-translate-y-1 active:scale-95"
            style={{ background: "#6C63FF" }}
            onClick={() => navigate("/auth")}
          >
            {t("hero_cta")}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
