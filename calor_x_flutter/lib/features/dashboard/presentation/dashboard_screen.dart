import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'dart:math' as math;
import 'dashboard_view_model.dart';
import '../../../core/i18n_service.dart';
import '../../../core/plan_service.dart';
import '../../../core/theme.dart';
import '../data/dashboard_models.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dashboardViewModelProvider);
    final plan = ref.watch(planViewModelProvider);

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => ref.read(dashboardViewModelProvider.notifier).loadDashboard(),
              child: Stack(
                children: [
                  CustomScrollView(
                    slivers: [
                      _buildTopNav(context, state, plan),
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        sliver: SliverList(
                          delegate: SliverChildListDelegate([
                            _buildGreetingCard(context, state, plan),
                            const SizedBox(height: 20),
                            _buildSummaryCard(context, state),
                            const SizedBox(height: 16),
                            _buildQuickActions(context, plan),
                            _buildRecentMeals(context, state, ref),
                            const SizedBox(height: 80),
                          ]),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildTopNav(BuildContext context, DashboardState state, PlanState plan) {
    return SliverAppBar(
      backgroundColor: AppTheme.backgroundColor.withOpacity(0.8),
      floating: true,
      pinned: false,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      automaticallyImplyLeading: false,
      title: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppTheme.primaryColor,
              borderRadius: BorderRadius.circular(100),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryColor.withOpacity(0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Center(
              child: Text(
                'CX',
                style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900),
              ),
            ),
          ),
          const SizedBox(width: 8),
          const Text(
            'Calor X',
            style: TextStyle(color: AppTheme.headingColor, fontSize: 18, fontWeight: FontWeight.w900),
          ),
        ],
      ),
      actions: [
        if (plan.isPro)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(100),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)],
            ),
            child: const Text(
              '💎 PRO',
              style: TextStyle(color: AppTheme.primaryColor, fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ),
        const SizedBox(width: 12),
        GestureDetector(
          onTap: () => context.push('/profile'),
          child: CircleAvatar(
            radius: 20,
            backgroundColor: Colors.white,
            backgroundImage: NetworkImage(
              'https://api.dicebear.com/7.x/notionists/png?seed=${state.profile?.fullName ?? 'User'}&backgroundColor=f0efff',
            ),
          ),
        ),
        const SizedBox(width: 20),
      ],
    );
  }

  Widget _buildGreetingCard(BuildContext context, DashboardState state, PlanState plan) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1A1A2E), Color(0xFF6C63FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6C63FF).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(100),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                  ),
                  child: Text(
                    'dash_daily_streak_badge'.tr(vars: {'n': 3}),
                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w900),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'dash_welcome'.tr() + ',\n' + (state.profile?.fullName ?? 'Guest') + '!',
                  style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900, height: 1.1),
                ),
                const SizedBox(height: 8),
                Text(
                  'dash_ready_crush'.tr(),
                  style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 12, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
          Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withOpacity(0.3)),
                ),
              ),
              const Text('🥗', style: TextStyle(fontSize: 48)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(BuildContext context, DashboardState state) {
    final cals = state.nutrition?.totalCalories ?? 0;
    final calTarget = state.goals?.caloriesTarget ?? 2000;
    final pct = calTarget > 0 ? (cals / calTarget).clamp(0.0, 1.0) : 0.0;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('dash_today_summary'.tr(), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
                if (state.profile?.healthGoal != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0EFFF),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Text(
                      state.profile!.healthGoal.tr(),
                      style: const TextStyle(color: AppTheme.primaryColor, fontSize: 10, fontWeight: FontWeight.w900),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                SizedBox(
                  width: 120,
                  height: 120,
                  child: CustomPaint(
                    painter: _CircularProgressPainter(
                      progress: pct,
                      color: AppTheme.primaryColor,
                    ),
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            cals.round().toString(),
                            style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: AppTheme.headingColor),
                          ),
                          Text(
                            'dash_kcal'.tr().toUpperCase(),
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.mutedColor, letterSpacing: 1),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 24),
                Expanded(
                  child: Column(
                    children: [
                      _buildMacroRow('dash_protein'.tr(), state.nutrition?.totalProteinG ?? 0, state.goals?.proteinGTarget ?? 150, 'g', AppTheme.proteinColor),
                      const SizedBox(height: 12),
                      _buildMacroRow('dash_carbs'.tr(), state.nutrition?.totalCarbsG ?? 0, state.goals?.carbsGTarget ?? 200, 'g', AppTheme.carbsColor),
                      const SizedBox(height: 12),
                      _buildMacroRow('dash_fat'.tr(), state.nutrition?.totalFatG ?? 0, state.goals?.fatGTarget ?? 65, 'g', AppTheme.fatColor),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }



  Widget _buildMacroRow(String label, double value, double target, String unit, Color color) {
    final pct = target > 0 ? (value / target).clamp(0.0, 1.0) : 0.0;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(6)),
              child: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.headingColor)),
            ),
            Text(
              '${value.round()}$unit / ${target.round()}',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color),
            ),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(100),
          child: LinearProgressIndicator(
            value: pct,
            backgroundColor: const Color(0xFFF8F8FC),
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 8,
          ),
        ),
      ],
    );
  }

  Widget _buildQuickActions(BuildContext context, PlanState plan) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 8, bottom: 12),
          child: Text('dash_quick_actions'.tr(), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
        ),
        GridView(
          shrinkWrap: true,
          padding: EdgeInsets.zero,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            mainAxisExtent: 150,
          ),
          children: [
            _buildActionCard(
              LucideIcons.messageCircle,
              'dash_ai_coach'.tr(),
              'dash_smart_advice'.tr(),
              const [Color(0xFF1A1A2E), Color(0xFF303050)],
              'pro',
              plan.isPro,
              () => context.push('/ai-coach'),
            ),
            _buildActionCard(
              LucideIcons.trendingUp,
              'dash_progress'.tr(),
              'dash_view_trends'.tr(),
              const [Color(0xFF6C63FF), Color(0xFF8B84FA)],
              null,
              true,
              () => context.push('/progress'),
            ),
            _buildActionCard(
              LucideIcons.chefHat,
              'meal_plan_title'.tr(),
              'dash_daily_recipes'.tr(),
              const [Color(0xFF2D2D5E), Color(0xFF3D3D7E)],
              'pro',
              plan.isPro,
              () => context.push('/meal-planning'),
            ),
            _buildActionCard(
              LucideIcons.zap,
              'micro_title'.tr(),
              'dash_vitamins'.tr(),
              const [Color(0xFF1A1A2E), Color(0xFF6C63FF)],
              'pro',
              plan.isPro,
              () => context.push('/micronutrients'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionCard(IconData icon, String title, String subtitle, List<Color> colors, String? badge, bool isActive, VoidCallback onTap, {bool isLight = false}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: colors, begin: Alignment.topLeft, end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(28),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, color: isLight ? AppTheme.primaryColor : Colors.white, size: 28),
                if (badge == 'pro' && !isActive)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.3), borderRadius: BorderRadius.circular(4)),
                    child: const Text('PRO', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900)),
                  ),
              ],
            ),
            const Spacer(),
            Text(title, style: TextStyle(color: isLight ? AppTheme.headingColor : Colors.white, fontSize: 16, fontWeight: FontWeight.w900, height: 1.1)),
            const SizedBox(height: 4),
            Text(subtitle, style: TextStyle(color: isLight ? AppTheme.mutedColor : Colors.white.withOpacity(0.8), fontSize: 10, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentMeals(BuildContext context, DashboardState state, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 8, bottom: 12),
          child: Text('dash_recent_meals'.tr(), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
        ),
        Card(
          child: state.recentMeals.isEmpty
              ? _buildEmptyMeals()
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(8),
                  itemCount: state.recentMeals.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 4),
                  itemBuilder: (context, index) {
                    final meal = state.recentMeals[index];
                    return _buildMealItem(context, ref, meal);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildEmptyMeals() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(color: const Color(0xFFF0EFFF), shape: BoxShape.circle),
            child: const Icon(LucideIcons.camera, color: AppTheme.primaryColor),
          ),
          const SizedBox(height: 12),
          Text('dash_no_meals'.tr(), style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.headingColor)),
          const SizedBox(height: 4),
          Text('dash_scan_first'.tr(), style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildMealItem(BuildContext context, WidgetRef ref, MealLog meal) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(24)),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(color: const Color(0xFFF0EFFF), borderRadius: BorderRadius.circular(16)),
            child: const Center(child: Text('🍲', style: TextStyle(fontSize: 24))),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  I18nService.currentLang == Lang.ar ? (meal.dishNameAr.isNotEmpty ? meal.dishNameAr : meal.dishName) : meal.dishName,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.headingColor),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  '${_formatTime(meal.loggedAt)} • ${meal.proteinG.round()} ${'dash_protein_g'.tr()}',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: AppTheme.mutedColor),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFF8F8FC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.withOpacity(0.1)),
            ),
            child: Column(
              children: [
                Text(meal.calories.round().toString(), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.primaryColor)),
                Text('dash_kcal'.tr().toUpperCase(), style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: AppTheme.mutedColor)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(LucideIcons.trash2, color: Colors.redAccent, size: 20),
            onPressed: () => _showDeleteConfirm(context, ref, meal),
          ),
        ],
      ),
    );
  }

  void _showDeleteConfirm(BuildContext context, WidgetRef ref, MealLog meal) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(I18nService.currentLang == Lang.ar ? "حذف الوجبة؟" : "Delete Meal?"),
        content: Text(I18nService.currentLang == Lang.ar ? "هل أنت متأكد من حذف ${meal.dishNameAr}؟" : "Are you sure you want to delete ${meal.dishName}?"),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: Text(I18nService.currentLang == Lang.ar ? "إلغاء" : "Cancel")),
          TextButton(
            onPressed: () {
              ref.read(dashboardViewModelProvider.notifier).deleteMeal(meal.id);
              Navigator.pop(context);
            },
            child: Text(I18nService.currentLang == Lang.ar ? "حذف" : "Delete", style: const TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime date) {
    final h = date.hour.toString().padLeft(2, '0');
    final m = date.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }
}

class _CircularProgressPainter extends CustomPainter {
  final double progress;
  final Color color;

  _CircularProgressPainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width / 2, size.height / 2) - 6;

    final bgPaint = Paint()
      ..color = const Color(0xFFF8F8FC)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 12;

    canvas.drawCircle(center, radius, bgPaint);

    final fgPaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFF8B84FA), Color(0xFF6C63FF)],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height))
      ..style = PaintingStyle.stroke
      ..strokeWidth = 12
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      2 * math.pi * progress,
      false,
      fgPaint,
    );
  }

  @override
  bool shouldRepaint(covariant _CircularProgressPainter oldDelegate) => oldDelegate.progress != progress;
}

extension on Widget {
  Widget wrapWith3DGradient() {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1A1A2E), Color(0xFF6C63FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(100),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6C63FF).withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: this,
    );
  }
}
