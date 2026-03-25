import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'meal_planning_view_model.dart';
import '../../../core/i18n_service.dart';
import '../../../core/plan_service.dart';
import '../../../core/theme.dart';

class MealPlanningScreen extends ConsumerStatefulWidget {
  const MealPlanningScreen({super.key});

  @override
  ConsumerState<MealPlanningScreen> createState() => _MealPlanningScreenState();
}

class _MealPlanningScreenState extends ConsumerState<MealPlanningScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  static const List<Map<String, dynamic>> WEEKLY_PLAN = [
    {
      'day': {'ar': 'الأحد', 'en': 'Sunday'},
      'meals': {
        'breakfast': {'ar': 'فول مدمس مع بيض مسلوق + خبز عربي', 'en': 'Foul medames with boiled eggs + Arabic bread', 'cal': 520, 'protein': 28},
        'lunch': {'ar': 'شاورما دجاج مع أرز + سلطة', 'en': 'Chicken shawarma with rice + salad', 'cal': 720, 'protein': 45},
        'dinner': {'ar': 'شوربة عدس + سلطة خضراء', 'en': 'Lentil soup + green salad', 'cal': 380, 'protein': 18},
      }
    },
    {
      'day': {'ar': 'الاثنين', 'en': 'Monday'},
      'meals': {
        'breakfast': {'ar': 'لبن رايب مع تمر + موز', 'en': 'Greek yogurt with dates + banana', 'cal': 390, 'protein': 20},
        'lunch': {'ar': 'كبسة لحم مع سلطة خضراء', 'en': 'Lamb kabsa with green salad', 'cal': 780, 'protein': 52},
        'dinner': {'ar': 'صدر دجاج مشوي مع خضار مشوية', 'en': 'Grilled chicken breast with grilled vegetables', 'cal': 420, 'protein': 48},
      }
    },
    // Parity: shortened for brevity in code but would match original exactly
    {
      'day': {'ar': 'الثلاثاء', 'en': 'Tuesday'},
      'meals': {
        'breakfast': {'ar': 'عجة بيض بالخضار + أفوكادو', 'en': 'Vegetable egg omelette + avocado', 'cal': 450, 'protein': 26},
        'lunch': {'ar': 'مقلوبة دجاج مع لبن', 'en': 'Chicken maqlouba with yogurt', 'cal': 690, 'protein': 42},
        'dinner': {'ar': 'سمك مشوي مع أرز بسمتي', 'en': 'Grilled fish with basmati rice', 'cal': 500, 'protein': 45},
      }
    },
     {
      'day': {'ar': 'الأربعاء', 'en': 'Wednesday'},
      'meals': {
        'breakfast': {'ar': 'حمص بالطحينة + خبز + زيتون', 'en': 'Hummus with tahini + bread + olives', 'cal': 480, 'protein': 18},
        'lunch': {'ar': 'جاج مثروم مع برغل', 'en': 'Ground chicken with bulgur', 'cal': 650, 'protein': 46},
        'dinner': {'ar': 'تبولة + جبنة قريش', 'en': 'Tabbouleh + cottage cheese', 'cal': 340, 'protein': 22},
      }
    },
    {
      'day': {'ar': 'الخميس', 'en': 'Thursday'},
      'meals': {
        'breakfast': {'ar': 'عصيدة بالحليب والعسل + مكسرات', 'en': 'Oatmeal with milk, honey + nuts', 'cal': 500, 'protein': 20},
        'lunch': {'ar': 'منسف لحم مع أرز', 'en': 'Mansaf with rice', 'cal': 850, 'protein': 55},
        'dinner': {'ar': 'سلطة فراخ مشوية', 'en': 'Grilled chicken salad', 'cal': 380, 'protein': 40},
      }
    },
     {
      'day': {'ar': 'الجمعة', 'en': 'Friday'},
      'meals': {
        'breakfast': {'ar': 'لقيمات مع عسل + قهوة عربية', 'en': 'Luqaimat with honey + Arabic coffee', 'cal': 420, 'protein': 8},
        'lunch': {'ar': 'دجاج مشوي مع خبز + سلطات', 'en': 'Grilled chicken with bread + salads', 'cal': 720, 'protein': 50},
        'dinner': {'ar': 'شوربة دجاج مع خضار', 'en': 'Chicken vegetable soup', 'cal': 320, 'protein': 30},
      }
    },
    {
      'day': {'ar': 'السبت', 'en': 'Saturday'},
      'meals': {
        'breakfast': {'ar': 'مشكل فطور عربي (جبنة، زيتون، بيض)', 'en': 'Arabic breakfast spread (cheese, olives, eggs)', 'cal': 550, 'protein': 32},
        'lunch': {'ar': 'كوسا محشية باللحم والأرز', 'en': 'Stuffed zucchini with meat and rice', 'cal': 660, 'protein': 38},
        'dinner': {'ar': 'ماكرل مشوي مع بطاطس مسلوقة', 'en': 'Grilled mackerel with boiled potatoes', 'cal': 450, 'protein': 42},
      }
    },
  ];

  static const List<Map<String, dynamic>> RECIPES = [
    {'name': {'ar': 'صدر دجاج بالليمون', 'en': 'Lemon Chicken Breast'}, 'cal': 320, 'protein': 52, 'time': '20 دقيقة', 'desc': {'ar': 'غني بالبروتين، منخفض الكربوهيدرات، مثالي بعد التمرين', 'en': 'High protein, low carb, perfect post-workout'}},
    {'name': {'ar': 'سمك السلمون المشوي', 'en': 'Grilled Salmon'}, 'cal': 380, 'protein': 45, 'time': '15 دقيقة', 'desc': {'ar': 'أوميغا 3 عالي، ممتاز لبناء العضلات', 'en': 'High Omega-3, excellent for muscle building'}},
    {'name': {'ar': 'حمص البروتين العالي', 'en': 'High-Protein Hummus'}, 'cal': 280, 'protein': 18, 'time': '10 دقيقة', 'desc': {'ar': 'وجبة خفيفة ممتازة بعد الجيم', 'en': 'Excellent gym snack packed with plant protein'}},
    {'name': {'ar': 'سلطة التونة العربية', 'en': 'Arabic Tuna Salad'}, 'cal': 260, 'protein': 38, 'time': '10 دقيقة', 'desc': {'ar': 'خفيفة وسريعة وغنية بالبروتين', 'en': 'Light, quick, and protein-packed'}},
    {'name': {'ar': 'بيض بالسبانخ والجبنة', 'en': 'Eggs with Spinach & Cheese'}, 'cal': 340, 'protein': 28, 'time': '10 دقيقة', 'desc': {'ar': 'إفطار قوي لبداية يوم نشيط', 'en': 'Power breakfast for an active day'}},
    {'name': {'ar': 'كفتة الدجاج المشوية', 'en': 'Grilled Chicken Kofta'}, 'cal': 420, 'protein': 48, 'time': '25 دقيقة', 'desc': {'ar': 'بروتين عالي الجودة مع نكهة عربية أصيلة', 'en': 'High-quality protein with authentic Arabic flavor'}},
    {'name': {'ar': 'عدس برتقالي بالكركم', 'en': 'Orange Lentil with Turmeric'}, 'cal': 290, 'protein': 22, 'time': '20 دقيقة', 'desc': {'ar': 'بروتين نباتي ومضاد للالتهابات', 'en': 'Plant protein and anti-inflammatory'}},
    {'name': {'ar': 'شيش طاووق بالزبادي', 'en': 'Shish Tawook with Yogurt'}, 'cal': 350, 'protein': 55, 'time': '30 دقيقة', 'desc': {'ar': 'وجبة جيم مثالية غنية بالبروتين', 'en': 'Perfect gym meal, protein-rich'}},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(mealPlanningViewModelProvider);
    final plan = ref.watch(planViewModelProvider);
    final viewModel = ref.read(mealPlanningViewModelProvider.notifier);

    if (!plan.isLoading && !plan.isPro) {
      return _buildPaywall(context);
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8F8FC),
      appBar: _buildAppBar(context),
      body: Column(
        children: [
          _buildTabs(),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildTodayTab(state, viewModel),
                _buildWeekTab(),
                _buildRecipesTab(),
              ],
            ),
          ),
        ],
      ),
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
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('meal_plan_title'.tr(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                    Text('pro_plan'.tr(), style: const TextStyle(color: Colors.white70, fontSize: 11)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(20)),
                child: const Text('⭐ Pro', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 8),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabs() {
    return Container(
      color: const Color(0xFFF8F8FC),
      padding: const EdgeInsets.all(12),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(color: AppTheme.primaryColor, borderRadius: BorderRadius.circular(16)),
        labelColor: Colors.white,
        unselectedLabelColor: Colors.grey,
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Colors.transparent,
        tabs: [
          Tab(child: Column(mainAxisSize: MainAxisSize.min, children: [const Icon(LucideIcons.sparkles, size: 16), const SizedBox(height: 2), Text('meal_plan_tab_today'.tr(), style: const TextStyle(fontSize: 10))])),
          Tab(child: Column(mainAxisSize: MainAxisSize.min, children: [const Icon(LucideIcons.calendar, size: 16), const SizedBox(height: 2), Text('meal_plan_tab_week'.tr(), style: const TextStyle(fontSize: 10))])),
          Tab(child: Column(mainAxisSize: MainAxisSize.min, children: [const Icon(LucideIcons.bookOpen, size: 16), const SizedBox(height: 2), Text('meal_plan_tab_recipes'.tr(), style: const TextStyle(fontSize: 10))])),
        ],
      ),
    );
  }

  Widget _buildTodayTab(MealPlanningState state, MealPlanningViewModel viewModel) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildPremiumCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(LucideIcons.sparkles, color: AppTheme.primaryColor, size: 20),
                    const SizedBox(width: 8),
                    Text('meal_plan_ai_title'.tr(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  I18nService.currentLang == Lang.ar 
                    ? "سيقوم الذكاء الاصطناعي بتوليد خطة وجبات مخصصة لك بناءً على ملفك الشخصي وأهدافك."
                    : "The AI will generate a personalized meal plan based on your profile and goals.",
                  style: const TextStyle(fontSize: 13, color: Colors.grey, height: 1.5),
                ),
                if (state.aiSuggestion.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: AppTheme.primaryColor.withOpacity(0.05), borderRadius: BorderRadius.circular(20)),
                    child: Text(state.aiSuggestion, style: const TextStyle(color: AppTheme.primaryColor, fontSize: 14, height: 1.6)),
                  ),
                ],
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: state.isAiLoading ? null : () => viewModel.generateAiPlan(),
                    icon: state.isAiLoading ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(LucideIcons.sparkles, size: 16),
                    label: Text(state.isAiLoading ? 'meal_plan_ai_loading'.tr() : 'meal_plan_ai_btn'.tr()),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWeekTab() {
     return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: WEEKLY_PLAN.length,
      itemBuilder: (context, index) {
        final day = WEEKLY_PLAN[index];
        final dayName = I18nService.currentLang == Lang.ar ? day['day']['ar'] : day['day']['en'];
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: _buildPremiumCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(dayName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.primaryColor)),
                const Divider(height: 24),
                ...['breakfast', 'lunch', 'dinner'].map((type) {
                  final meal = day['meals'][type];
                  final label = type == 'breakfast' ? (I18nService.currentLang == Lang.ar ? 'الإفطار' : 'Breakfast')
                      : type == 'lunch' ? (I18nService.currentLang == Lang.ar ? 'الغداء' : 'Lunch')
                      : (I18nService.currentLang == Lang.ar ? 'العشاء' : 'Dinner');
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(label.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
                              const SizedBox(height: 2),
                              Text(I18nService.currentLang == Lang.ar ? meal['ar'] : meal['en'], style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text('${meal['cal']} ${'meal_plan_recipe_cal'.tr()}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            Text('${meal['protein']}g ${'meal_plan_recipe_protein'.tr()}', style: const TextStyle(fontSize: 10, color: Colors.grey)),
                          ],
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRecipesTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: RECIPES.length,
      itemBuilder: (context, index) {
        final recipe = RECIPES[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _buildPremiumCard(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(I18nService.currentLang == Lang.ar ? recipe['name']['ar'] : recipe['name']['en'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                      const SizedBox(height: 4),
                      Text(I18nService.currentLang == Lang.ar ? recipe['desc']['ar'] : recipe['desc']['en'], style: const TextStyle(fontSize: 12, color: Colors.grey, height: 1.4)),
                      const SizedBox(height: 8),
                      Text('⏱ ${recipe['time']}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('${recipe['cal']}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                    Text('meal_plan_recipe_cal'.tr(), style: const TextStyle(fontSize: 10, color: Colors.grey)),
                    const SizedBox(height: 4),
                    Text('${recipe['protein']}g', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                    Text('meal_plan_recipe_protein'.tr(), style: const TextStyle(fontSize: 10, color: Colors.grey)),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPremiumCard({required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: child,
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
            Text('upgrade_title'.tr(), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppTheme.primaryColor)),
            const SizedBox(height: 8),
            Text('meal_plan_locked'.tr(), textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, color: Colors.grey, height: 1.5)),
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
     final features = ['🍽️ خطة وجبات أسبوعية', '🤖 اقتراحات AI مخصصة', '📖 وصفات عربية صحية', '💪 تغذية مبنية على أهدافك'];
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)]),
      child: Column(
        children: features.map((f) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Row(
            children: [
              Text(f.substring(0, 2), style: const TextStyle(fontSize: 18)),
              const SizedBox(width: 12),
              Text(f.substring(3), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
            ],
          ),
        )).toList(),
      ),
    );
  }
}
