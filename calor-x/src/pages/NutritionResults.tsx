import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Info, Clock, Dumbbell, Zap, Activity, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PortionConfirmDialog } from '@/components/PortionConfirmDialog';
import { EditableIngredient } from '@/components/EditableIngredient';
import { useLanguage } from '@/hooks/useLanguage';

interface Ingredient {
  db_id?: string;
  name: string;
  name_ar: string;
  quantity_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  vitamins_minerals: Record<string, number>;
  confidence: number;
  nutrition_per_100g?: any;
  nutrition?: any;
}

interface NutritionData {
  dish_label?: string;
  dish_label_ar?: string;
  confidence?: number;
  ingredients: Ingredient[];
  total?: any;
  imageUrl?: string;
  imageHash?: string;
  cached?: boolean;
}

const NutritionResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, isRTL } = useLanguage();
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPortionDialog, setShowPortionDialog] = useState(false);
  const [portionMultiplier, setPortionMultiplier] = useState(1);

  useEffect(() => {
    const data = location.state?.nutritionData;
    if (!data) { navigate('/scan'); return; }

    const normalizedData: NutritionData = {
      ...data,
      dish_label: data.dish_label || data.dish_name,
      dish_label_ar: data.dish_label_ar || data.dish_name_ar,
      confidence: data.confidence || (data.confidence_score ? data.confidence_score / 100 : 0.9),
      ingredients: data.ingredients || [],
      total: data.total || data.total_nutrition
    };

    setNutritionData(normalizedData);
    if ((normalizedData.total?.calories || 0) > 3500 || (normalizedData.confidence || 0) < 0.7) {
      setShowPortionDialog(true);
    }
  }, [location.state]);

  const handlePortionConfirm = (multiplier: number) => {
    if (!nutritionData) return;
    setPortionMultiplier(multiplier);
    const adjusted = {
      ...nutritionData,
      total: Object.keys(nutritionData.total).reduce((acc: any, key) => {
        if (typeof nutritionData.total[key] === 'number') acc[key] = nutritionData.total[key] * multiplier;
        else acc[key] = nutritionData.total[key];
        return acc;
      }, {})
    };
    setNutritionData(adjusted);
  };

  const handleSaveMeal = async () => {
    if (!nutritionData) return;
    setSaving(true);
    try {
      const nutrition = nutritionData.total;
      const { error } = await supabase.from('meal_logs').insert({
        dish_name: nutritionData.dish_label,
        dish_name_ar: nutritionData.dish_label_ar,
        image_url: nutritionData.imageUrl,
        calories: nutrition.calories,
        protein_g: nutrition.protein_g,
        carbs_g: nutrition.carbs_g,
        fat_g: nutrition.fat_g,
        ingredients: nutritionData.ingredients as any,
      } as any);

      if (error) throw error;
      toast.success(t("res_save_success"));
      navigate('/dashboard');
    } catch (error) {
      toast.error(t("res_save_error"));
    } finally { setSaving(false); }
  };

  if (!nutritionData) return null;

  const nutrition = nutritionData.total;
  const confidence = Math.round((nutritionData.confidence || 0) * 100);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FFF5F0" }}>
      <PortionConfirmDialog
        open={showPortionDialog}
        onConfirm={handlePortionConfirm}
        onReanalyze={() => navigate('/scan')}
        onClose={() => setShowPortionDialog(false)}
        totalCalories={nutrition.calories || 0}
      />

      <div className="p-4 flex items-center justify-between text-white" style={{ background: "#FF4500" }}>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">{t("res_title")}</h1>
        <div className="w-10" />
      </div>

      <main className="p-4 space-y-4">
        {nutritionData.imageUrl && (
          <img src={nutritionData.imageUrl} alt="Food" className="w-full h-56 object-cover rounded-3xl premium-card shadow-lg" />
        )}

        <Card className="p-6 premium-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-black text-[#FF4500]">
                {lang === "ar" ? (nutritionData.dish_label_ar || nutritionData.dish_label) : (nutritionData.dish_label || nutritionData.dish_label_ar)}
              </h2>
              <Badge variant="outline" className="mt-2" style={{ color: "#FF8C00", borderColor: "#FF8C00" }}>
                {t("res_confidence", { n: confidence })}
              </Badge>
            </div>
            {nutritionData.cached && (
              <Badge variant="secondary" className="bg-[#FF4500]/10 text-[#FF4500] border-0 uppercase text-[10px]">
                {t("res_cached")}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: t("res_calories"), val: Math.round(nutrition.calories), unit: "", color: "#FF4500", icon: Zap },
              { label: t("res_protein_g"), val: Math.round(nutrition.protein_g), unit: "g", color: "#FF4500", icon: Dumbbell },
              { label: t("res_carbs_g"), val: Math.round(nutrition.carbs_g), unit: "g", color: "#FF8C00", icon: Activity },
              { label: t("res_fat_g"), val: Math.round(nutrition.fat_g), unit: "g", color: "#6B7280", icon: Droplets }
            ].map(m => (
              <div key={m.label} className="p-2 rounded-2xl" style={{ background: "#FFF5F0" }}>
                <p className="text-lg font-black" style={{ color: m.color }}>{m.val}<span className="text-[10px]">{m.unit}</span></p>
                <p className="text-[10px] text-muted-foreground uppercase">{m.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Gym Intelligence */}
        {((nutritionData as any).gym_tip || (nutritionData as any).gym_tip_ar) && (
          <Card className="p-5 premium-card border-[#FF4500]/20" style={{ background: "rgba(27, 67, 50, 0.03)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="w-5 h-5 text-[#FF4500]" />
              <h3 className="font-bold text-[#FF4500] uppercase tracking-wider text-sm">{t("res_gym_intel")}</h3>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium leading-relaxed" style={{ color: "#FF4500" }}>
                {lang === "ar" ? ((nutritionData as any).gym_tip_ar || (nutritionData as any).gym_tip) : ((nutritionData as any).gym_tip || (nutritionData as any).gym_tip_ar)}
              </p>
              <div className="flex gap-4">
                {(nutritionData as any).glycemic_index && (
                  <div className="text-center bg-white/50 p-2 rounded-xl flex-1 border border-[#FF4500]/5">
                    <p className="text-xs text-muted-foreground uppercase">{t("res_gi")}</p>
                    <p className="text-lg font-black" style={{ color: (nutritionData as any).glycemic_index < 55 ? "#FF4500" : "#FF8C00" }}>
                      {(nutritionData as any).glycemic_index}
                    </p>
                  </div>
                )}
                {(nutritionData as any).protein_quality_score && (
                  <div className="text-center bg-white/50 p-2 rounded-xl flex-1 border border-[#FF4500]/5">
                    <p className="text-xs text-muted-foreground uppercase">{t("res_protein_quality")}</p>
                    <p className="text-lg font-black text-[#FF4500]">{(nutritionData as any).protein_quality_score}/10</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Ingredients */}
        {nutritionData.ingredients.length > 0 && (
          <Card className="p-5 premium-card">
            <h3 className="font-bold text-sm mb-4 text-[#FF4500] uppercase tracking-wide">{t("res_ingredients")}</h3>
            <div className="space-y-2">
              {nutritionData.ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl" style={{ background: "#FFF5F0" }}>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm" style={{ color: "#FF4500" }}>
                      {lang === "ar" ? (ing.name_ar || ing.name) : (ing.name || ing.name_ar)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{ing.quantity_g}g</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm" style={{ color: "#FF8C00" }}>{Math.round(ing.calories || ing.nutrition?.calories)} kcal</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: "#FFF5F0" }}>
        <Button
          className="w-full py-6 rounded-2xl btn-glow text-lg font-bold shadow-xl"
          style={{ background: "#FF4500" }}
          onClick={handleSaveMeal}
          disabled={saving}
        >
          {saving ? t("res_saving") : t("res_add_today")}
        </Button>
      </div>
    </div>
  );
};

export default NutritionResults;
