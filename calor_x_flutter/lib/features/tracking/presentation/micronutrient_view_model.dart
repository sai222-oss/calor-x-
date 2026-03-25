import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/i18n_service.dart';

class MicroEntry {
  final String key;
  final String label;
  final String labelAr;
  final String unit;
  final double rdi;
  final double amount;
  final int pct;
  final String category; // 'vitamin' | 'mineral'
  final List<String> sources;

  MicroEntry({
    required this.key,
    required this.label,
    required this.labelAr,
    required this.unit,
    required this.rdi,
    required this.amount,
    required this.pct,
    required this.category,
    required this.sources,
  });
}

class MicronutrientState {
  final List<MicroEntry> micros;
  final bool isLoading;
  final String? error;

  MicronutrientState({
    this.micros = const [],
    this.isLoading = false,
    this.error,
  });

  MicronutrientState copyWith({
    List<MicroEntry>? micros,
    bool? isLoading,
    String? error,
  }) {
    return MicronutrientState(
      micros: micros ?? this.micros,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class MicronutrientViewModel extends StateNotifier<MicronutrientState> {
  MicronutrientViewModel() : super(MicronutrientState());

  static const Map<String, dynamic> RDI_DATA = {
    "vitamin_a": {"label": "Vitamin A", "label_ar": "فيتامين أ", "unit": "µg", "rdi": 900.0, "category": "vitamin"},
    "vitamin_c": {"label": "Vitamin C", "label_ar": "فيتامين ج", "unit": "mg", "rdi": 90.0, "category": "vitamin"},
    "vitamin_d": {"label": "Vitamin D", "label_ar": "فيتامين د", "unit": "µg", "rdi": 20.0, "category": "vitamin"},
    "vitamin_b12": {"label": "Vitamin B12", "label_ar": "فيتامين ب12", "unit": "µg", "rdi": 2.4, "category": "vitamin"},
    "vitamin_e": {"label": "Vitamin E", "label_ar": "فيتامين هـ", "unit": "mg", "rdi": 15.0, "category": "vitamin"},
    "vitamin_k": {"label": "Vitamin K", "label_ar": "فيتامين ك", "unit": "µg", "rdi": 120.0, "category": "vitamin"},
    "iron": {"label": "Iron", "label_ar": "الحديد", "unit": "mg", "rdi": 18.0, "category": "mineral"},
    "calcium": {"label": "Calcium", "label_ar": "الكالسيوم", "unit": "mg", "rdi": 1000.0, "category": "mineral"},
    "potassium": {"label": "Potassium", "label_ar": "البوتاسيوم", "unit": "mg", "rdi": 3500.0, "category": "mineral"},
    "magnesium": {"label": "Magnesium", "label_ar": "المغنيسيوم", "unit": "mg", "rdi": 420.0, "category": "mineral"},
    "zinc": {"label": "Zinc", "label_ar": "الزنك", "unit": "mg", "rdi": 11.0, "category": "mineral"},
    "sodium": {"label": "Sodium", "label_ar": "الصوديوم", "unit": "mg", "rdi": 2300.0, "category": "mineral"},
  };

  Future<void> fetchMicros() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    state = state.copyWith(isLoading: true, error: null);
    try {
      final sevenDaysAgo = DateTime.now().subtract(const Duration(days: 7)).toIso8601String();
      final mealsRes = await Supabase.instance.client
          .from('meal_logs')
          .select('dish_name, dish_name_ar, vitamins_minerals, ingredients')
          .eq('user_id', user.id)
          .gte('logged_at', sevenDaysAgo);

      final Map<String, _AggregatedNutrient> totals = {};

      for (var meal in (mealsRes as List)) {
        final dishName = (I18nService.currentLang == Lang.ar ? meal['dish_name_ar'] : meal['dish_name']) ?? meal['dish_name'] ?? "";
        
        // Meal level
        if (meal['vitamins_minerals'] != null && meal['vitamins_minerals'] is Map) {
          (meal['vitamins_minerals'] as Map).forEach((key, val) {
            final normKey = key.toString().toLowerCase().replaceAll(' ', '_').replaceAll('-', '_');
            totals.putIfAbsent(normKey, () => _AggregatedNutrient()).add(val.toDouble(), dishName);
          });
        }

        // Ingredient level
        if (meal['ingredients'] != null && meal['ingredients'] is List) {
          for (var ing in (meal['ingredients'] as List)) {
            final ingName = I18nService.currentLang == Lang.ar ? (ing['name_ar'] ?? ing['name']) : (ing['name'] ?? ing['name_ar']);
            if (ing['vitamins_minerals'] != null && ing['vitamins_minerals'] is Map) {
              (ing['vitamins_minerals'] as Map).forEach((key, val) {
                final normKey = key.toString().toLowerCase().replaceAll(' ', '_').replaceAll('-', '_');
                totals.putIfAbsent(normKey, () => _AggregatedNutrient()).add(val.toDouble(), ingName);
              });
            }
          }
        }
      }

      final List<MicroEntry> entries = [];
      RDI_DATA.forEach((rdiKey, rdiData) {
        final matchKey = totals.keys.firstWhere(
          (k) => k == rdiKey || k.contains(rdiKey.replaceAll('vitamin_', '')) || rdiKey.contains(k.replaceAll('vitamin_', '')),
          orElse: () => '',
        );
        
        final amount = matchKey.isNotEmpty ? totals[matchKey]!.amount : 0.0;
        final sources = matchKey.isNotEmpty ? totals[matchKey]!.sources : <String>[];
        final pct = (amount / rdiData['rdi'] * 100).round();

        entries.add(MicroEntry(
          key: rdiKey,
          label: rdiData['label'],
          labelAr: rdiData['label_ar'],
          unit: rdiData['unit'],
          rdi: rdiData['rdi'],
          amount: (amount * 10).roundToDouble() / 10,
          pct: pct.clamp(0, 150),
          category: rdiData['category'],
          sources: sources.toSet().toList(),
        ));
      });

      state = state.copyWith(micros: entries, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }
}

class _AggregatedNutrient {
  double amount = 0;
  List<String> sources = [];

  void add(double val, String source) {
    amount += val;
    if (source.isNotEmpty && !sources.contains(source)) {
      sources.add(source);
    }
  }
}

final micronutrientViewModelProvider = StateNotifierProvider<MicronutrientViewModel, MicronutrientState>((ref) {
  return MicronutrientViewModel();
});
