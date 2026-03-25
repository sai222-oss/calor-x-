class DailyNutrition {
  final String date;
  final double totalCalories;
  final double totalProteinG;
  final double totalCarbsG;
  final double totalFatG;
  final int mealsCount;

  DailyNutrition({
    required this.date,
    required this.totalCalories,
    required this.totalProteinG,
    required this.totalCarbsG,
    required this.totalFatG,
    required this.mealsCount,
  });

  factory DailyNutrition.fromJson(Map<String, dynamic> json) {
    return DailyNutrition(
      date: json['date'] ?? '',
      totalCalories: (json['total_calories'] ?? 0).toDouble(),
      totalProteinG: (json['total_protein_g'] ?? 0).toDouble(),
      totalCarbsG: (json['total_carbs_g'] ?? 0).toDouble(),
      totalFatG: (json['total_fat_g'] ?? 0).toDouble(),
      mealsCount: (json['meals_count'] ?? 0).toInt(),
    );
  }
}

class DailyGoals {
  final double caloriesTarget;
  final double proteinGTarget;
  final double carbsGTarget;
  final double fatGTarget;

  DailyGoals({
    required this.caloriesTarget,
    required this.proteinGTarget,
    required this.carbsGTarget,
    required this.fatGTarget,
  });

  factory DailyGoals.fromJson(Map<String, dynamic> json) {
    return DailyGoals(
      caloriesTarget: (json['calories_target'] ?? 2000).toDouble(),
      proteinGTarget: (json['protein_g_target'] ?? 150).toDouble(),
      carbsGTarget: (json['carbs_g_target'] ?? 200).toDouble(),
      fatGTarget: (json['fat_g_target'] ?? 65).toDouble(),
    );
  }
}

class MealLog {
  final String id;
  final String dishName;
  final String dishNameAr;
  final double calories;
  final double proteinG;
  final DateTime loggedAt;

  MealLog({
    required this.id,
    required this.dishName,
    required this.dishNameAr,
    required this.calories,
    required this.proteinG,
    required this.loggedAt,
  });

  factory MealLog.fromJson(Map<String, dynamic> json) {
    return MealLog(
      id: json['id'],
      dishName: json['dish_name'] ?? '',
      dishNameAr: json['dish_name_ar'] ?? '',
      calories: (json['calories'] ?? 0).toDouble(),
      proteinG: (json['protein_g'] ?? 0).toDouble(),
      loggedAt: DateTime.parse(json['logged_at']),
    );
  }
}

class ProfileData {
  final String fullName;
  final String healthGoal;
  final bool onboardingCompleted;
  final double? weightKg;
  final double? heightCm;
  final int? age;
  final String? activityLevel;
  final String? gender;
  final String? dietaryPreference;

  ProfileData({
    required this.fullName,
    required this.healthGoal,
    required this.onboardingCompleted,
    this.weightKg,
    this.heightCm,
    this.age,
    this.activityLevel,
    this.gender,
    this.dietaryPreference,
  });

  factory ProfileData.fromJson(Map<String, dynamic> json) {
    return ProfileData(
      fullName: json['full_name'] ?? 'Guest',
      healthGoal: json['health_goal'] ?? '',
      onboardingCompleted: json['onboarding_completed'] ?? false,
      weightKg: (json['weight_kg'] ?? json['weight'] ?? 0.0).toDouble(),
      heightCm: (json['height_cm'] ?? json['height'] ?? 0.0).toDouble(),
      age: (json['age'] ?? 0).toInt(),
      activityLevel: json['activity_level'] ?? '',
      gender: json['gender'] ?? '',
      dietaryPreference: json['dietary_preference'] ?? '',
    );
  }
}

class NutritionData {
  final String dishLabel;
  final String dishLabelAr;
  final double confidence;
  final String? imageUrl;
  final List<Ingredient> ingredients;
  final String healthTipEn;
  final String healthTipAr;
  final String? imageBase64;
  final bool matchedFromDb;

