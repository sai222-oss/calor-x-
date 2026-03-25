import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/dashboard_models.dart';

class DashboardState {
  final DailyNutrition? nutrition;
  final DailyGoals? goals;
  final List<MealLog> recentMeals;
  final ProfileData? profile;
  final bool isLoading;

  DashboardState({
    this.nutrition,
    this.goals,
    this.recentMeals = const [],
    this.profile,
    this.isLoading = true,
  });

  DashboardState copyWith({
    DailyNutrition? nutrition,
    DailyGoals? goals,
    List<MealLog>? recentMeals,
    ProfileData? profile,
    bool? isLoading,
  }) {
    return DashboardState(
      nutrition: nutrition ?? this.nutrition,
      goals: goals ?? this.goals,
      recentMeals: recentMeals ?? this.recentMeals,
      profile: profile ?? this.profile,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class DashboardViewModel extends StateNotifier<DashboardState> {
  DashboardViewModel() : super(DashboardState()) {
    loadDashboard();
  }

  Future<void> loadDashboard() async {
    // We only show full screen loading if we don't have existing cached data
    if (state.nutrition == null) {
      state = state.copyWith(isLoading: true);
    }
    
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) {
        state = state.copyWith(isLoading: false);
        return;
      }

      final todayStr = DateTime.now().toIso8601String().split('T')[0];
      final prefs = await SharedPreferences.getInstance();
      final cacheKey = 'dash_cache_${user.id}';
      
      // 1. Try to load from cache first for instant UI
      final cachedString = prefs.getString(cacheKey);
      if (cachedString != null) {
        try {
          final cachedData = jsonDecode(cachedString);
          final nutritionData = cachedData['nutrition'];
          
          // Only use cache if the date is still today
          if (nutritionData != null && nutritionData['date'] == todayStr) {
            state = state.copyWith(
              profile: cachedData['profile'] != null ? ProfileData.fromJson(cachedData['profile']) : null,
              goals: cachedData['goals'] != null ? DailyGoals.fromJson(cachedData['goals']) : null,
              nutrition: DailyNutrition.fromJson(nutritionData),
              recentMeals: (cachedData['recentMeals'] as List?)
                  ?.map((data) => MealLog.fromJson(data))
                  .toList() ?? [],
              isLoading: false,
            );
          }
        } catch (e) {
          print('Dashboard cache read error: $e');
        }
      }

      // 2. Fetch fresh data from Supabase
      final results = await Future.wait<dynamic>(<Future<dynamic>>[
        Supabase.instance.client.from('profiles').select('full_name, health_goal, onboarding_completed').eq('id', user.id).maybeSingle(),
        Supabase.instance.client.from('daily_goals').select('*').eq('user_id', user.id).maybeSingle(),
        Supabase.instance.client.from('daily_nutrition').select('*').eq('user_id', user.id).eq('date', todayStr).maybeSingle(),
        Supabase.instance.client
            .from('meal_logs')
            .select('id, dish_name, dish_name_ar, calories, protein_g, logged_at')
            .eq('user_id', user.id)
            .gte('logged_at', '${todayStr}T00:00:00')
            .order('logged_at', ascending: false)
            .limit(5),
      ]);

      // 3. Update state with fresh data
      final profileData = results[0] != null ? ProfileData.fromJson(results[0] as Map<String, dynamic>) : null;
      final dailyGoals = results[1] != null ? DailyGoals.fromJson(results[1] as Map<String, dynamic>) : null;
      final dailyNutrition = results[2] != null ? DailyNutrition.fromJson(results[2] as Map<String, dynamic>) : null;
      
      final mealLogsList = (results[3] as List)
          .map((data) => MealLog.fromJson(data))
          .toList();

      state = state.copyWith(
        profile: profileData,
        goals: dailyGoals,
        nutrition: dailyNutrition,
        recentMeals: mealLogsList,
        isLoading: false,
      );

      // 4. Save fresh raw JSON to cache
      prefs.setString(cacheKey, jsonEncode({
        'profile': results[0],
        'goals': results[1],
        'nutrition': results[2],
        'recentMeals': results[3],
      }));

    } catch (e) {
      print('Dashboard load error: $e');
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> deleteMeal(String mealId) async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      final todayStr = DateTime.now().toIso8601String().split('T')[0];

      // 1. Fetch meal to subtract values
      final mealRes = await Supabase.instance.client
          .from('meal_logs')
          .select('calories, protein_g, carbs_g, fat_g')
          .eq('id', mealId)
          .single();

      final cals = (mealRes['calories'] ?? 0).toDouble();
      final protein = (mealRes['protein_g'] ?? 0).toDouble();
      final carbs = (mealRes['carbs_g'] ?? 0).toDouble();
      final fat = (mealRes['fat_g'] ?? 0).toDouble();

      // 2. Delete meal
      await Supabase.instance.client.from('meal_logs').delete().eq('id', mealId);

      // 3. Update daily nutrition (subtract)
      final currentNutri = state.nutrition;
      if (currentNutri != null) {
        await Supabase.instance.client
            .from('daily_nutrition')
            .update({
              'total_calories': (currentNutri.totalCalories - cals).clamp(0.0, 99999.0),
              'total_protein_g': (currentNutri.totalProteinG - protein).clamp(0.0, 9999.0),
              'total_carbs_g': (currentNutri.totalCarbsG - carbs).clamp(0.0, 9999.0),
              'total_fat_g': (currentNutri.totalFatG - fat).clamp(0.0, 9999.0),
              'meals_count': (currentNutri.mealsCount - 1).clamp(0, 999),
            })
            .eq('user_id', user.id)
            .eq('date', currentNutri.date); // Use the date from the nutrition object to be safe
      }

      // 4. Reload
      await loadDashboard();
    } catch (e) {
      print('Delete meal error: $e');
    }
  }
}

final dashboardViewModelProvider = StateNotifierProvider<DashboardViewModel, DashboardState>((ref) {
  return DashboardViewModel();
});
