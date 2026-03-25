import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/dashboard_models.dart';

class NutritionResultsState {
  final NutritionData? data;
  final List<Ingredient> editableIngredients;
  final bool isSaving;
  final bool isFixing;
  final String? error;

  NutritionResultsState({
    this.data,
    this.editableIngredients = const [],
    this.isSaving = false,
    this.isFixing = false,
    this.error,
  });

  NutritionResultsState copyWith({
    NutritionData? data,
    List<Ingredient>? editableIngredients,
    bool? isSaving,
    bool? isFixing,
    String? error,
  }) {
    return NutritionResultsState(
      data: data ?? this.data,
      editableIngredients: editableIngredients ?? this.editableIngredients,
      isSaving: isSaving ?? this.isSaving,
      isFixing: isFixing ?? this.isFixing,
      error: error ?? this.error,
    );
  }

  double get totalCalories => editableIngredients.fold(0, (sum, item) => sum + item.calories);
  double get totalProtein => editableIngredients.fold(0, (sum, item) => sum + item.protein);
  double get totalCarbs => editableIngredients.fold(0, (sum, item) => sum + item.carbs);
  double get totalFat => editableIngredients.fold(0, (sum, item) => sum + item.fat);
  double get totalWeight => editableIngredients.fold(0, (sum, item) => sum + item.weightG);

  double get totalFiber => editableIngredients.fold(0, (sum, item) => sum + item.fiber);
  double get totalSugar => editableIngredients.fold(0, (sum, item) => sum + item.sugar);
  double get totalSodium => editableIngredients.fold(0, (sum, item) => sum + item.sodium);
  double get totalVitA => editableIngredients.fold(0, (sum, item) => sum + item.vitA);
  double get totalVitC => editableIngredients.fold(0, (sum, item) => sum + item.vitC);
  double get totalVitD => editableIngredients.fold(0, (sum, item) => sum + item.vitD);
  double get totalVitB12 => editableIngredients.fold(0, (sum, item) => sum + item.vitB12);
  double get totalCalcium => editableIngredients.fold(0, (sum, item) => sum + item.calcium);
  double get totalIron => editableIngredients.fold(0, (sum, item) => sum + item.iron);
  double get totalMagnesium => editableIngredients.fold(0, (sum, item) => sum + item.magnesium);
  double get totalPotassium => editableIngredients.fold(0, (sum, item) => sum + item.potassium);
  double get totalZinc => editableIngredients.fold(0, (sum, item) => sum + item.zinc);

  double getRDIWeight(String key) => Ingredient.RDIs[key] ?? 1.0;
  double getRDIPercent(String key, double value) => (value / getRDIWeight(key)).clamp(0, 1.0);
}

class NutritionResultsViewModel extends StateNotifier<NutritionResultsState> {
  NutritionResultsViewModel() : super(NutritionResultsState());

  void init(NutritionData data) {
    state = state.copyWith(data: data, editableIngredients: data.ingredients);
  }

  void updateIngredientWeight(int index, double newWeight) {
    if (index < 0 || index >= state.editableIngredients.length) return;
    
    final updated = List<Ingredient>.from(state.editableIngredients);
    updated[index] = updated[index].copyWithWeight(newWeight);
    state = state.copyWith(editableIngredients: updated);
  }

  void adjustAllPortions(double multiplier) {
    final updated = state.editableIngredients.map((ing) => ing.copyWithWeight(ing.weightG * multiplier)).toList();
    state = state.copyWith(editableIngredients: updated);
  }

  void updateTotalWeight(double newTotal) {
    final currentTotal = state.totalWeight;
    if (currentTotal <= 0) return;
    
    final multiplier = newTotal / currentTotal;
    adjustAllPortions(multiplier);
  }

  Future<bool> saveMeal() async {
    if (state.data == null) return false;
    state = state.copyWith(isSaving: true, error: null);
    
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) throw Exception('err_not_logged_in'.tr());

      final todayStr = DateTime.now().toIso8601String().split('T')[0];
      final nowStr = DateTime.now().toIso8601String();

      // 1. Insert Meal Log
      await Supabase.instance.client.from('meal_logs').insert({
        'user_id': user.id,
        'dish_name': state.data!.dishLabel,
        'dish_name_ar': state.data!.dishLabelAr,
        'image_url': state.data!.imageUrl,
        'calories': state.totalCalories,
        'protein_g': state.totalProtein,
        'carbs_g': state.totalCarbs,
        'fat_g': state.totalFat,
        'ingredients': state.editableIngredients.map((ing) => {
          'name_en': ing.nameEn,
          'name_ar': ing.nameAr,
          'weight_g': ing.weightG,
          'calories': ing.calories,
          'protein': ing.protein,
          'carbs': ing.carbs,
          'fat': ing.fat,
          'per100g': ing.per100g,
        }).toList(),
        'logged_at': nowStr,
      });

      // 2. Update Daily Nutrition (simplified upsert logic parity)
      final existingDaily = await Supabase.instance.client
          .from('daily_nutrition')
          .select()
          .eq('user_id', user.id)
          .eq('date', todayStr)
          .maybeSingle();

      if (existingDaily != null) {
        await Supabase.instance.client.from('daily_nutrition').update({
          'total_calories': (existingDaily['total_calories'] ?? 0) + state.totalCalories,
          'total_protein_g': (existingDaily['total_protein_g'] ?? 0) + state.totalProtein,
          'total_carbs_g': (existingDaily['total_carbs_g'] ?? 0) + state.totalCarbs,
          'total_fat_g': (existingDaily['total_fat_g'] ?? 0) + state.totalFat,
          'meals_count': (existingDaily['meals_count'] ?? 0) + 1,
        }).eq('id', existingDaily['id']);
      } else {
        await Supabase.instance.client.from('daily_nutrition').insert({
          'user_id': user.id,
          'date': todayStr,
          'total_calories': state.totalCalories,
          'total_protein_g': state.totalProtein,
          'total_carbs_g': state.totalCarbs,
          'total_fat_g': state.totalFat,
          'meals_count': 1,
        });
      }

      state = state.copyWith(isSaving: false);
      return true;
    } catch (e) {
      state = state.copyWith(isSaving: false, error: e.toString());
      return false;
    }
  }

  Future<bool> fixAnalysis(String correction) async {
    if (state.data == null || state.data!.imageBase64 == null) return false;
    state = state.copyWith(isFixing: true, error: null);

    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) throw Exception('err_not_logged_in'.tr());

      final res = await Supabase.instance.client.functions.invoke('analyze-food', body: {
        'imageBase64': state.data!.imageBase64,
        'userId': user.id,
        'correction': correction,
      });

      if (res.status != 200) {
        throw Exception(res.data['error'] ?? 'err_analysis_failed'.tr());
      }

      final newData = NutritionData.fromJson(res.data).copyWithImageBase64(state.data!.imageBase64!, state.data!.imageUrl ?? '');
      state = state.copyWith(data: newData, editableIngredients: newData.ingredients, isFixing: false);
      return true;
    } catch (e) {
      state = state.copyWith(isFixing: false, error: e.toString());
      return false;
    }
  }
}

final nutritionResultsViewModelProvider = StateNotifierProvider<NutritionResultsViewModel, NutritionResultsState>((ref) {
  return NutritionResultsViewModel();
});