  NutritionData({
    required this.dishLabel,
    required this.dishLabelAr,
    required this.confidence,
    this.imageUrl,
    this.imageBase64,
    required this.ingredients,
    required this.healthTipEn,
    required this.healthTipAr,
    this.matchedFromDb = false,
  });

  factory NutritionData.fromJson(Map<String, dynamic> json) {
    return NutritionData(
      dishLabel: json['dish_label'] ?? json['dish_name_en'] ?? 'Food Item',
      dishLabelAr: json['dish_label_ar'] ?? json['dish_name_ar'] ?? 'طعام',
      confidence: (json['confidence'] ?? 0.0).toDouble(),
      imageUrl: json['imageUrl'],
      ingredients: (json['ingredients'] as List? ?? [])
          .map((i) => Ingredient.fromJson(i))
          .toList(),
      healthTipEn: json['health_tip_en'] ?? 'A good addition to your day.',
      healthTipAr: json['health_tip_ar'] ?? 'إضافة جيدة ليومك.',
      imageBase64: json['image_base64'],
      matchedFromDb: json['matched_from_db'] ?? false,
    );
  }

  NutritionData copyWithImageBase64(String base64, String url) {
    return NutritionData(
      dishLabel: dishLabel,
      dishLabelAr: dishLabelAr,
      confidence: confidence,
      imageUrl: url,
      imageBase64: base64,
      ingredients: ingredients,
      healthTipEn: healthTipEn,
      healthTipAr: healthTipAr,
      matchedFromDb: matchedFromDb,
    );
  }
}

class Ingredient {
  final String nameEn;
  final String nameAr;
  final double weightG;
  final double calories;
  final double protein;
  final double carbs;
  final double fat;
  final double fiber;
  final double sugar;
  final double sodium;
  final double vitA;
  final double vitC;
  final double vitD;
  final double vitB12;
  final double calcium;
  final double iron;
  final double magnesium;
  final double potassium;
  final double zinc;
  final Map<String, dynamic> per100g;

  // Standard RDI (Recommended Daily Intake) values based on typical 2000 kcal adult diet
  static const Map<String, double> RDIs = {
    'vitA': 900, // mcg
    'vitC': 90,  // mg
    'vitD': 20,  // mcg
    'vitB12': 2.4, // mcg
    'calcium': 1000, // mg
    'iron': 18, // mg
    'magnesium': 420, // mg
    'potassium': 3400, // mg
    'zinc': 11, // mg
    'sodium': 2300, // mg
    'fiber': 28, // g
    'sugar': 50, // g (max)
  };

  Ingredient({
    required this.nameEn,
    required this.nameAr,
    required this.weightG,
    required this.calories,
    required this.protein,
    required this.carbs,
    required this.fat,
    required this.fiber,
    required this.sugar,
    required this.sodium,
    required this.vitA,
    required this.vitC,
    required this.vitD,
    required this.vitB12,
    required this.calcium,
    required this.iron,
    required this.magnesium,
    required this.potassium,
    required this.zinc,
    required this.per100g,
  });

