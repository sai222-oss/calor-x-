import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

enum Plan { free, pro }

class PlanState {
  final Plan plan;
  final bool isLoading;
  
  PlanState({this.plan = Plan.free, this.isLoading = true});
  
  bool get isPro => plan == Plan.pro;
  num get scanLimit => plan == Plan.free ? 1 : 999999;
  
  PlanState copyWith({Plan? plan, bool? isLoading}) {
    return PlanState(
      plan: plan ?? this.plan,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class PlanViewModel extends StateNotifier<PlanState> {
  PlanViewModel() : super(PlanState()) {
    loadPlan();
  }

  Future<void> loadPlan() async {
    state = state.copyWith(isLoading: true);
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) {
        state = state.copyWith(isLoading: false);
        return;
      }
      
      final data = await Supabase.instance.client
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .maybeSingle();

      if (data != null && data['plan'] != null) {
        final planStr = data['plan'] as String;
        state = state.copyWith(
          plan: planStr == 'pro' ? Plan.pro : Plan.free,
          isLoading: false,
        );
      } else {
        state = state.copyWith(isLoading: false);
      }
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }
}

final planViewModelProvider = StateNotifierProvider<PlanViewModel, PlanState>((ref) {
  return PlanViewModel();
});
