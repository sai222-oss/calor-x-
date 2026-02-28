import { Camera, Brain, MessageSquare, Shield } from "lucide-react";
import aiScanImage from "@/assets/ai-scan-feature-clean.jpg";
import nutritionImage from "@/assets/nutrition-dashboard.jpg";
import { useLanguage } from "@/hooks/useLanguage";

const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Camera,
      title: t("feat_recognition_title"),
      description: t("feat_recognition_desc"),
      image: aiScanImage,
    },
    {
      icon: Brain,
      title: t("feat_breakdown_title"),
      description: t("feat_breakdown_desc"),
      image: nutritionImage,
    },
    {
      icon: MessageSquare,
      title: t("feat_coach_title"),
      description: t("feat_coach_desc"),
    },
    {
      icon: Shield,
      title: t("feat_secure_title"),
      description: t("feat_secure_desc"),
    },
  ];

  return (
    <section className="py-24" style={{ background: "#ffffff" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: "#1B4332" }}>
            {t("feat_title")}
          </h2>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            {t("feat_subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              {feature.image && (
                <div className="overflow-hidden h-48">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(27, 67, 50, 0.08)" }}
                >
                  <feature.icon className="w-5 h-5" style={{ color: "#1B4332" }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "#1B4332" }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
