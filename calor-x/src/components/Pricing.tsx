import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      nameAr: "مجاني",
      price: "$0",
      period: "/month",
      description: "Perfect for trying out Calorie Arabia",
      descriptionAr: "مثالي لتجربة كالوري عربيا",
      features: [
        "1 free photo scan per day",
        "Basic nutrition analysis",
        "Watch ads for more scans",
        "Arabic, English, French support",
      ],
      cta: "Start Free",
      ctaAr: "ابدأ مجاناً",
      popular: false,
    },
    {
      name: "Premium North Africa",
      nameAr: "بريميوم شمال أفريقيا",
      price: "$3",
      period: "/month",
      description: "For Morocco, Algeria, Tunisia, Libya, Egypt",
      descriptionAr: "للمغرب، الجزائر، تونس، ليبيا، مصر",
      features: [
        "Unlimited photo scans",
        "Advanced nutrition analysis",
        "AI Nutrition Coach",
        "No ads",
        "Priority support",
        "Health insights & trends",
      ],
      cta: "Get Premium",
      ctaAr: "احصل على بريميوم",
      popular: true,
    },
    {
      name: "Premium Gulf",
      nameAr: "بريميوم الخليج",
      price: "$9",
      period: "/month",
      description: "For UAE, Qatar, Bahrain, Kuwait, Saudi Arabia, Oman",
      descriptionAr: "للإمارات، قطر، البحرين، الكويت، السعودية، عمان",
      features: [
        "Unlimited photo scans",
        "Advanced nutrition analysis",
        "AI Nutrition Coach",
        "No ads",
        "Priority support",
        "Health insights & trends",
        "Early access to new features",
      ],
      cta: "Get Premium",
      ctaAr: "احصل على بريميوم",
      popular: false,
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Simple, Regional Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            أسعار عادلة مصممة لمنطقتك
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative border-border/50 shadow-soft hover:shadow-glow transition-all duration-300 ${
                plan.popular ? 'border-primary border-2 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-1">{plan.name}</CardTitle>
                <CardDescription className="text-lg font-semibold text-accent mb-4">
                  {plan.nameAr}
                </CardDescription>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <p className="text-sm text-accent font-medium">{plan.descriptionAr}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-6">
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
                <span className="text-sm text-muted-foreground">{plan.ctaAr}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
