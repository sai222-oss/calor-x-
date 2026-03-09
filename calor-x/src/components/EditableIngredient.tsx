import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';

interface EditableIngredientProps {
  ingredient: {
    name_ar: string;
    name_en: string;
    weight_g: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    vitamin_c_mg?: number;
    calcium_mg?: number;
    iron_mg?: number;
  };
  onUpdate: (newWeight: number) => void;
}

export function EditableIngredient({ ingredient, onUpdate }: EditableIngredientProps) {
  const { t, lang } = useLanguage();
  const [weight, setWeight] = useState(ingredient.weight_g.toString());

  useEffect(() => {
    setWeight(ingredient.weight_g.toString());
  }, [ingredient.weight_g]);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setWeight(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      onUpdate(num);
    }
  };

  const hasMicros = ingredient.vitamin_c_mg || ingredient.calcium_mg || ingredient.iron_mg;

  return (
    <div className="flex flex-col p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-3 hover:shadow-md transition-shadow">
      <div className="font-bold text-[#6C63FF] text-sm mb-3">
        🥩 {lang === 'ar' ? ingredient.name_ar || ingredient.name_en : ingredient.name_en || ingredient.name_ar}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">[</span>
          <Input
            type="number"
            value={weight}
            onChange={handleWeightChange}
            className="w-20 h-9 text-center font-bold text-lg bg-gray-50 border-gray-200 focus-visible:ring-[#6C63FF]"
            min="0"
          />
          <span className="text-gray-400 ml-2">]</span>
        </div>
        <span className="text-sm font-medium text-gray-500">{t("scan_grams") || "g"}</span>
        <span className="text-gray-400 mx-1">→</span>
        <span className="font-black text-lg" style={{ color: "#6C63FF" }}>
          {Math.round(ingredient.calories)} {t("dash_kcal") || "kcal"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-2 text-xs font-semibold text-gray-600 bg-gray-50 p-2 rounded-lg justify-center">
        <span>{t("res_protein_g") || "Protein"}: {Math.round(ingredient.protein)}g</span>
        <span>{t("res_fat_g") || "Fat"}: {Math.round(ingredient.fat)}g</span>
        <span>{t("res_carbs_g") || "Carbs"}: {Math.round(ingredient.carbs)}g</span>
      </div>

      {hasMicros ? (
        <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-[#6C63FF]/80 justify-center">
          {ingredient.vitamin_c_mg ? <span>Vit C: {Math.round(ingredient.vitamin_c_mg)}mg</span> : null}
          {ingredient.calcium_mg ? <span>Calcium: {Math.round(ingredient.calcium_mg)}mg</span> : null}
          {ingredient.iron_mg ? <span>Iron: {Math.round(ingredient.iron_mg)}mg</span> : null}
        </div>
      ) : null}
    </div>
  );
}
