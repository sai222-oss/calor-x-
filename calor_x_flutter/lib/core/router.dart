import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../features/auth/presentation/auth_screen.dart';
import '../features/auth/presentation/auth_view_model.dart';
import '../features/dashboard/presentation/nutrition_results_screen.dart';
import '../features/coach/presentation/ai_coach_screen.dart';
import '../features/planning/presentation/meal_planning_screen.dart';
import '../features/tracking/presentation/micronutrient_tracking_screen.dart';
import '../features/tracking/presentation/progress_screen.dart';
import '../features/auth/presentation/onboarding_screen.dart';
import '../features/auth/presentation/profile_setup_screen.dart';
import '../features/dashboard/presentation/dashboard_screen.dart';
import '../features/dashboard/presentation/scan_screen.dart';
import '../features/dashboard/presentation/nutrition_results_screen.dart';
import '../features/legal/presentation/not_found_screen.dart';
import '../features/legal/presentation/privacy_policy_screen.dart';
import '../features/legal/presentation/terms_of_service_screen.dart';
import '../features/home/presentation/home_screen.dart';
import '../features/dashboard/presentation/profile_screen.dart';
import '../features/dashboard/presentation/pricing_screen.dart';
import '../features/dashboard/presentation/main_layout.dart';
import '../features/dashboard/data/dashboard_models.dart';
import '../features/auth/data/auth_repository.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/auth',
        builder: (context, state) => const AuthScreen(initialIsLogin: true),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const AuthScreen(initialIsLogin: false),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/profile-setup',
        builder: (context, state) => const ProfileSetupScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainLayout(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/ai-coach',
            builder: (context, state) => const AICoachScreen(),
          ),
          GoRoute(
            path: '/meal-planning',
            builder: (context, state) => const MealPlanningScreen(),
          ),
          GoRoute(
            path: '/micronutrients',
            builder: (context, state) => const MicronutrientTrackingScreen(),
          ),
          GoRoute(
            path: '/progress',
            builder: (context, state) => const ProgressScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/scan',
        builder: (context, state) => ScanScreen(key: UniqueKey()),
      ),
      GoRoute(
        path: '/results',
        builder: (context, state) {
          final data = state.extra as NutritionData;
          return NutritionResultsScreen(initialData: data);
        },
      ),
      GoRoute(
        path: '/pricing',
        builder: (context, state) => const PricingScreen(),
      ),
      GoRoute(
        path: '/privacy',
        builder: (context, state) => const PrivacyPolicyScreen(),
      ),
      GoRoute(
        path: '/terms',
        builder: (context, state) => const TermsOfServiceScreen(),
      ),
    ],
    errorBuilder: (context, state) => const NotFoundScreen(),
  );
});
