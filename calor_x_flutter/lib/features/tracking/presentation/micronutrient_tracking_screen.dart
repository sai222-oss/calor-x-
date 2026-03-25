import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'micronutrient_view_model.dart';
import '../../../core/i18n_service.dart';
import '../../../core/plan_service.dart';
import '../../../core/theme.dart';

class MicronutrientTrackingScreen extends ConsumerStatefulWidget {
  const MicronutrientTrackingScreen({super.key});

  @override
  ConsumerState<MicronutrientTrackingScreen> createState() => _MicronutrientTrackingScreenState();
}

class _MicronutrientTrackingScreenState extends ConsumerState<MicronutrientTrackingScreen> {
  String _activeCategory = 'vitamin';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(micronutrientViewModelProvider.notifier).fetchMicros();
    });
  }

  Color _getPctColor(int pct) {
    if (pct >= 80) return const Color(0xFF6C63FF);
    if (pct >= 40) return Colors.grey[400]!;
    return const Color(0xFFEF4444);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(micronutrientViewModelProvider);
    final plan = ref.watch(planViewModelProvider);
    final viewModel = ref.read(micronutrientViewModelProvider.notifier);

    if (!plan.isLoading && !plan.isPro) {
      return _buildPaywall(context);
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8F8FC),
      appBar: _buildAppBar(context),
      body: state.isLoading 
        ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor))
        : state.micros.every((m) => m.amount == 0) 
            ? _buildNoData(context)
            : _buildContent(context, state),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return PreferredSize(
      preferredSize: const Size.fromHeight(70),
      child: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF1A1A2E), Color(0xFF6C63FF)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
                onPressed: () => context.pop(),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('micro_title'.tr(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                    Text('micro_7day'.tr(), style: const TextStyle(color: Colors.white70, fontSize: 11)),
                  ],
                ),
              ),
              const Icon(LucideIcons.flaskConical, color: Colors.white70, size: 20),
              const SizedBox(width: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNoData(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(color: AppTheme.primaryColor.withOpacity(0.08), shape: BoxShape.circle),
              child: Icon(LucideIcons.pill, color: AppTheme.primaryColor.withOpacity(0.4), size: 40),
            ),
            const SizedBox(height: 24),
            Text('micro_no_data'.tr(), textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.grey)),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.push('/scan'),
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
              child: Text('scan_title'.tr()),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, MicronutrientState state) {
    final filtered = state.micros.where((m) => m.category == _activeCategory).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('micro_subtitle'.tr(), style: const TextStyle(fontSize: 13, color: Colors.grey)),
          const SizedBox(height: 16),
          _buildCategoryTabs(),
          const SizedBox(height: 16),
          ...filtered.map((micro) => _buildMicroCard(micro)),
          const SizedBox(height: 24),
          _buildLegend(),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildCategoryTabs() {
    return Row(
      children: [
        Expanded(child: _buildTabButton('vitamin', 'micro_vitamins'.tr())),
        const SizedBox(width: 12),
        Expanded(child: _buildTabButton('mineral', 'micro_minerals'.tr())),
      ],
    );
  }

  Widget _buildTabButton(String category, String label) {
    final isActive = _activeCategory == category;
    return GestureDetector(
      onTap: () => setState(() => _activeCategory = category),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isActive ? AppTheme.primaryColor : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.black.withOpacity(0.05)),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(color: isActive ? Colors.white : Colors.grey, fontSize: 13, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildMicroCard(MicroEntry micro) {
    final name = I18nService.currentLang == Lang.ar ? micro.labelAr : micro.label;
    final color = _getPctColor(micro.pct);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                    if (micro.sources.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text('${'micro_sources'.tr()}: ${micro.sources.take(2).join(", ")}', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                      ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('${micro.pct}%', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: color)),
                  Text('${micro.amount} / ${micro.rdi} ${micro.unit}', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            height: 8,
            width: double.infinity,
            decoration: BoxDecoration(color: Colors.black.withOpacity(0.05), borderRadius: BorderRadius.circular(4)),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: (micro.pct / 100).clamp(0, 1),
              child: Container(decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4))),
            ),
          ),
          const SizedBox(height: 6),
          Text('micro_rdi'.tr(), style: const TextStyle(fontSize: 10, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildLegend() {
    final items = [
      {'color': const Color(0xFF6C63FF), 'label': I18nService.currentLang == Lang.ar ? '≥ 80% — ممتاز' : '≥ 80% — Excellent'},
      {'color': Colors.grey[400]!, 'label': I18nService.currentLang == Lang.ar ? '40–79% — جيد' : '40–79% — Good'},
      {'color': const Color(0xFFEF4444), 'label': I18nService.currentLang == Lang.ar ? '< 40% — يحتاج تحسين' : '< 40% — Needs improvement'},
    ];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(I18nService.currentLang == Lang.ar ? 'دليل الألوان' : 'Color Guide', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
          const SizedBox(height: 12),
          ...items.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Container(width: 12, height: 12, decoration: BoxDecoration(color: item['color'] as Color, shape: BoxShape.circle)),
                const SizedBox(width: 12),
                Text(item['label'] as String, style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          )).toList(),
        ],
      ),
    );
  }

  Widget _buildPaywall(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8FC),
      appBar: _buildAppBar(context),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            const SizedBox(height: 40),
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(shape: BoxShape.circle, gradient: LinearGradient(colors: [Color(0xFF1A1A2E), Color(0xFF6C63FF)])),
              child: const Icon(LucideIcons.lock, color: Colors.white, size: 32),
            ),
            const SizedBox(height: 24),
            Text('micro_locked_title'.tr(), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppTheme.primaryColor)),
            const SizedBox(height: 8),
            Text('micro_locked_desc'.tr(), textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, color: Colors.grey, height: 1.5)),
            const SizedBox(height: 32),
            _buildFeatureHighlights(),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => context.push('/pricing'),
                icon: const Icon(LucideIcons.zap, size: 18),
                label: Text('upgrade_btn'.tr()),
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureHighlights() {
    final features = [
      {'icon': '🔬', 'text': 'تتبع الفيتامينات والمعادن'},
      {'icon': '📊', 'text': 'تحليل دقيق لنقص التغذية'},
      {'icon': '🍎', 'text': 'اقتراحات أطعمة لسد النقص'},
    ];
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)]),
      child: Column(
        children: features.map((f) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            children: [
              Text(f['icon']!, style: const TextStyle(fontSize: 18)),
              const SizedBox(width: 12),
              Text(f['text']!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
            ],
          ),
        )).toList(),
      ),
    );
  }
}
