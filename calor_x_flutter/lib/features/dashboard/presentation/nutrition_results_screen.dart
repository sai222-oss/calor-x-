import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'dart:io';
import 'nutrition_results_view_model.dart';
import 'scan_view_model.dart';
import '../data/dashboard_models.dart';
import '../../../core/i18n_service.dart';
import '../../../core/theme.dart';

class NutritionResultsScreen extends ConsumerStatefulWidget {
  final NutritionData initialData;
  const NutritionResultsScreen({super.key, required this.initialData});

  @override
  ConsumerState<NutritionResultsScreen> createState() => _NutritionResultsScreenState();
}

class _NutritionResultsScreenState extends ConsumerState<NutritionResultsScreen> {
  late TextEditingController _weightController;

  @override
  void initState() {
    super.initState();
    _weightController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(nutritionResultsViewModelProvider.notifier).init(widget.initialData);
      _weightController.text = widget.initialData.ingredients.fold(0.0, (sum, i) => sum + i.weightG).round().toString();
    });
  }

  @override
  void dispose() {
    _weightController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(nutritionResultsViewModelProvider);
    final viewModel = ref.read(nutritionResultsViewModelProvider.notifier);

    if (state.data == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      backgroundColor: Colors.white,
      floatingActionButton: _buildFloatingActionBar(context, state, viewModel),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      body: Stack(
        children: [
          SingleChildScrollView(
            child: Column(
              children: [
                _buildImageHeader(state),
                Transform.translate(
                  offset: const Offset(0, -32),
                  child: _buildMainCard(context, state, viewModel),
                ),
                const SizedBox(height: 100),
              ],
            ),
          ),
          if (state.isFixing)
            Container(
              color: Colors.black.withOpacity(0.5),
              child: const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: Colors.white),
                    SizedBox(height: 16),
                    Text('جاري إعادة التحليل...', 
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context, NutritionResultsState state, NutritionResultsViewModel viewModel) {
    return SingleChildScrollView(
      child: Column(
        children: [
          _buildImageHeader(state),
          Transform.translate(
            offset: const Offset(0, -32),
            child: _buildMainCard(context, state, viewModel),
          ),
        ],
      ),
    );
  }

  Widget _buildImageHeader(NutritionResultsState state) {
    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.35,
      width: double.infinity,
      child: Stack(
        children: [
          Positioned.fill(
            child: _buildHeaderImage(state, ref),
          ),
          Positioned(
            top: MediaQuery.of(context).padding.top + 12,
            left: 16,
            child: GestureDetector(
              onTap: () => context.go('/scan'),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(LucideIcons.arrowLeft, color: Colors.white, size: 20),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMainCard(BuildContext context, NutritionResultsState state, NutritionResultsViewModel viewModel) {
    final confidence = (state.data!.confidence * 100).round();
    final dishName = I18nService.currentLang == Lang.ar ? state.data!.dishLabelAr : state.data!.dishLabel;

    return Container(
      constraints: BoxConstraints(minHeight: MediaQuery.of(context).size.height * 0.7),
      margin: EdgeInsets.zero,
      padding: const EdgeInsets.fromLTRB(24, 32, 24, 120),
      decoration: const BoxDecoration(
        color: Color(0xFFF8F9FA),
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 30, offset: Offset(0, -8))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(100),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 4)],
                      ),
                      child: Text(
                        state.data!.matchedFromDb ? 'res_high_accuracy_db_match'.tr() : 'res_confidence'.tr(vars: {'n': confidence}),
                        style: const TextStyle(color: AppTheme.primaryColor, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      dishName,
                      style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Color(0xFF1E1E1E), height: 1.1),
                    ),
                  ],
                ),
              ),
              _buildPortionControl(state, viewModel),
            ],
          ),
          const SizedBox(height: 24),
          _buildCaloriePill(state),
          const SizedBox(height: 12),
          _buildMacroGrid(state),
          const SizedBox(height: 24),
          _buildMicroBreakdown(state),
          const SizedBox(height: 20),
          _buildHealthInsights(state),
          const SizedBox(height: 32),
          Text(
            '${'res_adjust_portions'.tr()} / ${'res_ingredients'.tr()}',
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1),
          ),
          const SizedBox(height: 16),
          _buildIngredientList(state, viewModel),
          const SizedBox(height: 16),
          _buildAddIngredientButton(),
        ],
      ),
    );
  }

  Widget _buildPortionControl(NutritionResultsState state, NutritionResultsViewModel viewModel) {
    return Container(
      width: 100,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF0F0F0)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Column(
        children: [
          TextField(
            controller: _weightController,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
            decoration: const InputDecoration(
              isDense: true,
              contentPadding: EdgeInsets.zero,
              border: InputBorder.none,
            ),
            onChanged: (val) {
              final newWeight = double.tryParse(val);
              if (newWeight != null && newWeight > 0) {
                viewModel.updateTotalWeight(newWeight);
              }
            },
          ),
          const Text('جرام', style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildPortionAction(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.transparent),
        child: Icon(icon, size: 16, color: Colors.grey[600]),
      ),
    );
  }

  Widget _buildCaloriePill(NutritionResultsState state) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(color: const Color(0xFFF8F8FC), borderRadius: BorderRadius.circular(16)),
            child: const Icon(LucideIcons.zap, color: Color(0xFF1A1A2E)),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('res_calories'.tr().toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
              Text(
                state.totalCalories.round().toString(),
                style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, height: 1.0),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMacroGrid(NutritionResultsState state) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 3,
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1.0,
      children: [
        _buildMacroPill('res_protein_g'.tr(), state.totalProtein, 'g', AppTheme.proteinColor),
        _buildMacroPill('res_carbs_g'.tr(), state.totalCarbs, 'g', AppTheme.carbsColor),
        _buildMacroPill('res_fat_g'.tr(), state.totalFat, 'g', AppTheme.fatColor),
      ],
    );
  }

  Widget _buildMacroPill(String label, double value, String unit, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: color.withOpacity(0.1)),
        boxShadow: [BoxShadow(color: color.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
            child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color)),
          ),
          const Spacer(),
          Text(
            '${value.round()}$unit',
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF1E1E1E)),
          ),
        ],
      ),
    );
  }

  Widget _buildMicroBreakdown(NutritionResultsState state) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(LucideIcons.activity, color: AppTheme.primaryColor, size: 18),
              const SizedBox(width: 10),
              Text('res_vitamins'.tr(), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
            ],
          ),
          const SizedBox(height: 20),
          _buildMicroItem('vit_a', state.totalVitA, 'mcg', state),
          _buildMicroItem('vit_c', state.totalVitC, 'mg', state),
          _buildMicroItem('vit_d', state.totalVitD, 'mcg', state),
          _buildMicroItem('vit_b12', state.totalVitB12, 'mcg', state),
          _buildMicroItem('calcium', state.totalCalcium, 'mg', state),
          _buildMicroItem('iron', state.totalIron, 'mg', state),
          _buildMicroItem('magnesium', state.totalMagnesium, 'mg', state),
          _buildMicroItem('potassium', state.totalPotassium, 'mg', state),
          _buildMicroItem('zinc', state.totalZinc, 'mg', state),
          _buildMicroItem('sodium', state.totalSodium, 'mg', state),
          _buildMicroItem('fiber', state.totalFiber, 'g', state),
          _buildMicroItem('sugar', state.totalSugar, 'g', state),
        ],
      ),
    );
  }

  Widget _buildMicroItem(String key, double value, String unit, NutritionResultsState state) {
    final percent = state.getRDIPercent(key, value);
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(key.tr(), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              Text('${value.toStringAsFixed(1)} $unit', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
            ],
          ),
          const SizedBox(height: 8),
          Stack(
            children: [
              Container(
                height: 6,
                width: double.infinity,
                decoration: BoxDecoration(color: const Color(0xFFF0F0F0), borderRadius: BorderRadius.circular(3)),
              ),
              FractionallySizedBox(
                widthFactor: percent,
                child: Container(
                  height: 6,
                  decoration: BoxDecoration(
                    color: key == 'sugar' || key == 'sodium' 
                      ? (percent > 0.8 ? Colors.orange : AppTheme.primaryColor)
                      : AppTheme.primaryColor, 
                    borderRadius: BorderRadius.circular(3)
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHealthInsights(NutritionResultsState state) {
    final tip = I18nService.currentLang == Lang.ar ? state.data!.healthTipAr : state.data!.healthTipEn;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(28)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(LucideIcons.zap, color: AppTheme.primaryColor, size: 16),
                  const SizedBox(width: 8),
                  Text('res_health_insights'.tr(), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                ],
              ),
              const Text('8/10', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: const Color(0xFFF8F8FC), borderRadius: BorderRadius.circular(16)),
            child: Text(tip, style: const TextStyle(fontSize: 13, color: Colors.grey, height: 1.4)),
          ),
        ],
      ),
    );
  }

  Widget _buildIngredientList(NutritionResultsState state, NutritionResultsViewModel viewModel) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: state.editableIngredients.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final ing = state.editableIngredients[index];
        return _buildIngredientRow(index, ing, viewModel);
      },
    );
  }

  Widget _buildIngredientRow(int index, Ingredient ing, NutritionResultsViewModel viewModel) {
    final name = I18nService.currentLang == Lang.ar ? ing.nameAr : ing.nameEn;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
      child: Row(
        children: [
          const Text('🍲', style: TextStyle(fontSize: 20)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                Text('${ing.calories.round()} kcal', style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
          ),
          const SizedBox(width: 12),
          SizedBox(
            width: 80,
            child: TextField(
              keyboardType: TextInputType.number,
              textAlign: TextAlign.center,
              decoration: InputDecoration(
                contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                isDense: true,
                suffixText: 'g',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                filled: true,
                fillColor: const Color(0xFFF8F8FC),
              ),
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
              controller: TextEditingController(text: ing.weightG.round().toString())..selection = TextSelection.collapsed(offset: ing.weightG.round().toString().length),
              onChanged: (val) {
                final weight = double.tryParse(val);
                if (weight != null) {
                  viewModel.updateIngredientWeight(index, weight);
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddIngredientButton() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppTheme.primaryColor.withOpacity(0.2), style: BorderStyle.solid),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(LucideIcons.plus, color: AppTheme.primaryColor, size: 16),
          const SizedBox(width: 8),
          Text('res_add_hidden_ingredient'.tr(), style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 14)),
        ],
      ),
    );
  }

  Widget _buildFloatingActionBar(BuildContext context, NutritionResultsState state, NutritionResultsViewModel viewModel) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).padding.bottom + 20),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.95),
          border: const Border(top: BorderSide(color: Color(0xFFF0F0F0))),
        ),
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () {
                  ref.read(scanViewModelProvider.notifier).reset();
                  // Force fresh rebuild of ScanScreen using unique key via query param
                  context.go('/scan?t=${DateTime.now().millisecondsSinceEpoch}');
                },
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  side: const BorderSide(color: Color(0xFFF0F0F0)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
                ),
                child: Text('res_scan_another'.tr(), style: const TextStyle(color: Color(0xFF1E1E1E), fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: OutlinedButton(
                onPressed: () => _showFixDialog(context, state, viewModel),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  side: const BorderSide(color: Color(0xFFF0F0F0)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
                ),
                child: Text('res_fix_results'.tr(), style: const TextStyle(color: Color(0xFF1E1E1E), fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ElevatedButton(
                onPressed: state.isSaving ? null : () async {
                  final success = await viewModel.saveMeal();
                  if (success && mounted) {
                    context.go('/dashboard');
                  }
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  backgroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
                ),
                child: state.isSaving 
                   ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                   : Text('res_done'.tr(), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showFixDialog(BuildContext context, NutritionResultsState state, NutritionResultsViewModel viewModel) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('res_fix_results'.tr()),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(I18nService.currentLang == Lang.ar ? "أخبرنا ما الخطأ في هذه النتيجة؟" : "What is wrong with this result?"),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              maxLines: 3,
              textDirection: I18nService.currentLang == Lang.ar ? TextDirection.rtl : TextDirection.ltr,
              textAlign: I18nService.currentLang == Lang.ar ? TextAlign.right : TextAlign.left,
              style: const TextStyle(color: Colors.black, fontSize: 14), // Fix invisible text
              decoration: InputDecoration(
                hintText: I18nService.currentLang == Lang.ar ? "مثال: هذه بيتزا وليست فطيرة" : "Example: This is pizza, not a pie",
                hintStyle: TextStyle(color: Colors.grey.shade400),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
                fillColor: const Color(0xFFF8F8FC),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: Text(I18nService.currentLang == Lang.ar ? "إلغاء" : "Cancel")),
          ElevatedButton(
            onPressed: () async {
              final correction = controller.text.trim();
              if (correction.isEmpty) return;
              
              Navigator.pop(context); // Close dialog
              await viewModel.fixAnalysis(correction);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.black,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text(I18nService.currentLang == Lang.ar ? "إرسال" : "Send"),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderImage(NutritionResultsState state, WidgetRef ref) {
    final previewPath = ref.watch(scanViewModelProvider).previewImage;
    
    if (previewPath != null && File(previewPath).existsSync()) {
      return Image.file(File(previewPath), fit: BoxFit.cover);
    }
    
    if (state.data?.imageUrl != null) {
      return Image.network(state.data!.imageUrl!, fit: BoxFit.cover);
    }
    
    return Container(
      color: const Color(0xFFF0EFFF),
      child: const Center(
        child: Icon(LucideIcons.camera, color: AppTheme.primaryColor, size: 48),
      ),
    );
  }
}
