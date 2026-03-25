import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../data/auth_repository.dart';

// Parity with Auth.tsx state
class AuthScreenState {
  final bool isLogin;
  final bool isLoading;
  final bool googleLoading;
  final String errorMsg;
  final bool showVerificationModal;
  final String verificationType; // 'signup' | 'login'
  final bool emailSent;

  AuthScreenState({
    this.isLogin = true,
    this.isLoading = false,
    this.googleLoading = false,
    this.errorMsg = '',
    this.showVerificationModal = false,
    this.verificationType = 'signup',
    this.emailSent = false,
  });

  AuthScreenState copyWith({
    bool? isLogin,
    bool? isLoading,
    bool? googleLoading,
    String? errorMsg,
    bool? showVerificationModal,
    String? verificationType,
    bool? emailSent,
  }) {
    return AuthScreenState(
      isLogin: isLogin ?? this.isLogin,
      isLoading: isLoading ?? this.isLoading,
      googleLoading: googleLoading ?? this.googleLoading,
      errorMsg: errorMsg ?? this.errorMsg,
      showVerificationModal: showVerificationModal ?? this.showVerificationModal,
      verificationType: verificationType ?? this.verificationType,
      emailSent: emailSent ?? this.emailSent,
    );
  }
}

class AuthViewModel extends StateNotifier<AuthScreenState> {
  final AuthRepository _repository;

  AuthViewModel(this._repository) : super(AuthScreenState());

  void toggleAuthMode() {
    state = state.copyWith(isLogin: !state.isLogin, errorMsg: '');
  }

  void setError(String msg) {
    state = state.copyWith(errorMsg: msg);
  }

  void closeVerificationModal() {
    state = state.copyWith(showVerificationModal: false);
  }

  Future<void> handleAuth(String email, String password) async {
    if (email.isEmpty || password.isEmpty) {
      setError("Please enter email and password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    state = state.copyWith(isLoading: true, errorMsg: '');
    try {
      if (state.isLogin) {
        final res = await _repository.signIn(email, password);
        if (res.user != null && res.user!.emailConfirmedAt == null) {
          // Block access if email is not verified (parity with Auth.tsx)
          await _repository.signOut();
          state = state.copyWith(
            showVerificationModal: true,
            verificationType: 'login',
            isLoading: false,
          );
        }
      } else {
        await _repository.signUp(email, password);
        state = state.copyWith(
          showVerificationModal: true,
          verificationType: 'signup',
          isLoading: false,
        );
      }
    } on AuthException catch (e) {
      if (e.message.contains("Email not confirmed")) {
        state = state.copyWith(
          showVerificationModal: true,
          verificationType: 'login',
          isLoading: false,
        );
      } else {
        state = state.copyWith(
          errorMsg: e.message.contains("Invalid") ? "Invalid email or password" : e.message,
          isLoading: false,
        );
      }
    } catch (e) {
      state = state.copyWith(errorMsg: "An error occurred, please try again", isLoading: false);
    }
  }

  Future<void> handleGoogleSignIn() async {
    state = state.copyWith(googleLoading: true, errorMsg: '');
    try {
      await _repository.signInWithGoogle();
    } on AuthException catch (e) {
      state = state.copyWith(errorMsg: "Google sign-in failed: ${e.message}", googleLoading: false);
    } catch (e) {
      state = state.copyWith(errorMsg: "Google sign-in failed", googleLoading: false);
    }
  }
}

final authRepositoryProvider = Provider((ref) => AuthRepository());

final authViewModelProvider = StateNotifierProvider<AuthViewModel, AuthScreenState>((ref) {
  return AuthViewModel(ref.read(authRepositoryProvider));
});
