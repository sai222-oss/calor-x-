import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/dashboard_models.dart';

class ProfileState {
  final ProfileData? profile;
  final DailyGoals? goals;
  final String email;
  final String? avatarUrl;
  final bool isLoading;
  final bool isUploading;
  final int weeklyMeals;
  final double weeklyCalories;
  final String? error;

  ProfileState({
    this.profile,
    this.goals,
    this.email = '',
    this.avatarUrl,
    this.isLoading = false,
    this.isUploading = false,
    this.weeklyMeals = 0,
    this.weeklyCalories = 0,
    this.error,
  });

  ProfileState copyWith({
    ProfileData? profile,
    DailyGoals? goals,
    String? email,
    String? avatarUrl,
    bool? isLoading,
    bool? isUploading,
    int? weeklyMeals,
    double? weeklyCalories,
    String? error,
  }) {
    return ProfileState(
      profile: profile ?? this.profile,
      goals: goals ?? this.goals,
      email: email ?? this.email,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      isLoading: isLoading ?? this.isLoading,
      isUploading: isUploading ?? this.isUploading,
      weeklyMeals: weeklyMeals ?? this.weeklyMeals,
      weeklyCalories: weeklyCalories ?? this.weeklyCalories,
      error: error ?? this.error,
    );
  }
}

class ProfileViewModel extends StateNotifier<ProfileState> {
  ProfileViewModel() : super(ProfileState());

  Future<void> loadProfile() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    state = state.copyWith(isLoading: true, error: null, email: user.email, avatarUrl: user.userMetadata?['avatar_url']);
    try {
      final weekAgo = DateTime.now().subtract(const Duration(days: 7)).toIso8601String();
      
      final responses = await Future.wait<dynamic>(<Future<dynamic>>[
        Supabase.instance.client.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        Supabase.instance.client.from('daily_goals').select('*').eq('user_id', user.id).maybeSingle(),
        Supabase.instance.client.from('meal_logs').select('calories').eq('user_id', user.id).gte('logged_at', weekAgo),
      ]);

      final profileData = responses[0] != null ? ProfileData.fromJson(responses[0] as Map<String, dynamic>) : null;
      final goalsData = responses[1] != null ? DailyGoals.fromJson(responses[1] as Map<String, dynamic>) : null;
      final mealLogs = responses[2] as List;

      final double calories = mealLogs.fold(0, (sum, item) => sum + (item['calories'] ?? 0));

      state = state.copyWith(
        profile: profileData,
        goals: goalsData,
        weeklyMeals: mealLogs.length,
        weeklyCalories: calories,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }

  Future<void> uploadAvatar(File file) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    state = state.copyWith(isUploading: true, error: null);
    try {
      final fileExt = file.path.split('.').last;
      final fileName = '${user.id}-${DateTime.now().millisecondsSinceEpoch}.$fileExt';
      final filePath = 'avatars/$fileName';

      await Supabase.instance.client.storage.from('food-images').upload(filePath, file);
      
      final String publicUrl = Supabase.instance.client.storage.from('food-images').getPublicUrl(filePath);

      await Supabase.instance.client.auth.updateUser(UserAttributes(data: {'avatar_url': publicUrl}));
      
      state = state.copyWith(avatarUrl: publicUrl, isUploading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isUploading: false);
    }
  }

  Future<void> logout() async {
    await Supabase.instance.client.auth.signOut();
  }
}

final profileViewModelProvider = StateNotifierProvider<ProfileViewModel, ProfileState>((ref) {
  return ProfileViewModel();
});
