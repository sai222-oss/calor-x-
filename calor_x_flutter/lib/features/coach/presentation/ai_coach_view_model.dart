import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class CoachMessage {
  final String role; // 'user' | 'assistant'
  final String content;

  CoachMessage({required this.role, required this.content});

  factory CoachMessage.fromJson(Map<String, dynamic> json) {
    return CoachMessage(
      role: json['role'] ?? 'assistant',
      content: json['content'] ?? '',
    );
  }
}

class AICoachState {
  final List<CoachMessage> messages;
  final bool isLoading;
  final String? error;

  AICoachState({
    this.messages = const [],
    this.isLoading = false,
    this.error,
  });

  AICoachState copyWith({
    List<CoachMessage>? messages,
    bool? isLoading,
    String? error,
  }) {
    return AICoachState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class AICoachViewModel extends StateNotifier<AICoachState> {
  AICoachViewModel() : super(AICoachState());

  Future<void> fetchHistory() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    state = state.copyWith(isLoading: true);
    try {
      final data = await Supabase.instance.client
          .from('coach_messages')
          .select('role, content')
          .eq('user_id', user.id)
          .order('created_at', ascending: true);

      final history = (data as List).map((m) => CoachMessage.fromJson(m)).toList();
      
      if (history.isEmpty) {
        state = state.copyWith(
          messages: [CoachMessage(role: 'assistant', content: 'coach_greeting')],
          isLoading: false,
        );
      } else {
        state = state.copyWith(messages: history, isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(
        messages: [CoachMessage(role: 'assistant', content: 'coach_greeting')],
        isLoading: false,
      );
    }
  }

  Future<void> sendMessage(String text) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null || text.trim().isEmpty) return;

    final userMsg = CoachMessage(role: 'user', content: text);
    state = state.copyWith(
      messages: [...state.messages, userMsg],
      isLoading: true,
    );

    try {
      // 1. Save user message
      await Supabase.instance.client.from('coach_messages').insert({
        'user_id': user.id,
        'role': 'user',
        'content': text,
      });

      // 2. Invoke Edge Function
      final history = state.messages.map((m) => {'role': m.role, 'content': m.content}).toList();
      final res = await Supabase.instance.client.functions.invoke('coach', body: {
        'message': text,
        'userId': user.id,
        'conversationHistory': history,
      });

      final reply = res.data['reply'] ?? 'coach_error_msg';
      final assistantMsg = CoachMessage(role: 'assistant', content: reply);

      // 1. Save assistant message
      await Supabase.instance.client.from('coach_messages').insert({
        'user_id': user.id,
        'role': 'assistant',
        'content': reply,
      });

      state = state.copyWith(
        messages: [...state.messages, assistantMsg],
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        error: e.toString(),
        isLoading: false,
        messages: [...state.messages, CoachMessage(role: 'assistant', content: '⚠️ coach_error_msg')],
      );
    }
  }
}

final aiCoachViewModelProvider = StateNotifierProvider<AICoachViewModel, AICoachState>((ref) {
  return AICoachViewModel();
});
