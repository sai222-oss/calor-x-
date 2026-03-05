import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface EditableIngredientProps {
  ingredient: {
    name_ar: string;
    name_en: string;
    weight_g: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onUpdate: (newWeight: number) => void;
}

export function EditableIngredient({ ingredient, onUpdate }: EditableIngredientProps) {
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

  return (
    <div className="flex flex-col p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-3 hover:shadow-md transition-shadow">
      <div className="font-bold text-[#6C63FF] text-sm mb-3">
        🥩 {ingredient.name_en} / {ingredient.name_ar}
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
        <span className="text-sm font-medium text-gray-500">grams</span>
        <span className="text-gray-400 mx-1">→</span>
        <span className="font-black text-lg" style={{ color: "#43E97B" }}>
          {Math.round(ingredient.calories)} kcal
        </span>
      </div>

      <div className="flex gap-4 text-xs font-semibold text-gray-600 bg-gray-50 p-2 rounded-lg justify-center">
        <span>Protein: {Math.round(ingredient.protein)}g</span>
        <span>Fat: {Math.round(ingredient.fat)}g</span>
        <span>Carbs: {Math.round(ingredient.carbs)}g</span>
      </div>
    </div>
  );
}
