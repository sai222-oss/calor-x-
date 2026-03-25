import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/i18n_service.dart';

class MealPlanningState {
  final String aiSuggestion;
  final bool isAiLoading;
  final String? error;

  MealPlanningState({
    this.aiSuggestion = '',
    this.isAiLoading = false,
    this.error,
  });

  MealPlanningState copyWith({
    String? aiSuggestion,
    bool? isAiLoading,
    String? error,
  }) {
    return MealPlanningState(
      aiSuggestion: aiSuggestion ?? this.aiSuggestion,
      isAiLoading: isAiLoading ?? this.isAiLoading,
      error: error ?? this.error,
    );
  }
}

class MealPlanningViewModel extends StateNotifier<MealPlanningState> {
  MealPlanningViewModel() : super(MealPlanningState());

  Future<void> generateAiPlan() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    state = state.copyWith(isAiLoading: true, error: null);
    try {
      final lang = I18nService.currentLang == Lang.ar ? 'ar' : 'en';
      final message = lang == 'ar'
          ? "بناءً على ملفي الشخصي وأهدافي الغذائية، اقترح لي خطة وجبات مفصلة ليوم واحد (إفطار، غداء، عشاء، وجبة خفيفة) من المطبخ العربي مع السعرات والبروتين لكل وجبة."
          : "Based on my profile and nutrition goals, suggest a detailed 1-day meal plan (breakfast, lunch, dinner, snack) from Arabic cuisine with calories and protein for each meal.";

      final res = await Supabase.instance.client.functions.invoke('coach', body: {
        'message': message,
        'userId': user.id,
        'conversationHistory': [],
      });

      state = state.copyWith(
        aiSuggestion: res.data['reply'] ?? '',
        isAiLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
        isAiLoading: false,
      );
    }
  }
}

final mealPlanningViewModelProvider = StateNotifierProvider<MealPlanningViewModel, MealPlanningState>((ref) {
  return MealPlanningViewModel();
});
