import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../dashboard/data/dashboard_models.dart';

enum ProgressPeriod { daily, weekly, monthly }

class ProgressDay {
  final String date;
  final String dayLabel;
  final String dayLabelEn;
  final double calories;
  final double protein;
  final double carbs;
  final double fat;

  ProgressDay({
    required this.date,
    required this.dayLabel,
    required this.dayLabelEn,
    required this.calories,
    required this.protein,
    required this.carbs,
    required this.fat,
  });
}

class ProgressState {
  final List<ProgressDay> chartData;
  final int streak;
  final int totalMeals;
  final DailyGoals? goals;
  final DailyNutrition? todayTotals;
  final ProgressPeriod period;
  final bool isLoading;
  final String? error;
  final double periodTotalCalories;
  final double periodTotalProtein;
  final double periodTotalCarbs;
  final double periodTotalFat;

  ProgressState({
    this.chartData = const [],
    this.streak = 0,
    this.totalMeals = 0,
    this.goals,
    this.todayTotals,
    this.period = ProgressPeriod.daily,
    this.isLoading = false,
    this.error,
    this.periodTotalCalories = 0, // Added
    this.periodTotalProtein = 0, // Added
    this.periodTotalCarbs = 0, // Added
    this.periodTotalFat = 0, // Added
  });

  ProgressState copyWith({
    List<ProgressDay>? chartData,
    int? streak,
    int? totalMeals,
    DailyGoals? goals,
    DailyNutrition? todayTotals,
    ProgressPeriod? period,
    bool? isLoading,
    String? error,
    double? periodTotalCalories, // Added
    double? periodTotalProtein, // Added
    double? periodTotalCarbs, // Added
    double? periodTotalFat, // Added
  }) {
    return ProgressState(
      chartData: chartData ?? this.chartData,
      streak: streak ?? this.streak,
      totalMeals: totalMeals ?? this.totalMeals,
      goals: goals ?? this.goals,
      todayTotals: todayTotals ?? this.todayTotals,
      period: period ?? this.period,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      periodTotalCalories: periodTotalCalories ?? this.periodTotalCalories, // Added
      periodTotalProtein: periodTotalProtein ?? this.periodTotalProtein, // Added
      periodTotalCarbs: periodTotalCarbs ?? this.periodTotalCarbs, // Added
      periodTotalFat: periodTotalFat ?? this.periodTotalFat, // Added
    );
  }
}

class ProgressViewModel extends StateNotifier<ProgressState> {
  ProgressViewModel() : super(ProgressState());

  static const List<String> DAY_LABELS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  static const List<String> DAY_LABELS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  void setPeriod(ProgressPeriod p) {
    state = state.copyWith(period: p);
    fetchProgress();
  }

  Future<void> fetchProgress() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    state = state.copyWith(isLoading: true, error: null);
    try {
      final now = DateTime.now();
      List<String> dates = [];
      
      if (state.period == ProgressPeriod.daily) {
        for (int i = 6; i >= 0; i--) {
          dates.add(DateTime(now.year, now.month, now.day).subtract(Duration(days: i)).toIso8601String().split('T')[0]);
        }
      } else if (state.period == ProgressPeriod.weekly) {
        // Last 4 weeks
        for (int i = 3; i >= 0; i--) {
           final d = DateTime(now.year, now.month, now.day).subtract(Duration(days: now.weekday - 1 + (i * 7)));
           dates.add(d.toIso8601String().split('T')[0]);
        }
      }

      final responses = await Future.wait<dynamic>(<Future<dynamic>>[
        Supabase.instance.client.from('daily_goals').select('*').eq('user_id', user.id).maybeSingle(),
        Supabase.instance.client.from('daily_nutrition').select('*').eq('user_id', user.id).order('date', ascending: false).limit(30),
        Supabase.instance.client.from('meal_logs').select('id').eq('user_id', user.id),
      ]);

      final goalsData = responses[0] != null ? DailyGoals.fromJson(responses[0] as Map<String, dynamic>) : null;
      final nutritionRows = (responses[1] as List).map((r) => DailyNutrition.fromJson(r as Map<String, dynamic>)).toList();
      final totalMealsCount = (responses[2] as List).length;

      List<ProgressDay> chartData = [];
      if (state.period == ProgressPeriod.daily) {
        chartData = dates.map((date) {
          final row = nutritionRows.firstWhere((r) => r.date == date, orElse: () => DailyNutrition(date: date, totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0, mealsCount: 0));
          final dt = DateTime.parse(date);
          return ProgressDay(
            date: date,
            dayLabel: DAY_LABELS_AR[dt.weekday % 7],
            dayLabelEn: DAY_LABELS_EN[dt.weekday % 7],
            calories: row.totalCalories,
            protein: row.totalProteinG,
            carbs: row.totalCarbsG, // Added
            fat: row.totalFatG, // Added
          );
        }).toList();
      } else {
        // Simplified Weekly/Monthly for now
        chartData = nutritionRows.take(7).map((row) {
          final dt = DateTime.parse(row.date);
          return ProgressDay(
            date: row.date,
            dayLabel: "${dt.day}/${dt.month}",
            dayLabelEn: "${dt.day}/${dt.month}",
            calories: row.totalCalories,
            protein: row.totalProteinG,
            carbs: row.totalCarbsG, // Added
            fat: row.totalFatG, // Added
          );
        }).toList().reversed.toList();
      }

      final todayStr = now.toIso8601String().split('T')[0];
      final todayTotals = nutritionRows.firstWhere((r) => r.date == todayStr, orElse: () => DailyNutrition(date: todayStr, totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0, mealsCount: 0));

      int streak = 0;
      for (final row in nutritionRows) {
        if (row.totalCalories > 0) streak++;
        else break;
      }

      // Calculate period totals
      double sumCals = 0;
      double sumProt = 0;
      double sumCarb = 0;
      double sumFat = 0;

      for (var d in chartData) { // Use chartData which is already filtered by period logic
        sumCals += d.calories;
        sumProt += d.protein;
        sumCarb += d.carbs;
        sumFat += d.fat;
      }

      state = state.copyWith(
        chartData: chartData,
        streak: streak,
        totalMeals: totalMealsCount,
        goals: goalsData,
        todayTotals: todayTotals,
        periodTotalCalories: sumCals, // Added
        periodTotalProtein: sumProt, // Added
        periodTotalCarbs: sumCarb, // Added
        periodTotalFat: sumFat, // Added
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }
}

final progressViewModelProvider = StateNotifierProvider<ProgressViewModel, ProgressState>((ref) {
  return ProgressViewModel();
});
