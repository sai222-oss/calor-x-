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

    // Fallback logic for single-ingredient or missing dish names
    const fallbackNameEn = matchedData.ingredients?.[0]?.name_en || "Food Item";
    const fallbackNameAr = matchedData.ingredients?.[0]?.name_ar || "طعام";

    const normalizedData = {
      ...matchedData,
      dish_label: matchedData.dish_name_en || matchedData.dish_label || fallbackNameEn,
      dish_label_ar: matchedData.dish_name_ar || matchedData.dish_label_ar || fallbackNameAr,
      confidence: matchedData.confidence || (matchedData.confidence_score ? matchedData.confidence_score / 100 : 0.9),
      ingredients: matchedData.ingredients || [],
      total: matchedData.total || matchedData.total_nutrition,
      health_tip_en: matchedData.health_tip_en || matchedData.gym_tip || "A good addition to your day.",
      health_tip_ar: matchedData.health_tip_ar || matchedData.gym_tip_ar || "إضافة جيدة ليومك.",
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
          fiber: ing.fiber ? (ing.fiber / ing.weight_g) * 100 : 0,
          sugar: ing.sugar ? (ing.sugar / ing.weight_g) * 100 : 0,
          sodium: ing.sodium ? (ing.sodium / ing.weight_g) * 100 : 0,
          vitamin_c_mg: ing.vitamin_c_mg ? (ing.vitamin_c_mg / ing.weight_g) * 100 : 0,
          calcium_mg: ing.calcium_mg ? (ing.calcium_mg / ing.weight_g) * 100 : 0,
          iron_mg: ing.iron_mg ? (ing.iron_mg / ing.weight_g) * 100 : 0,
        };
      } else if (!per100g) {
        per100g = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, vitamin_c_mg: 0, calcium_mg: 0, iron_mg: 0 };
      }
      return { ...ing, per100g, name_ar: ing.name_ar || fallbackNameAr, name_en: ing.name_en || fallbackNameEn };
    }));

    if ((normalizedData.total?.calories || 0) > 3500 || (normalizedData.confidence || 0) < 0.7) {
      if (!isDbMatch) setShowPortionDialog(true);
    }
  }, [location.state, navigate]);

  const handlePortionConfirm = (multiplier: number) => {
    if (!editableIngredients.length) return;
    const adjusted = editableIngredients.map(ing => {
      const newWeight = ing.weight_g * multiplier;
      const ratio = newWeight / 100;
      return {
        ...ing,
        weight_g: newWeight,
        calories: ing.per100g.calories * ratio,
        protein: ing.per100g.protein * ratio,
        carbs: ing.per100g.carbs * ratio,
        fat: ing.per100g.fat * ratio,
        fiber: ing.per100g.fiber ? ing.per100g.fiber * ratio : 0,
        sugar: ing.per100g.sugar ? ing.per100g.sugar * ratio : 0,
        sodium: ing.per100g.sodium ? ing.per100g.sodium * ratio : 0,
        vitamin_c_mg: ing.per100g.vitamin_c_mg ? ing.per100g.vitamin_c_mg * ratio : 0,
        calcium_mg: ing.per100g.calcium_mg ? ing.per100g.calcium_mg * ratio : 0,
        iron_mg: ing.per100g.iron_mg ? ing.per100g.iron_mg * ratio : 0,
      };
    });
    setEditableIngredients(adjusted);
  };

  const handleIngredientUpdate = (index: number, newWeight: number) => {
    const updatedIngredients = [...editableIngredients];
    const item = updatedIngredients[index];
    const ratio = newWeight / 100;

    updatedIngredients[index] = {
      ...item,
      weight_g: newWeight,
      calories: item.per100g.calories * ratio,
      protein: item.per100g.protein * ratio,
      carbs: item.per100g.carbs * ratio,
      fat: item.per100g.fat * ratio,
      fiber: item.per100g.fiber ? item.per100g.fiber * ratio : 0,
      sugar: item.per100g.sugar ? item.per100g.sugar * ratio : 0,
      sodium: item.per100g.sodium ? item.per100g.sodium * ratio : 0,
      vitamin_c_mg: item.per100g.vitamin_c_mg ? item.per100g.vitamin_c_mg * ratio : 0,
      calcium_mg: item.per100g.calcium_mg ? item.per100g.calcium_mg * ratio : 0,
      iron_mg: item.per100g.iron_mg ? item.per100g.iron_mg * ratio : 0,
    };

    setEditableIngredients(updatedIngredients);
  };

  const handleAddIngredientSubmit = () => {
    if (!selectedFood) return;
    const weight = parseFloat(manualWeight) || selectedFood.typical_serving_g;
    const ratio = weight / 100;

    const per100g = selectedFood.per100g as any;

    const newIngredient = {
      name_ar: selectedFood.name_ar,
      name_en: selectedFood.name_en,
      weight_g: weight,
      calories: per100g.calories * ratio,
      protein: per100g.protein * ratio,
      carbs: per100g.carbs * ratio,
      fat: per100g.fat * ratio,
      fiber: per100g.fiber ? per100g.fiber * ratio : 0,
      sugar: per100g.sugar ? per100g.sugar * ratio : 0,
      sodium: per100g.sodium ? per100g.sodium * ratio : 0,
      vitamin_c_mg: per100g.vitamin_c_mg ? per100g.vitamin_c_mg * ratio : 0,
      calcium_mg: per100g.calcium_mg ? per100g.calcium_mg * ratio : 0,
      iron_mg: per100g.iron_mg ? per100g.iron_mg * ratio : 0,
      per100g: per100g
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
      acc.fiber_g += ing.fiber || 0;
      acc.sugar_g += ing.sugar || 0;
      acc.sodium_mg += ing.sodium || 0;
      acc.vitamin_c_mg += ing.vitamin_c_mg || 0;
      acc.calcium_mg += ing.calcium_mg || 0;
      acc.iron_mg += ing.iron_mg || 0;
      return acc;
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0, sodium_mg: 0, vitamin_c_mg: 0, calcium_mg: 0, iron_mg: 0 }
  );

  const handleSaveMeal = async () => {
    if (!nutritionData) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toISOString();

      // 1. Insert Meal Log
      const { error: mealError } = await supabase.from('meal_logs').insert({
        user_id: user.id,
        dish_name: nutritionData.dish_label,
        dish_name_ar: nutritionData.dish_label_ar,
        image_url: nutritionData.imageUrl,
        calories: currentTotals.calories,
        protein_g: currentTotals.protein_g,
        carbs_g: currentTotals.carbs_g,
        fat_g: currentTotals.fat_g,
        fiber_g: currentTotals.fiber_g,
        sugar_g: currentTotals.sugar_g,
        sodium_mg: currentTotals.sodium_mg,
        ingredients: editableIngredients,
        logged_at: now,
      } as any);

      if (mealError) throw mealError;

      // 2. Upsert Daily Nutrition
      const { data: currentDaily } = await supabase
        .from('daily_nutrition')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      const newTotals = {
        user_id: user.id,
        date: today,
        total_calories: (currentDaily?.total_calories || 0) + currentTotals.calories,
        total_protein_g: (currentDaily?.total_protein_g || 0) + currentTotals.protein_g,
        total_carbs_g: (currentDaily?.total_carbs_g || 0) + currentTotals.carbs_g,
        total_fat_g: (currentDaily?.total_fat_g || 0) + currentTotals.fat_g,
        total_fiber_g: (currentDaily?.total_fiber_g || 0) + currentTotals.fiber_g,
        total_sugar_g: (currentDaily?.total_sugar_g || 0) + currentTotals.sugar_g,
        total_sodium_mg: (currentDaily?.total_sodium_mg || 0) + currentTotals.sodium_mg,
        meals_count: (currentDaily?.meals_count || 0) + 1,
      };

      if (currentDaily?.id) {
        await supabase.from('daily_nutrition').update(newTotals).eq('id', currentDaily.id);
      } else {
        await supabase.from('daily_nutrition').insert(newTotals as any);
      }

      toast.success(t("res_save_success"));
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(t("res_save_error"));
    } finally { setSaving(false); }
  };

  if (!nutritionData) return null;

  const confidenceValue = nutritionData.matched_from_db ? 1 : nutritionData.confidence;
  const confidence = Math.round((confidenceValue || 0) * 100);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-28 relative">
      <PortionConfirmDialog
        open={showPortionDialog}
        onConfirm={handlePortionConfirm}
        onReanalyze={() => navigate('/scan')}
        onClose={() => setShowPortionDialog(false)}
        totalCalories={currentTotals.calories}
      />

      {/* Top Image Section */}
      <div className="relative w-full h-[35vh]">
        {nutritionData.imageUrl ? (
          <img src={nutritionData.imageUrl} alt="Food" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/50 to-transparent" />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-12 left-4 text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Bottom Card Container */}
      <div className="relative z-10 -mt-8 bg-[#F8F9FA] rounded-t-[32px] w-full min-h-[70vh] px-6 pt-8 pb-32 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">

        {/* Title and Controls Header */}
        <div className="flex justify-between items-start mb-6 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-white border-0 shadow-sm text-[10px] uppercase font-bold" style={{ color: "#6C63FF" }}>
                {nutritionData.matched_from_db ? t("res_high_accuracy_db_match") : t("res_confidence", { n: confidence })}
              </Badge>
              {nutritionData.cached && !nutritionData.matched_from_db && (
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{t("res_cached")}</span>
              )}
            </div>
            <h2 className="text-[26px] leading-tight font-black text-gray-900 tracking-tight line-clamp-2">
              {lang === "ar" ? nutritionData.dish_label_ar : nutritionData.dish_label}
            </h2>
          </div>
          <div className="flex items-center bg-white rounded-full border border-gray-100 shadow-sm p-1 mt-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-black" onClick={() => handlePortionConfirm(0.9)}>
              <span className="text-xl font-bold leading-none">−</span>
            </Button>
            <span className="w-8 text-center font-bold text-gray-900 select-none">1</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-black" onClick={() => handlePortionConfirm(1.1)}>
              <span className="text-xl font-bold leading-none">+</span>
            </Button>
          </div>
        </div>

        {/* Categories / Pill Layout */}
        <div className="space-y-3 mb-6">

          {/* Main Calories Pill */}
          <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-gray-800 fill-gray-800" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">{t("res_calories")}</p>
              <p className="text-3xl font-black text-gray-900 leading-none">{Math.round(currentTotals.calories)}</p>
            </div>
          </div>

          {/* Macros Group */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-50 flex flex-col justify-between min-h-[100px]">
              <div className="flex items-center gap-1.5 mb-2">
                <Dumbbell className="w-4 h-4 text-red-500 fill-red-500/20" />
                <span className="text-[11px] text-gray-500 font-medium truncate">{t("res_protein_g")}</span>
              </div>
              <p className="text-xl font-black text-gray-900 leading-none">{Math.round(currentTotals.protein_g)}<span className="text-sm font-bold text-gray-400 ml-0.5">g</span></p>
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-50 flex flex-col justify-between min-h-[100px]">
              <div className="flex items-center gap-1.5 mb-2">
                <Activity className="w-4 h-4 text-orange-500 fill-orange-500/20" />
                <span className="text-[11px] text-gray-500 font-medium truncate">{t("res_carbs_g")}</span>
              </div>
              <p className="text-xl font-black text-gray-900 leading-none">{Math.round(currentTotals.carbs_g)}<span className="text-sm font-bold text-gray-400 ml-0.5">g</span></p>
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-50 flex flex-col justify-between min-h-[100px]">
              <div className="flex items-center gap-1.5 mb-2">
                <Droplets className="w-4 h-4 text-blue-500 fill-blue-500/20" />
                <span className="text-[11px] text-gray-500 font-medium truncate">{t("res_fat_g")}</span>
              </div>
              <p className="text-xl font-black text-gray-900 leading-none">{Math.round(currentTotals.fat_g)}<span className="text-sm font-bold text-gray-400 ml-0.5">g</span></p>
            </div>
          </div>

          {/* Detailed Macros (Fiber, Sugar, Sodium) if applicable */}
          {(currentTotals.fiber_g > 0 || currentTotals.sugar_g > 0 || currentTotals.sodium_mg > 0) && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: t("res_fiber_g"), val: Math.round(currentTotals.fiber_g), unit: "g" },
                { label: t("res_sugar_g"), val: Math.round(currentTotals.sugar_g), unit: "g" },
                { label: t("res_sodium_mg"), val: Math.round(currentTotals.sodium_mg), unit: "mg" }
              ].map(m => m.val > 0 && (
                <div key={m.label} className="bg-gray-100/50 p-3 rounded-2xl flex flex-col items-center justify-center border border-gray-100 shadow-sm">
                  <p className="text-sm font-bold text-gray-700">{m.val}<span className="text-[10px] text-gray-500 ml-0.5">{m.unit}</span></p>
                  <p className="text-[10px] text-gray-500 font-medium uppercase mt-0.5 truncate w-full text-center">{m.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Health Score / Tip Pill */}
          {((nutritionData as any).health_tip_ar || (nutritionData as any).health_tip_en || (nutritionData as any).gym_tip || (nutritionData as any).gym_tip_ar) && (
            <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-50 mt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-pink-100 p-1.5 rounded-lg">
                    <Zap className="w-4 h-4 text-pink-500 fill-pink-500" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{t("res_health_insights")}</span>
                </div>
                {/* Visual Fake Score Bar like Cal AI */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    {currentTotals.protein_g > 15 ? '8/10' : '6/10'}
                  </span>
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: currentTotals.protein_g > 15 ? '80%' : '60%' }} />
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">
                {lang === "ar"
                  ? ((nutritionData as any).health_tip_ar || (nutritionData as any).gym_tip_ar || (nutritionData as any).health_tip_en)
                  : ((nutritionData as any).health_tip_en || (nutritionData as any).gym_tip || (nutritionData as any).health_tip_ar)}
              </p>
            </div>
          )}

          {/* Vitamins Group if applicable */}
          {(currentTotals.vitamin_c_mg > 0 || currentTotals.calcium_mg > 0 || currentTotals.iron_mg > 0) && (
            <div className="bg-white rounded-3xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-gray-50 mt-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t("res_vitamins")}</h3>
              <div className="flex gap-3">
                {currentTotals.vitamin_c_mg > 0 && (
                  <div className="flex-1 bg-yellow-50/50 border border-yellow-100 p-3 rounded-2xl text-center">
                    <p className="text-yellow-700 font-bold">{Math.round(currentTotals.vitamin_c_mg)}mg</p>
                    <p className="text-[10px] text-yellow-600/70 font-bold mt-0.5">Vit C</p>
                  </div>
                )}
                {currentTotals.calcium_mg > 0 && (
                  <div className="flex-1 bg-blue-50/50 border border-blue-100 p-3 rounded-2xl text-center">
                    <p className="text-blue-700 font-bold">{Math.round(currentTotals.calcium_mg)}mg</p>
                    <p className="text-[10px] text-blue-600/70 font-bold mt-0.5">Calcium</p>
                  </div>
                )}
                {currentTotals.iron_mg > 0 && (
                  <div className="flex-1 bg-red-50/50 border border-red-100 p-3 rounded-2xl text-center">
                    <p className="text-red-700 font-bold">{Math.round(currentTotals.iron_mg)}mg</p>
                    <p className="text-[10px] text-red-600/70 font-bold mt-0.5">Iron</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Ingredients Breakdowns (More Data) */}
        <div className="mt-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">{t("res_adjust_portions")} / {t("res_ingredients")}</h3>
          <div className="space-y-2">
            {editableIngredients.map((ing, idx) => (
              <EditableIngredient
                key={idx}
                ingredient={ing}
                onUpdate={(val) => handleIngredientUpdate(idx, val)}
              />
            ))}
          </div>

          <div className="mt-4">
            <Button variant="outline" className="w-full rounded-2xl py-6 font-bold text-[#6C63FF] border border-dashed border-[#6C63FF]/30 bg-transparent hover:bg-[#6C63FF]/5" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" /> {t("res_add_hidden_ingredient")}
            </Button>
          </div>
        </div>
      </div>

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

      {/* Floating Action Bar (Cal AI Style) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 pb-8 flex items-center justify-between gap-3 z-50 shadow-[0_-10px_40px_rgb(0,0,0,0.05)]">
        <Button
          variant="outline"
          className="flex-1 py-7 rounded-full font-bold text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 shadow-sm flex items-center gap-2"
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
        >
          <span className="text-lg">✨</span> Fix Results
        </Button>
        <Button
          className="flex-1 py-7 rounded-full text-lg font-bold shadow-xl bg-gradient-to-r from-gray-900 to-black text-white hover:opacity-90 transition-opacity"
          onClick={handleSaveMeal}
          disabled={saving}
        >
          {saving ? '...' : 'Done'}
        </Button>
      </div>
    </div>
  );
};

export default NutritionResults;
