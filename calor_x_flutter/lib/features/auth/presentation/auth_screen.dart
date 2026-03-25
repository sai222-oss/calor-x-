import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'auth_view_model.dart';
import '../../../core/i18n_service.dart';

class AuthScreen extends ConsumerStatefulWidget {
  final bool initialIsLogin;
  const AuthScreen({super.key, this.initialIsLogin = true});

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  late final StreamSubscription<AuthState> _authSubscription;

  @override
  void initState() {
    super.initState();
    // In case we want to force signup mode
    WidgetsBinding.instance.addPostFrameCallback((_) {
       if (!widget.initialIsLogin) {
         ref.read(authViewModelProvider.notifier).toggleAuthMode();
       }
    });

    _authSubscription = Supabase.instance.client.auth.onAuthStateChange.listen((data) {
      if (data.session != null && data.session!.user.emailConfirmedAt != null) {
        if (mounted) context.go('/dashboard');
      }
    });
  }

  @override
  void dispose() {
    _authSubscription.cancel();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authViewModelProvider);
    final viewModel = ref.read(authViewModelProvider.notifier);

    if (state.showVerificationModal) {
      return _buildVerificationModal(context, state, viewModel);
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8F8FC),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildAuthCard(context, state, viewModel),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAuthCard(BuildContext context, AuthScreenState state, AuthViewModel viewModel) {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(maxWidth: 450),
      padding: const EdgeInsets.all(32.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildHeader(context, state),
          const SizedBox(height: 24),
          _buildGoogleButton(state, viewModel),
          const SizedBox(height: 24),
          _buildOrDivider(),
          const SizedBox(height: 24),
          if (state.errorMsg.isNotEmpty) _buildErrorLabel(state.errorMsg),
          _buildAuthForm(state, viewModel),
          const SizedBox(height: 24),
          _buildFooterButtons(context, state, viewModel),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, AuthScreenState state) {
    return Column(
      children: [
        Text(
          'app_name'.tr(),
          style: const TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: Color(0xFF6C63FF),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          state.isLogin ? 'auth_sign_in'.tr() : 'auth_sign_up'.tr(),
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1A1A2E),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          state.isLogin ? 'auth_sign_in_desc'.tr() : 'auth_sign_up_desc'.tr(),
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildGoogleButton(AuthScreenState state, AuthViewModel viewModel) {
    return OutlinedButton.icon(
      onPressed: state.isLoading || state.googleLoading ? null : viewModel.handleGoogleSignIn,
      icon: state.googleLoading 
          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
          : Image.network('https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.png', width: 20),
      label: Text('auth_continue_google'.tr()),
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 16),
        side: const BorderSide(color: Color(0xFFE5E7EB)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
        foregroundColor: const Color(0xFF374151),
        textStyle: const TextStyle(fontWeight: FontWeight.w500),
      ),
    );
  }

  Widget _buildOrDivider() {
    return Row(
      children: [
        const Expanded(child: Divider(color: Color(0xFFE5E7EB))),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            'auth_or'.tr().toUpperCase(),
            style: const TextStyle(fontSize: 12, color: Colors.grey),
          ),
        ),
        const Expanded(child: Divider(color: Color(0xFFE5E7EB))),
      ],
    );
  }

  Widget _buildErrorLabel(String msg) {
    return Container(
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.red[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red[100]!),
      ),
      child: Row(
        children: [
          const Icon(LucideIcons.alertCircle, color: Colors.red, size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              msg,
              style: const TextStyle(color: Colors.red, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAuthForm(AuthScreenState state, AuthViewModel viewModel) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildFieldLabel('auth_email'.tr()),
        const SizedBox(height: 8),
        TextField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          enabled: !state.isLoading,
          decoration: _inputDecoration('your@email.com'),
        ),
        const SizedBox(height: 16),
        _buildFieldLabel('auth_password'.tr()),
        const SizedBox(height: 8),
        TextField(
          controller: _passwordController,
          obscureText: true,
          enabled: !state.isLoading,
          decoration: _inputDecoration('••••••••'),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: state.isLoading ? null : () => viewModel.handleAuth(_emailController.text, _passwordController.text),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6C63FF),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
            elevation: 0,
            textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          child: state.isLoading 
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : Text(state.isLogin ? 'auth_sign_in_btn'.tr() : 'auth_sign_up_btn'.tr()),
        ),
        if (!state.isLogin) ...[
          const SizedBox(height: 12),
          Text(
            '${'auth_agree_terms'.tr()} ${'prof_terms'.tr()} ${'auth_and'.tr()} ${'prof_privacy'.tr()}',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 11, color: Colors.grey),
          ),
        ]
      ],
    );
  }

  Widget _buildFieldLabel(String label) {
    return Text(
      label,
      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF374151)),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.grey),
      filled: true,
      fillColor: const Color(0xFFF8F8FC),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF6C63FF)),
      ),
    );
  }

  Widget _buildFooterButtons(BuildContext context, AuthScreenState state, AuthViewModel viewModel) {
    return Column(
      children: [
        TextButton(
          onPressed: state.isLoading ? null : viewModel.toggleAuthMode,
          child: Text(
            state.isLogin ? 'auth_no_account'.tr() : 'auth_has_account'.tr(),
            style: const TextStyle(color: Color(0xFF6C63FF), fontWeight: FontWeight.w600),
          ),
        ),
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text(
            'auth_back_home'.tr(),
            style: const TextStyle(color: Colors.grey),
          ),
        ),
      ],
    );
  }

  Widget _buildVerificationModal(BuildContext context, AuthScreenState state, AuthViewModel viewModel) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8FC),
      body: Center(
        child: Container(
          width: double.infinity,
          constraints: const BoxConstraints(maxWidth: 400),
          margin: const EdgeInsets.all(24),
          padding: const EdgeInsets.all(32),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(32),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: const Color(0xFFF0EFFF),
                  borderRadius: BorderRadius.circular(100),
                ),
                child: const Icon(LucideIcons.mailCheck, color: Color(0xFF6C63FF), size: 32),
              ),
              const SizedBox(height: 24),
              Text(
                state.verificationType == 'signup' ? 'auth_check_email'.tr() : 'auth_email_verification_required'.tr(),
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF6C63FF)),
              ),
              const SizedBox(height: 16),
              Text(
                state.verificationType == 'signup' ? 'auth_verification_sent'.tr() : 'auth_must_verify'.tr(),
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: viewModel.closeVerificationModal,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6C63FF),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
                    elevation: 0,
                  ),
                  child: Text('auth_return_login'.tr()),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
