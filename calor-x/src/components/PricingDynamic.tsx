import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Lemon Squeezy Variant IDs
const VARIANT_MONTHLY = "d9756ec1-1e8b-4e71-b15a-b2edff5e4bbe";
const VARIANT_YEARLY = "feab0bcd-4222-4841-a1a4-10f05b915b01";

const PricingDynamic = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isYearly, setIsYearly] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || "");
        setUserId(data.user.id || "");
      }
    });

    // @ts-ignore
    window.lemonSqueezyActive = true;

    const script = document.createElement("script");
    script.src = "https://app.lemonsqueezy.com/js/lemon.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.createLemonSqueezy) {
        // @ts-ignore
        window.createLemonSqueezy();
        // @ts-ignore
        if (window.LemonSqueezy) {
          // @ts-ignore
          window.LemonSqueezy.Setup({
            eventHandler: (event: any) => console.log(event)
          });
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      // @ts-ignore
      window.lemonSqueezyActive = false;
    };
  }, []);

  const handleProCheckout = () => {
    if (!userId) {
      navigate("/auth");
      return;
    }

    const variantId = isYearly ? VARIANT_YEARLY : VARIANT_MONTHLY;
    const checkoutUrl = `https://calorx.lemonsqueezy.com/checkout/buy/${variantId}?checkout[email]=${userEmail}`;

    // @ts-ignore
    if (window.LemonSqueezy) {
      // @ts-ignore
      window.LemonSqueezy.Url.Open(checkoutUrl);
    } else {
      window.open(checkoutUrl, "_blank");
    }
  };

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
      onAction: () => navigate("/signup"),
    },
    {
      name: t("plan_pro"),
      price: isYearly ? "3" : "5",
      period: isYearly ? t("per_month") : t("per_month"),
      description: isYearly ? "Billed as $36/year" : t("desc_pro"),
      features: [
        { text: t("feat_scan_unlimited"), included: true },
        { text: t("feat_ai_coach"), included: true },
        { text: t("feat_meal_planning"), included: true },
        { text: t("feat_pdf_reports"), included: true },
        { text: t("feat_micro"), included: true },
        { text: t("feat_priority"), included: true },
      ],
      cta: loadingCheckout ? t("loading") : t("cta_get_pro"),
      highlight: true,
      popular: true,
      onAction: handleProCheckout,
    },
  ];

  return (
    <section className="py-24" style={{ background: "#F8F8FC" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: "#1A1A2E" }}>
            {t("price_title")}
          </h2>
          <p className="text-base text-[#8888A0] max-w-md mx-auto">
            {t("price_subtitle")}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-14">
          <span className={`text-sm font-semibold transition-colors ${!isYearly ? "text-[#6C63FF]" : "text-[#8888A0]"}`}>
            {t("toggle_monthly")}
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-16 h-8 rounded-full transition-colors duration-300 outline-none"
            style={{ backgroundColor: isYearly ? "#43E97B" : "#6C63FF" }}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 blur-[0.5px] shadow-sm ${isYearly ? "left-[34px]" : "left-1"
                }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold transition-colors ${isYearly ? "text-[#6C63FF]" : "text-[#8888A0]"}`}>
              {t("toggle_yearly")}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#43E97B" }}>
              Save 40%
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative flex flex-col rounded-[24px] border transition-all duration-300 ${plan.highlight
                ? "shadow-[0_8px_30px_rgba(108,99,255,0.12)] scale-[1.03] border-2"
                : "shadow-[0_4px_20px_rgba(108,99,255,0.04)] border-transparent hover:shadow-[0_8px_30px_rgba(108,99,255,0.08)] hover:-translate-y-1"
                }`}
              style={{
                background: plan.highlight ? "#6C63FF" : "#ffffff",
                borderColor: plan.highlight ? "#6C63FF" : undefined,
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="px-4 py-1 text-sm font-bold border-none" style={{ background: "#43E97B", color: "#1A1A2E" }}>
                    {t("popular_badge")}
                  </Badge>
                </div>
              )}

              <div className="p-7 pt-8">
                {/* Plan name */}
                <h3 className="text-2xl font-bold mb-4" style={{ color: plan.highlight ? "#FFFFFF" : "#1A1A2E" }}>
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold" style={{ color: plan.highlight ? "rgba(255,255,255,0.8)" : "#8888A0" }}>$</span>
                  <span className="text-6xl font-black" style={{ color: plan.highlight ? "#ffffff" : "#1A1A2E" }}>
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color: plan.highlight ? "rgba(255,255,255,0.8)" : "#8888A0" }}>{plan.period}</span>
                </div>

                <p className="text-sm mb-6 font-medium leading-relaxed" style={{ color: plan.highlight ? "rgba(255,255,255,0.9)" : "#8888A0" }}>
                  {plan.description}
                </p>

                {/* CTA */}
                <Button
                  className="w-full py-6 text-base font-bold rounded-full mb-6 transition-all hover:opacity-90 hover:-translate-y-1"
                  style={plan.highlight
                    ? { background: "#FFFFFF", color: "#6C63FF" }
                    : { background: "#6C63FF", color: "#ffffff", border: "none" }
                  }
                  onClick={plan.onAction}
                  disabled={loadingCheckout}
                >
                  {plan.cta}
                </Button>

                {/* Feature list */}
                <ul className="space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3">
                      {f.included ? (
                        <Check className="w-5 h-5 mt-0.5 shrink-0" style={{ color: plan.highlight ? "#43E97B" : "#6C63FF" }} />
                      ) : (
                        <X className="w-5 h-5 mt-0.5 shrink-0" style={{ color: plan.highlight ? "rgba(255,255,255,0.3)" : "#EAE9F2" }} />
                      )}
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: f.included
                            ? (plan.highlight ? "#FFFFFF" : "#1A1A2E")
                            : (plan.highlight ? "rgba(255,255,255,0.5)" : "#8888A0"),
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
