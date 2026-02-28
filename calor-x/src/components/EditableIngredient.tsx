import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EditableIngredientProps {
  ingredient: {
    db_id?: string;
    name: string;
    name_ar: string;
    quantity_g: number;
    confidence: number;
    nutrition_per_100g: {
      calories: number;
      protein_g: number;
      fat_g: number;
      carbs_g: number;
      fiber_g: number;
      sugar_g: number;
      sodium_mg: number;
    };
    nutrition: {
      calories: number;
      protein_g: number;
      fat_g: number;
      carbs_g: number;
      fiber_g: number;
      sugar_g: number;
      sodium_mg: number;
    };
    vitamins_minerals?: Record<string, number>;
  };
  onUpdate: (newWeight: number) => void;
}

export function EditableIngredient({ ingredient, onUpdate }: EditableIngredientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState(ingredient.quantity_g);

  const handleSave = () => {
    if (weight > 0 && weight !== ingredient.quantity_g) {
      onUpdate(weight);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setWeight(ingredient.quantity_g);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{ingredient.name}</p>
          <Badge variant="outline" className="text-xs">
            {ingredient.confidence}%
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{ingredient.name_ar}</p>
        <div className="flex items-center gap-2 mt-1">
          {isEditing ? (
            <>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-20 h-8 text-sm"
                min="1"
                step="10"
              />
              <span className="text-sm text-muted-foreground">g</span>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancel}>
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm font-medium">{ingredient.quantity_g}g</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{ingredient.nutrition.calories} kcal</p>
        <p className="text-xs text-muted-foreground">
          P: {ingredient.nutrition.protein_g}g · C: {ingredient.nutrition.carbs_g}g · F: {ingredient.nutrition.fat_g}g
        </p>
      </div>
    </div>
  );
}
