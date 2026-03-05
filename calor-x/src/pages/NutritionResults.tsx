import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Zap, Dumbbell, Activity, Droplets, Plus, Search, X, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PortionConfirmDialog } from '@/components/PortionConfirmDialog';
import { EditableIngredient } from '@/components/EditableIngredient';
import { useLanguage } from '@/hooks/useLanguage';
import { searchFoodDatabase, FoodItem } from '@/data/foodDatabase';

const NutritionResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang } = useLanguage();
  const [nutritionData, setNutritionData] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPortionDialog, setShowPortionDialog] = useState(false);

  // Hidden Ingredient Entry States
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [manualWeight, setManualWeight] = useState("");

  const [editableIngredients, setEditableIngredients] = useState<any[]>([]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setSearchResults(searchFoodDatabase(searchQuery));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const data = location.state?.nutritionData;
    if (!data) { navigate('/scan'); return; }

    let dishNameAr = data.dish_name_ar || data.dish_label_ar;
    let dishNameEn = data.dish_name_en || data.dish_label;

    const matches = searchFoodDatabase(dishNameAr || dishNameEn || "");
    let isDbMatch = false;
    let matchedData = { ...data };

    if (matches.length > 0) {
      const bestMatch = matches[0];
      isDbMatch = true;
      matchedData = {
        ...data,
        dish_name_ar: bestMatch.name_ar,
        dish_name_en: bestMatch.name_en,
        confidence: 1.0,
        matched_from_db: true,
        total_nutrition: {
          calories: bestMatch.per100g.calories * (bestMatch.typical_serving_g / 100),
          protein: bestMatch.per100g.protein * (bestMatch.typical_serving_g / 100),
          carbs: bestMatch.per100g.carbs * (bestMatch.typical_serving_g / 100),
          fat: bestMatch.per100g.fat * (bestMatch.typical_serving_g / 100),
        },
        ingredients: bestMatch.ingredients.map(ing => ({
          name_ar: ing.name_ar,
          name_en: ing.name_en,
          weight_g: ing.typical_g,
          calories: ing.per100g.calories * (ing.typical_g / 100),
          protein: ing.per100g.protein * (ing.typical_g / 100),
          carbs: ing.per100g.carbs * (ing.typical_g / 100),
          fat: ing.per100g.fat * (ing.typical_g / 100),
          per100g: ing.per100g
        }))
      };
    }

    const normalizedData = {
      ...matchedData,
      dish_label: matchedData.dish_name_en || matchedData.dish_label,
      dish_label_ar: matchedData.dish_name_ar || matchedData.dish_label_ar,
      confidence: matchedData.confidence || (matchedData.confidence_score ? matchedData.confidence_score / 100 : 0.9),
      ingredients: matchedData.ingredients || [],
      total: matchedData.total || matchedData.total_nutrition
    };

    setNutritionData(normalizedData);
    setEditableIngredients(normalizedData.ingredients.map((ing: any) => {
      let per100g = ing.per100g;
      if (!per100g && ing.weight_g > 0) {
        per100g = {
          calories: (ing.calories / ing.weight_g) * 100,
          protein: (ing.protein / ing.weight_g) * 100,
          carbs: (ing.carbs / ing.weight_g) * 100,
          fat: (ing.fat / ing.weight_g) * 100,
        };
      } else if (!per100g) {
        per100g = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      return { ...ing, per100g };
    }));

    if ((normalizedData.total?.calories || 0) > 3500 || (normalizedData.confidence || 0) < 0.7) {
      if (!isDbMatch) setShowPortionDialog(true);
    }
  }, [location.state, navigate]);

  const handlePortionConfirm = (multiplier: number) => {
    if (!editableIngredients.length) return;
    const adjusted = editableIngredients.map(ing => {
      const newWeight = ing.weight_g * multiplier;
      return {
        ...ing,
        weight_g: newWeight,
        calories: ing.per100g.calories * (newWeight / 100),
        protein: ing.per100g.protein * (newWeight / 100),
        carbs: ing.per100g.carbs * (newWeight / 100),
        fat: ing.per100g.fat * (newWeight / 100),
      };
    });
    setEditableIngredients(adjusted);
  };

  const handleIngredientUpdate = (index: number, newWeight: number) => {
    const updatedIngredients = [...editableIngredients];
    const item = updatedIngredients[index];

    updatedIngredients[index] = {
      ...item,
      weight_g: newWeight,
      calories: item.per100g.calories * (newWeight / 100),
      protein: item.per100g.protein * (newWeight / 100),
      carbs: item.per100g.carbs * (newWeight / 100),
      fat: item.per100g.fat * (newWeight / 100),
    };

    setEditableIngredients(updatedIngredients);
  };

  const handleAddIngredientSubmit = () => {
    if (!selectedFood) return;
    const weight = parseFloat(manualWeight) || selectedFood.typical_serving_g;
    const ratio = weight / 100;

    const newIngredient = {
      name_ar: selectedFood.name_ar,
      name_en: selectedFood.name_en,
      weight_g: weight,
      calories: selectedFood.per100g.calories * ratio,
      protein: selectedFood.per100g.protein * ratio,
      carbs: selectedFood.per100g.carbs * ratio,
      fat: selectedFood.per100g.fat * ratio,
      per100g: selectedFood.per100g
    };

    setEditableIngredients([...editableIngredients, newIngredient]);
    setShowAddModal(false);
    setSelectedFood(null);
    setManualWeight("");
    setSearchQuery("");
    toast.success(t("res_ingredient_added"));
  };

  const currentTotals = editableIngredients.reduce(
    (acc, ing) => {
      acc.calories += ing.calories || 0;
      acc.protein_g += ing.protein || 0;
      acc.carbs_g += ing.carbs || 0;
      acc.fat_g += ing.fat || 0;
      return acc;
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const handleSaveMeal = async () => {
    if (!nutritionData) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('meal_logs').insert({
        dish_name: nutritionData.dish_label,
        dish_name_ar: nutritionData.dish_label_ar,
        image_url: nutritionData.imageUrl,
        calories: currentTotals.calories,
        protein_g: currentTotals.protein_g,
        carbs_g: currentTotals.carbs_g,
        fat_g: currentTotals.fat_g,
        ingredients: editableIngredients,
      } as any);

      if (error) throw error;
      toast.success(t("res_save_success"));
      navigate('/dashboard');
    } catch (error) {
      toast.error(t("res_save_error"));
    } finally { setSaving(false); }
  };

  if (!nutritionData) return null;

  const confidenceValue = nutritionData.matched_from_db ? 1 : nutritionData.confidence;
  const confidence = Math.round((confidenceValue || 0) * 100);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8F8FC" }}>
      <PortionConfirmDialog
        open={showPortionDialog}
        onConfirm={handlePortionConfirm}
        onReanalyze={() => navigate('/scan')}
        onClose={() => setShowPortionDialog(false)}
        totalCalories={currentTotals.calories}
      />

      <div className="p-4 flex items-center justify-between text-white" style={{ background: "#6C63FF" }}>
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
              <h2 className="text-2xl font-black text-[#6C63FF]">
                {lang === "ar" ? nutritionData.dish_label_ar : nutritionData.dish_label}
              </h2>
              <Badge variant="outline" className="mt-2" style={{ color: "#43E97B", borderColor: "#43E97B" }}>
                {nutritionData.matched_from_db ? t("res_high_accuracy_db_match") : t("res_confidence", { n: confidence })}
              </Badge>
            </div>
            {nutritionData.cached && !nutritionData.matched_from_db && (
              <Badge variant="secondary" className="bg-[#6C63FF]/10 text-[#6C63FF] border-0 uppercase text-[10px]">
                {t("res_cached")}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: t("res_calories"), val: Math.round(currentTotals.calories), unit: "", color: "#6C63FF", icon: Zap },
              { label: t("res_protein_g"), val: Math.round(currentTotals.protein_g), unit: "g", color: "#6C63FF", icon: Dumbbell },
              { label: t("res_carbs_g"), val: Math.round(currentTotals.carbs_g), unit: "g", color: "#43E97B", icon: Activity },
              { label: t("res_fat_g"), val: Math.round(currentTotals.fat_g), unit: "g", color: "#6B7280", icon: Droplets }
            ].map(m => (
              <div key={m.label} className="p-2 rounded-2xl" style={{ background: "#F8F8FC" }}>
                <p className="text-lg font-black" style={{ color: m.color }}>{m.val}<span className="text-[10px]">{m.unit}</span></p>
                <p className="text-[10px] text-muted-foreground uppercase">{m.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Gym Intelligence */}
        {((nutritionData as any).gym_tip || (nutritionData as any).gym_tip_ar) && (
          <Card className="p-5 premium-card border-[#6C63FF]/20" style={{ background: "rgba(27, 67, 50, 0.03)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="w-5 h-5 text-[#6C63FF]" />
              <h3 className="font-bold text-[#6C63FF] uppercase tracking-wider text-sm">{t("res_gym_intel")}</h3>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium leading-relaxed" style={{ color: "#6C63FF" }}>
                {lang === "ar" ? ((nutritionData as any).gym_tip_ar || (nutritionData as any).gym_tip) : ((nutritionData as any).gym_tip || (nutritionData as any).gym_tip_ar)}
              </p>
              <div className="flex gap-4">
                {(nutritionData as any).glycemic_index && (
                  <div className="text-center bg-white/50 p-2 rounded-xl flex-1 border border-[#6C63FF]/5">
                    <p className="text-xs text-muted-foreground uppercase">{t("res_gi")}</p>
                    <p className="text-lg font-black" style={{ color: (nutritionData as any).glycemic_index < 55 ? "#6C63FF" : "#43E97B" }}>
                      {(nutritionData as any).glycemic_index}
                    </p>
                  </div>
                )}
                {(nutritionData as any).protein_quality_score && (
                  <div className="text-center bg-white/50 p-2 rounded-xl flex-1 border border-[#6C63FF]/5">
                    <p className="text-xs text-muted-foreground uppercase">{t("res_protein_quality")}</p>
                    <p className="text-lg font-black text-[#6C63FF]">{(nutritionData as any).protein_quality_score}/10</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Ingredients List */}
        <div className="space-y-3 mt-6">
          <h3 className="font-bold text-sm text-[#6C63FF] uppercase tracking-wide px-2">{t("res_adjust_portions")} / {t("res_ingredients")}</h3>
          <div>
            {editableIngredients.map((ing, idx) => (
              <EditableIngredient
                key={idx}
                ingredient={ing}
                onUpdate={(val) => handleIngredientUpdate(idx, val)}
              />
            ))}
          </div>

          <div className="mt-4 p-5 rounded-3xl border-2 border-dashed border-[#6C63FF]/30 bg-[#6C63FF]/5 text-center">
            <h4 className="font-bold text-[#6C63FF] mb-2 text-sm uppercase">{t("res_missing_something")}</h4>
            <p className="text-xs text-[#6C63FF]/80 font-medium mb-4">
              {t("res_missing_something_desc")}
            </p>
            <Button variant="outline" className="w-full rounded-2xl py-5 font-bold text-[#6C63FF] border-[#6C63FF]/20 hover:bg-[#6C63FF]/10" onClick={() => setShowAddModal(true)}>
              <Plus className="w-5 h-5 mr-2" /> {t("res_add_hidden_ingredient")}
            </Button>
          </div>
        </div>
      </main>

      {/* Hidden Ingredient Search Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white animate-fade-in">
          <div className="p-4 flex flex-col gap-4 border-b">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => { setShowAddModal(false); setSelectedFood(null); setManualWeight(""); }}>
                <X className="w-5 h-5" />
              </Button>
              <span className="font-bold">{t("res_add_ingredient_title")}</span>
              <div className="w-10"></div>
            </div>

            {!selectedFood ? (
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  autoFocus
                  placeholder={t("res_search_ingredient")}
                  className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 border rounded-xl">
                <span className="font-semibold text-[#6C63FF]">✨ {lang === "ar" ? selectedFood.name_ar : selectedFood.name_en}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFood(null)} className="h-8 text-xs underline">
                  {t("scan_change")}
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!selectedFood ? (
              <div className="space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl active:bg-gray-100 cursor-pointer"
                      onClick={() => { setSelectedFood(item); setManualWeight(item.typical_serving_g.toString()); }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🍲</span>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-gray-900">{lang === "ar" ? item.name_ar : item.name_en}</span>
                          <span className="text-[10px] text-gray-500">{item.typical_serving_g} {t("res_g_typical")}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))
                ) : (
                  searchQuery.length >= 2 ? (
                    <p className="text-center text-muted-foreground mt-10">{t("res_no_items")}</p>
                  ) : (
                    <p className="text-center text-muted-foreground mt-10">{t("res_search_to_add")}</p>
                  )
                )}
              </div>
            ) : (
              <div className="space-y-6 pt-4">
                <div className="flex flex-col gap-2 items-center text-center">
                  <label className="font-bold text-gray-700">{t("res_enter_hidden_weight")}</label>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 mr-2">[</span>
                    <Input
                      type="number"
                      value={manualWeight}
                      onChange={(e) => setManualWeight(e.target.value)}
                      className="w-24 h-12 text-center font-bold text-xl bg-gray-50 border-gray-200 focus-visible:ring-[#6C63FF]"
                      min="0"
                    />
                    <span className="text-gray-400 ml-2">]</span>
                  </div>
                  <span className="text-sm font-medium text-gray-500">{t("scan_grams")}</span>
                </div>

                <Button className="w-full py-6 rounded-2xl btn-glow text-lg font-bold shadow-xl mt-4" style={{ background: "#6C63FF" }} onClick={handleAddIngredientSubmit}>
                  {t("res_add_to_result")}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: "#F8F8FC" }}>
        <Button
          className="w-full py-6 rounded-2xl btn-glow text-lg font-bold shadow-xl"
          style={{ background: "#6C63FF" }}
          onClick={handleSaveMeal}
          disabled={saving}
        >
          {saving ? t("res_saving") : t("res_save_to_log", { kcal: Math.round(currentTotals.calories) })}
        </Button>
      </div>
    </div>
  );
};

export default NutritionResults;
