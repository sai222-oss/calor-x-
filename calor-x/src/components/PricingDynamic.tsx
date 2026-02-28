import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

const plans = []; // Clear static plans as they are now inside the component using translations

const PricingDynamic = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const plans = [
    {
      name: t("plan_free"),
      price: "0",
      period: t("forever"),
      description: t("desc_free"),
      features: [
        { text: t("feat_scan_1"), included: true },
        { text: t("feat_basic_info"), included: true },
        { text: t("feat_community_support"), included: true },
        { text: t("nav_coach"), included: false },
        { text: t("feat_full_macro"), included: false },
        { text: t("feat_no_ads"), included: false },
      ],
      cta: t("cta_start_free"),
      highlight: false,
      popular: false,
    },
    {
      name: t("plan_standard"),
      price: "3",
      period: t("per_month"),
      description: t("desc_standard"),
      features: [
        { text: t("feat_scan_10"), included: true },
        { text: t("feat_full_macro"), included: true },
        { text: t("feat_trends"), included: true },
        { text: t("feat_no_ads"), included: true },
        { text: t("nav_coach"), included: false },
        { text: t("feat_pdf_reports"), included: false },
      ],
      cta: t("cta_get_standard"),
      highlight: true,
      popular: true,
    },
    {
      name: t("plan_pro"),
      price: "6",
      period: t("per_month"),
      description: t("desc_pro"),
      features: [
        { text: t("feat_scan_unlimited"), included: true },
        { text: t("feat_ai_coach"), included: true },
        { text: t("feat_meal_planning"), included: true },
        { text: t("feat_pdf_reports"), included: true },
        { text: t("feat_micro"), included: true },
        { text: t("feat_priority"), included: true },
      ],
      cta: t("cta_get_pro"),
      highlight: false,
      popular: false,
    },
  ];

  return (
    <section className="py-24" style={{ background: "linear-gradient(180deg, #F9F9F2 0%, #eef2ef 100%)" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: "#1B4332" }}>
            {t("price_title")}
          </h2>
          <p className="text-base text-gray-500 max-w-md mx-auto">
            {t("price_subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative flex flex-col rounded-3xl border transition-all duration-300 ${plan.highlight
                ? "shadow-2xl scale-[1.03] border-2"
                : "shadow-md border border-gray-200 hover:shadow-xl hover:-translate-y-1"
                }`}
              style={{
                background: plan.highlight ? "#1B4332" : "#ffffff",
                borderColor: plan.highlight ? "#D4AF37" : undefined,
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="px-4 py-1 text-sm font-bold" style={{ background: "#D4AF37", color: "#1B1B1B" }}>
                    {t("popular_badge")}
                  </Badge>
                </div>
              )}

              <div className="p-7 pt-8">
                {/* Plan name */}
                <h3 className="text-2xl font-bold mb-4" style={{ color: plan.highlight ? "#D4AF37" : "#1B4332" }}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold" style={{ color: plan.highlight ? "rgba(255,255,255,0.6)" : "#9CA3AF" }}>$</span>
                  <span className="text-6xl font-black" style={{ color: plan.highlight ? "#ffffff" : "#1B4332" }}>
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color: plan.highlight ? "rgba(255,255,255,0.6)" : "#9CA3AF" }}>{plan.period}</span>
                </div>

                <p className="text-sm mb-6 font-medium leading-relaxed" style={{ color: plan.highlight ? "rgba(255,255,255,0.8)" : "#4B5563" }}>
                  {plan.description}
                </p>

                {/* CTA */}
                <Button
                  className="w-full py-5 text-base font-bold rounded-2xl mb-6 transition-opacity hover:opacity-90"
                  style={plan.highlight
                    ? { background: "#D4AF37", color: "#1B1B1B" }
                    : { background: "#1B4332", color: "#ffffff", border: "2px solid #1B4332" }
                  }
                  onClick={() => navigate("/signup")}
                >
                  {plan.cta}
                </Button>

                {/* Feature list */}
                <ul className="space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3">
                      {f.included ? (
                        <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.highlight ? "#D4AF37" : "#1B4332" }} />
                      ) : (
                        <X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: plan.highlight ? "rgba(255,255,255,0.25)" : "#D1D5DB" }} />
                      )}
                      <span
                        className="text-sm"
                        style={{
                          color: f.included
                            ? (plan.highlight ? "rgba(255,255,255,0.9)" : "#374151")
                            : (plan.highlight ? "rgba(255,255,255,0.35)" : "#9CA3AF"),
                        }}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-10 font-medium">
          {t("price_footer")}
        </p>
      </div>
    </section>
  );
};

export default PricingDynamic;
