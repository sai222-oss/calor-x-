import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'profile_view_model.dart';
import '../../../core/i18n_service.dart';
import '../../../core/plan_service.dart';
import '../../../core/theme.dart';
import 'package:url_launcher/url_launcher.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(profileViewModelProvider.notifier).loadProfile();
    });
  }

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      await ref.read(profileViewModelProvider.notifier).uploadAvatar(File(image.path));
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(profileViewModelProvider);
    final planState = ref.watch(planViewModelProvider);
    final viewModel = ref.read(profileViewModelProvider.notifier);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F8FC),
      appBar: _buildAppBar(context),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildHeaderCard(state, planState),
                  const SizedBox(height: 16),
                  _buildBiometricsCard(state),
                  if (state.goals != null) const SizedBox(height: 16),
                  if (state.goals != null) _buildTargetsCard(state),
                  const SizedBox(height: 16),
                  _buildWeeklyStatsCard(state),
                  const SizedBox(height: 16),
                  _buildSupportCard(planState.isPro),
                  const SizedBox(height: 16),
                  _buildActionsCard(context, viewModel),
                  const SizedBox(height: 32),
                ],
              ),
            ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return PreferredSize(
      preferredSize: const Size.fromHeight(60),
      child: Container(
        color: Colors.white,
        alignment: Alignment.bottomCenter,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        child: Row(
          children: [
            IconButton(
              icon: const Icon(LucideIcons.arrowLeft, color: Color(0xFF1A1A2E)),
              onPressed: () => context.pop(),
            ),
            Text('prof_title'.tr(), style: const TextStyle(color: Color(0xFF1A1A2E), fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
      ),
    );
  }

  Widget _buildHeaderCard(ProfileState state, PlanState planState) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(28), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)]),
      child: Column(
        children: [
          GestureDetector(
            onTap: state.isUploading ? null : _pickImage,
            child: Stack(
              children: [
                Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(shape: BoxShape.circle, color: const Color(0xFFF0EFFF), border: Border.all(color: Colors.white, width: 2), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]),
                  child: ClipOval(
                    child: state.isUploading
                        ? const Center(child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primaryColor))
                        : state.avatarUrl != null
                            ? Image.network(state.avatarUrl!, fit: BoxFit.cover)
                            : const Icon(LucideIcons.user, size: 48, color: AppTheme.primaryColor),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(color: AppTheme.primaryColor, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2)),
                    child: const Icon(LucideIcons.camera, color: Colors.white, size: 16),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(state.profile?.fullName ?? 'prof_user'.tr(), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E))),
              if (planState.isPro) const SizedBox(width: 8),
              if (planState.isPro) const Icon(LucideIcons.badgeCheck, color: AppTheme.primaryColor, size: 24),
            ],
          ),
          Text(state.email, style: const TextStyle(fontSize: 14, color: Color(0xFF8888A0))),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(color: planState.isPro ? AppTheme.primaryColor : const Color(0xFFEAE9F2), borderRadius: BorderRadius.circular(20)),
            child: Text(planState.isPro ? 'PRO' : 'FREE', style: TextStyle(color: planState.isPro ? Colors.white : const Color(0xFF8888A0), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
          ),
          if (!planState.isPro) ...[
            const SizedBox(height: 24),
            _buildProPromo(),
          ],
        ],
      ),
    );
  }

  Widget _buildProPromo() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF6C63FF), Color(0xFF5A52D5)], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: const Color(0xFF6C63FF).withOpacity(0.15), blurRadius: 30, offset: const Offset(0, 8))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Calor X Pro', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 4),
          const Text('افتح جميع ميزات المدرب الذكي والماكرو المتقدمة.', style: TextStyle(color: Colors.white70, fontSize: 13)),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => context.push('/pricing'),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppTheme.primaryColor, elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100))),
              child: const Text('اشترك الآن - 3\$/شهرياً', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBiometricsCard(ProfileState state) {
    final profile = state.profile;
    final bmi = (profile?.weightKg != null && profile?.heightCm != null) ? (profile!.weightKg! / ((profile.heightCm! / 100) * (profile.heightCm! / 100))).toStringAsFixed(1) : null;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(28)),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(LucideIcons.activity, color: AppTheme.primaryColor, size: 16),
              const SizedBox(width: 8),
              Text('prof_biometrics'.tr(), style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E))),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildBioItem('prof_weight'.tr(), profile?.weightKg != null ? '${profile!.weightKg}kg' : '—'),
              const SizedBox(width: 12),
              _buildBioItem('prof_height'.tr(), profile?.heightCm != null ? '${profile!.heightCm}cm' : '—'),
              const SizedBox(width: 12),
              _buildBioItem('prof_age'.tr(), profile?.age != null ? '${profile!.age}' : '—'),
            ],
          ),
          if (bmi != null) ...[
            const SizedBox(height: 12),
            _buildBmiSection(double.parse(bmi)),
          ],
        ],
      ),
    );
  }

  Widget _buildBioItem(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: const Color(0xFFF8F8FC), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFF0EFFF))),
        child: Column(
          children: [
            Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E))),
            const SizedBox(height: 2),
            Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF8888A0))),
          ],
        ),
      ),
    );
  }

  Widget _buildBmiSection(double bmi) {
    String label = '';
    Color color = AppTheme.primaryColor;
    if (bmi < 18.5) { label = 'prof_bmi_under'.tr(); color = Colors.blue; }
    else if (bmi < 25) { label = 'prof_bmi_healthy'.tr(); color = AppTheme.primaryColor; }
    else if (bmi < 30) { label = 'prof_bmi_over'.tr(); color = AppTheme.primaryColor; }
    else { label = 'prof_bmi_obese'.tr(); color = Colors.red; }

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: const Color(0xFFF8F8FC), borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFF0EFFF))),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('prof_bmi'.tr(), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF8888A0))),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(bmi.toString(), style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
              Text(label.toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTargetsCard(ProfileState state) {
    final goals = state.goals!;
    final items = [
      {'label': 'prog_calories'.tr(), 'value': goals.caloriesTarget, 'unit': 'kcal', 'color': AppTheme.primaryColor},
      {'label': 'prog_protein'.tr(), 'value': goals.proteinGTarget, 'unit': 'g', 'color': Colors.grey[600]},
      {'label': 'prog_carbs'.tr(), 'value': goals.carbsGTarget, 'unit': 'g', 'color': Colors.grey[400]},
      {'label': 'prog_fat'.tr(), 'value': goals.fatGTarget, 'unit': 'g', 'color': Colors.grey[300]},
    ];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(28)),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(LucideIcons.target, color: AppTheme.primaryColor, size: 16),
              const SizedBox(width: 8),
              Text('prof_daily_targets'.tr(), style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E))),
            ],
          ),
          const SizedBox(height: 16),
          ...items.map((it) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(it['label'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF8888A0))),
                    Text('${(it['value'] as double).round()} ${it['unit']}', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: it['color'] as Color)),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildWeeklyStatsCard(ProfileState state) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(28)),
      child: Column(
        children: [
          Align(alignment: Alignment.centerLeft, child: Text('prof_this_week'.tr(), style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E)))),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildStatSquare(state.weeklyMeals.toString(), 'prof_meals_logged'.tr(), const Color(0xFFF0EFFF), AppTheme.primaryColor),
              const SizedBox(width: 12),
              _buildStatSquare('${(state.weeklyCalories / 1000).toStringAsFixed(1)}k', 'prof_kcal_tracked'.tr(), const Color(0xFFF8F8FC), const Color(0xFF1A1A2E)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatSquare(String val, String label, Color bg, Color textCol) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(16)),
        child: Column(
          children: [
            Text(val, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: textCol)),
            const SizedBox(height: 2),
            Text(label.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF8888A0), letterSpacing: 0.5)),
          ],
        ),
      ),
    );
  }

  Widget _buildSupportCard(bool isPro) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(28)),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(LucideIcons.headphones, color: AppTheme.primaryColor, size: 16),
              const SizedBox(width: 8),
              Text('support_title'.tr(), style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E))),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: const Color(0xFFF8F8FC), borderRadius: BorderRadius.circular(16)),
            child: Text(isPro ? 'support_priority'.tr() : 'support_free'.tr(), style: const TextStyle(fontSize: 13, color: Colors.grey)),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => launchUrl(Uri.parse("mailto:support@calorx.app?subject=Support Request")),
                  icon: const Icon(LucideIcons.mail, size: 16),
                  label: Text('support_email_btn'.tr()),
                  style: OutlinedButton.styleFrom(foregroundColor: Colors.grey[700], side: BorderSide(color: Colors.grey[200]!), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)), padding: const EdgeInsets.symmetric(vertical: 12)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => launchUrl(Uri.parse("https://wa.me/+1234567890?text=Hello%2C%20I%20need%20support%20with%20Calor%20X")),
                  icon: const Icon(LucideIcons.messageCircle, size: 16),
                  label: const Text('واتساب'),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1A1A2E), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)), padding: const EdgeInsets.symmetric(vertical: 12)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionsCard(BuildContext context, ProfileViewModel viewModel) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: const Color(0xFF6C63FF).withOpacity(0.08), blurRadius: 20, offset: const Offset(0, 4))]),
      child: Column(
        children: [
          _buildActionItem(LucideIcons.edit2, 'prof_edit'.tr(), () => context.push('/profile-setup')),
          _buildActionDivider(),
          _buildActionItem(LucideIcons.info, 'prof_privacy'.tr(), () => context.push('/privacy')),
          _buildActionDivider(),
          _buildActionItem(LucideIcons.info, 'prof_terms'.tr(), () => context.push('/terms')),
          _buildActionDivider(),
          _buildActionItem(LucideIcons.logOut, 'prof_logout'.tr(), () async {
            await viewModel.logout();
            if (context.mounted) context.go('/auth');
          }, bg: Colors.grey[200]!, iconCol: const Color(0xFF1A1A2E)),
        ],
      ),
    );
  }

  Widget _buildActionItem(IconData icon, String label, VoidCallback onTap, {Color bg = const Color(0xFFF0EFFF), Color iconCol = AppTheme.primaryColor}) {
    return ListTile(
      onTap: onTap,
      leading: Container(width: 32, height: 32, decoration: BoxDecoration(color: bg, shape: BoxShape.circle), child: Icon(icon, size: 16, color: iconCol)),
      title: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E))),
      trailing: const Icon(LucideIcons.chevronRight, size: 18, color: Color(0xFF8888A0)),
    );
  }

  Widget _buildActionDivider() => Divider(height: 1, indent: 60, color: const Color(0xFFF8F8FC));
}
