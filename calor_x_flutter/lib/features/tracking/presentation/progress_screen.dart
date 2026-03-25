import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../dashboard/data/dashboard_models.dart';
import 'progress_view_model.dart';
import '../../../core/i18n_service.dart';
import '../../../core/plan_service.dart';
import '../../../core/theme.dart';

class ProgressScreen extends ConsumerStatefulWidget {
  const ProgressScreen({super.key});

  @override
  ConsumerState<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends ConsumerState<ProgressScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(progressViewModelProvider.notifier).fetchProgress();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(progressViewModelProvider);
    final isPro = ref.watch(planViewModelProvider).isPro;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F8FC),
      appBar: _buildAppBar(context),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildPeriodSelector(state, ref),
                  const SizedBox(height: 24),
                  _buildPeriodSummary(state),
                  const SizedBox(height: 24),
                  _buildStatsGrid(state), // Keeping this as it was not explicitly removed by the instruction
                  const SizedBox(height: 16),
                  _buildCalorieChart(state),
                  const SizedBox(height: 16),
                  _buildGoalsSection(state),
                  const SizedBox(height: 16),
                  _buildMicrosLink(context),
                  const SizedBox(height: 16),
                  _buildExportButton(context, isPro),
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
        color: AppTheme.primaryColor,
        alignment: Alignment.bottomCenter,
        padding: const EdgeInsets.only(bottom: 12),
        child: Row(
          children: [
            IconButton(
              icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
              onPressed: () => context.pop(),
            ),
            Text('prog_title'.tr(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsGrid(ProgressState state) {
    return Row(
      children: [
        Expanded(child: _buildStatCard(state.streak.toString(), 'prog_day_streak'.tr())),
        const SizedBox(width: 12),
        Expanded(child: _buildStatCard(state.totalMeals.toString(), 'prog_total_meals'.tr())),
      ],
    );
  }

  Widget _buildStatCard(String value, String label) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)],
      ),
      child: Column(
        children: [
          Text(value, style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: AppTheme.primaryColor)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildCalorieChart(ProgressState state) {
    final calTarget = state.goals?.caloriesTarget ?? 2000;
    final hasData = state.chartData.any((d) => d.calories > 0);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(LucideIcons.calendar, color: AppTheme.primaryColor, size: 16),
              const SizedBox(width: 8),
              Text('prog_7day_cal'.tr(), style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
            ],
          ),
          const SizedBox(height: 20),
          if (!hasData)
            _buildNoDataChart()
          else
            SizedBox(
              height: 160,
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: (state.chartData.isEmpty ? 2500.0 : state.chartData.map((e) => e.calories).reduce((a, b) => a > b ? a : b) * 1.2).clamp(calTarget * 1.2, 5000.0).toDouble(),
                  barTouchData: BarTouchData(enabled: true),
                  titlesData: FlTitlesData(
                    show: true,
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (double value, TitleMeta meta) {
                          if (value.toInt() < 0 || value.toInt() >= state.chartData.length) return const SizedBox.shrink();
                          final day = state.chartData[value.toInt()];
                          return Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Text(I18nService.currentLang == Lang.ar ? day.dayLabel : day.dayLabelEn, style: const TextStyle(color: Colors.grey, fontSize: 10)),
                          );
                        },
                      ),
                    ),
                    leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  ),
                  gridData: const FlGridData(show: false),
                  borderData: FlBorderData(show: false),
                  barGroups: state.chartData.asMap().entries.map((e) {
                    final isGoalReached = e.value.calories >= calTarget;
                    return BarChartGroupData(
                      x: e.key,
                      barRods: [
                        BarChartRodData(
                          toY: e.value.calories,
                          color: isGoalReached ? AppTheme.primaryColor : (e.value.calories > 0 ? Colors.grey[400] : const Color(0xFFE5E7EB)),
                          width: state.period == ProgressPeriod.daily ? 25 : 35,
                          borderRadius: const BorderRadius.only(topLeft: Radius.circular(6), topRight: Radius.circular(6)),
                        ),
                      ],
                    );
                  }).toList(),
                ),
              ),
            ),
          const SizedBox(height: 12),
          _buildChartLegend(),
        ],
      ),
    );
  }

  Widget _buildNoDataChart() {
    return Column(
      children: [
        const Icon(LucideIcons.trendingUp, size: 40, color: Colors.grey),
        const SizedBox(height: 12),
        Text('prog_no_meals_week'.tr(), style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }

  Widget _buildChartLegend() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildLegendItem(Colors.grey[400]!, I18nService.currentLang == Lang.ar ? "دون الهدف" : "Below goal"),
        const SizedBox(width: 16),
        _buildLegendItem(AppTheme.primaryColor, I18nService.currentLang == Lang.ar ? "الهدف محقق ✓" : "Goal reached ✓"),
      ],
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
      ],
    );
  }

  Widget _buildGoalsSection(ProgressState state) {
    final goals = state.goals;
    if (goals == null) return _buildNoGoals(context);

    final today = state.todayTotals ?? DailyNutrition(date: '', totalCalories: 0, totalProteinG: 0, totalCarbsG: 0, totalFatG: 0, mealsCount: 0);
    final macros = [
      {'icon': LucideIcons.flame, 'label': 'prog_calories'.tr(), 'value': today.totalCalories, 'target': goals.caloriesTarget, 'unit': 'kcal', 'color': AppTheme.primaryColor},
      {'icon': LucideIcons.zap, 'label': 'prog_protein'.tr(), 'value': today.totalProteinG, 'target': goals.proteinGTarget, 'unit': 'g', 'color': Colors.grey[600]},
      {'icon': LucideIcons.trendingUp, 'label': 'prog_carbs'.tr(), 'value': today.totalCarbsG, 'target': goals.carbsGTarget, 'unit': 'g', 'color': Colors.grey[400]},
      {'icon': LucideIcons.droplets, 'label': 'prog_fat'.tr(), 'value': today.totalFatG, 'target': goals.fatGTarget, 'unit': 'g', 'color': Colors.grey[300]},
    ];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(LucideIcons.target, color: AppTheme.primaryColor, size: 16),
              const SizedBox(width: 8),
              Text('prog_today_vs_goals'.tr(), style: const TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 20),
          ...macros.map((m) => _buildMacroProgress(m)),
        ],
      ),
    );
  }

  Widget _buildMacroProgress(Map<String, dynamic> data) {
    final value = data['value'] as double;
    final target = data['target'] as double;
    final pct = target > 0 ? (value / target) : 0.0;
    final pctInt = (pct * 100).round();

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(data['icon'] as IconData, size: 14, color: data['color'] as Color),
                  const SizedBox(width: 8),
                  Text(data['label'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                ],
              ),
              Text(
                '${value.round()}${data['unit']} / ${target.round()}${data['unit']}  $pctInt%',
                style: TextStyle(fontSize: 11, color: pct >= 1 ? AppTheme.primaryColor : Colors.grey, fontWeight: pct >= 1 ? FontWeight.bold : FontWeight.normal),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            height: 8,
            width: double.infinity,
            decoration: BoxDecoration(color: Colors.black.withOpacity(0.05), borderRadius: BorderRadius.circular(4)),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: pct.clamp(0.0, 1.0),
              child: Container(decoration: BoxDecoration(color: Colors.grey[600], borderRadius: BorderRadius.circular(4))),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoGoals(BuildContext context) {
     return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
      child: Center(
        child: Column(
          children: [
            Text('prog_setup_goals'.tr(), style: const TextStyle(fontSize: 12, color: Colors.grey)),
            TextButton(onPressed: () => context.push('/profile-setup'), child: Text('setup'.tr(), style: const TextStyle(color: AppTheme.primaryColor))),
          ],
        ),
      ),
    );
  }

  Widget _buildMicrosLink(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/micronutrients'),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(color: Colors.black.withOpacity(0.05), borderRadius: BorderRadius.circular(12)),
              child: const Icon(LucideIcons.flaskConical, color: Colors.black87, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('micro_title'.tr(), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                Text('micro_subtitle'.tr(), style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ]),
            ),
            const Icon(LucideIcons.arrowLeft, size: 16, color: Colors.grey), // RTL handles mirror
          ],
        ),
      ),
    );
  }

  Widget _buildExportButton(BuildContext context, bool isPro) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: () {
          if (!isPro) {
             context.push('/pricing');
          } else {
             // Mock export
          }
        },
        icon: const Icon(LucideIcons.fileDown, size: 18),
        label: Text('${'pdf_export_btn'.tr()} ${isPro ? "" : "(Pro)"}'),
        style: ElevatedButton.styleFrom(
          backgroundColor: isPro ? AppTheme.primaryColor : Colors.grey,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }

  Widget _buildPeriodSelector(ProgressState state, WidgetRef ref) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: [
          _buildPeriodBtn(ProgressPeriod.daily, 'يومي', 'Daily', state.period, ref),
          _buildPeriodBtn(ProgressPeriod.weekly, 'أسبوعي', 'Weekly', state.period, ref),
          _buildPeriodBtn(ProgressPeriod.monthly, 'شهري', 'Monthly', state.period, ref),
        ],
      ),
    );
  }

  Widget _buildPeriodBtn(ProgressPeriod p, String labelAr, String labelEn, ProgressPeriod active, WidgetRef ref) {
    final isActive = p == active;
    final label = I18nService.currentLang == Lang.ar ? labelAr : labelEn;
    return Expanded(
      child: GestureDetector(
        onTap: () => ref.read(progressViewModelProvider.notifier).setPeriod(p),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? AppTheme.primaryColor : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(color: isActive ? Colors.white : Colors.grey, fontWeight: isActive ? FontWeight.bold : FontWeight.normal, fontSize: 13),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPeriodSummary(ProgressState state) {
    if (state.period == ProgressPeriod.daily) return const SizedBox.shrink();
    
    final label = state.period == ProgressPeriod.weekly ? "Past 7 Days" : "Past 30 Days";
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              children: [
                const Icon(LucideIcons.calendar, size: 18, color: AppTheme.primaryColor),
                const SizedBox(width: 8),
                Text(label, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildSummaryItem("Calories", state.periodTotalCalories.round().toString(), "kcal", AppTheme.primaryColor),
                _buildSummaryItem("Protein", state.periodTotalProtein.round().toString(), "g", AppTheme.proteinColor),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildSummaryItem("Carbs", state.periodTotalCarbs.round().toString(), "g", AppTheme.carbsColor),
                _buildSummaryItem("Fat", state.periodTotalFat.round().toString(), "g", AppTheme.fatColor),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, String unit, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        margin: const EdgeInsets.symmetric(horizontal: 4),
        decoration: BoxDecoration(
          color: color.withOpacity(0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.1)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 4),
            Row(
              children: [
                Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                const SizedBox(width: 2),
                Text(unit, style: const TextStyle(fontSize: 10, color: Colors.grey)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