  factory Ingredient.fromJson(Map<String, dynamic> json) {
    final wG = (json['weight_g'] ?? 100).toDouble();
    final Map<String, dynamic> p100 = json['per100g'] != null 
      ? Map<String, dynamic>.from(json['per100g'])
      : {
        'protein': wG > 0 ? ((json['protein'] ?? 0) / wG) * 100 : 0,
        'carbs': wG > 0 ? ((json['carbs'] ?? 0) / wG) * 100 : 0,
        'fat': wG > 0 ? ((json['fat'] ?? 0) / wG) * 100 : 0,
        'fiber': wG > 0 ? ((json['fiber_g'] ?? json['fiber'] ?? 0) / wG) * 100 : 0,
        'sugar': wG > 0 ? ((json['sugar_g'] ?? json['sugar'] ?? 0) / wG) * 100 : 0,
        'sodium': wG > 0 ? ((json['sodium_mg'] ?? json['sodium'] ?? 0) / wG) * 100 : 0,
        'vitA': wG > 0 ? ((json['vit_a_mcg'] ?? 0) / wG) * 100 : 0,
        'vitC': wG > 0 ? ((json['vit_c_mg'] ?? 0) / wG) * 100 : 0,
        'vitD': wG > 0 ? ((json['vit_d_mcg'] ?? 0) / wG) * 100 : 0,
        'vitB12': wG > 0 ? ((json['vit_b12_mcg'] ?? 0) / wG) * 100 : 0,
        'calcium': wG > 0 ? ((json['calcium_mg'] ?? 0) / wG) * 100 : 0,
        'iron': wG > 0 ? ((json['iron_mg'] ?? 0) / wG) * 100 : 0,
        'magnesium': wG > 0 ? ((json['magnesium_mg'] ?? 0) / wG) * 100 : 0,
        'potassium': wG > 0 ? ((json['potassium_mg'] ?? 0) / wG) * 100 : 0,
        'zinc': wG > 0 ? ((json['zinc_mg'] ?? 0) / wG) * 100 : 0,
      };

    return Ingredient(
      nameEn: json['name_en'] ?? '',
      nameAr: json['name_ar'] ?? '',
      weightG: wG,
      calories: (json['calories'] ?? 0).toDouble(),
      protein: (json['protein'] ?? 0).toDouble(),
      carbs: (json['carbs'] ?? 0).toDouble(),
      fat: (json['fat'] ?? 0).toDouble(),
      fiber: (json['fiber_g'] ?? json['fiber'] ?? 0).toDouble(),
      sugar: (json['sugar_g'] ?? json['sugar'] ?? 0).toDouble(),
      sodium: (json['sodium_mg'] ?? json['sodium'] ?? 0).toDouble(),
      vitA: (json['vit_a_mcg'] ?? 0).toDouble(),
      vitC: (json['vit_c_mg'] ?? 0).toDouble(),
      vitD: (json['vit_d_mcg'] ?? 0).toDouble(),
      vitB12: (json['vit_b12_mcg'] ?? 0).toDouble(),
      calcium: (json['calcium_mg'] ?? 0).toDouble(),
      iron: (json['iron_mg'] ?? 0).toDouble(),
      magnesium: (json['magnesium_mg'] ?? 0).toDouble(),
      potassium: (json['potassium_mg'] ?? 0).toDouble(),
      zinc: (json['zinc_mg'] ?? 0).toDouble(),
      per100g: p100,
    );
  }

  Ingredient copyWithWeight(double newWeight) {
    final ratio = newWeight / 100;
    return Ingredient(
      nameEn: nameEn,
      nameAr: nameAr,
      weightG: newWeight,
      calories: (per100g['calories'] ?? 0).toDouble() * ratio,
      protein: (per100g['protein'] ?? 0).toDouble() * ratio,
      carbs: (per100g['carbs'] ?? 0).toDouble() * ratio,
      fat: (per100g['fat'] ?? 0).toDouble() * ratio,
      fiber: (per100g['fiber'] ?? 0).toDouble() * ratio,
      sugar: (per100g['sugar'] ?? 0).toDouble() * ratio,
      sodium: (per100g['sodium'] ?? 0).toDouble() * ratio,
      vitA: (per100g['vitA'] ?? 0).toDouble() * ratio,
      vitC: (per100g['vitC'] ?? 0).toDouble() * ratio,
      vitD: (per100g['vitD'] ?? 0).toDouble() * ratio,
      vitB12: (per100g['vitB12'] ?? 0).toDouble() * ratio,
      calcium: (per100g['calcium'] ?? 0).toDouble() * ratio,
      iron: (per100g['iron'] ?? 0).toDouble() * ratio,
      magnesium: (per100g['magnesium'] ?? 0).toDouble() * ratio,
      potassium: (per100g['potassium'] ?? 0).toDouble() * ratio,
      zinc: (per100g['zinc'] ?? 0).toDouble() * ratio,
      per100g: per100g,
    );
  }
}
