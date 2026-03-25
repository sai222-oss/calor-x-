import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/i18n_service.dart';
import '../../../core/theme.dart';

class ProfileSetupScreen extends ConsumerStatefulWidget {
  const ProfileSetupScreen({super.key});

  @override
  ConsumerState<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends ConsumerState<ProfileSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _ageController = TextEditingController();
  final TextEditingController _weightController = TextEditingController();
  final TextEditingController _heightController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _countryController = TextEditingController();

  String _goal = "maintain";
  String _activity = "moderate";
  String _fitnessLevel = "beginner";
  String _dietaryPreference = "no_restriction";

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) throw Exception('err_not_logged_in'.tr());

      final weight = double.parse(_weightController.text);
      final height = double.parse(_heightController.text);
      final age = int.parse(_ageController.text);

      // BMR estimate (Mifflin-St Jeor)
      final bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      final activityMultipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
      };
      final tdee = bmr * (activityMultipliers[_activity] ?? 1.2);

      double calTarget = tdee;
      if (_goal == "lose") calTarget -= 500;
      if (_goal == "gain") calTarget += 500;

      final protTarget = weight * 2; // 2g per kg
      final fatTarget = (calTarget * 0.25) / 9;
      final carbTarget = (calTarget - (protTarget * 4) - (fatTarget * 9)) / 4;

      await Future.wait([
        Supabase.instance.client.from('profiles').upsert({
          'id': user.id,
          'full_name': _nameController.text,
          'age': age,
          'weight_kg': weight,
          'height_cm': height,
          'health_goal': _goal == "lose" ? "lose_weight" : _goal == "gain" ? "gain_muscle" : "maintenance",
          'activity_level': _activity,
          'onboarding_completed': true,
          'phone_number': _phoneController.text.isEmpty ? null : _phoneController.text,
          'country': _countryController.text.isEmpty ? null : _countryController.text,
          'fitness_level': _fitnessLevel,
          'dietary_preferences': _dietaryPreference != "no_restriction" ? [_dietaryPreference] : null
        }),
        Supabase.instance.client.from('daily_goals').upsert({
          'user_id': user.id,
          'calories_target': calTarget.round(),
          'protein_g_target': protTarget.round(),
          'carbs_g_target': carbTarget.round(),
          'fat_g_target': fatTarget.round()
        })
      ]);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('prof_setup_saved'.tr())));
        context.go('/dashboard');
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final ar = I18nService.currentLang == Lang.ar;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F8FC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Color(0xFF1A1A2E)),
          onPressed: () => context.pop(),
        ),
        title: Text('setup_title'.tr(), style: const TextStyle(color: Color(0xFF1A1A2E), fontWeight: FontWeight.bold, fontSize: 18)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              _buildCard(
                title: ar ? "المعلومات الأساسية" : "Basic Info",
                children: [
                  _buildInput(label: 'setup_name'.tr(), controller: _nameController),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: _buildInput(label: 'setup_age'.tr(), controller: _ageController, isNumber: true)),
                      const SizedBox(width: 16),
                      Expanded(child: _buildInput(label: 'setup_weight'.tr(), controller: _weightController, isNumber: true)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _buildInput(label: 'setup_height'.tr(), controller: _heightController, isNumber: true),
                  const SizedBox(height: 16),
                  _buildInput(label: ar ? "رقم الهاتف (اختياري)" : "Phone Number (Optional)", controller: _phoneController, isPhone: true),
                  const SizedBox(height: 16),
                  _buildInput(label: ar ? "البلد (اختياري)" : "Country (Optional)", controller: _countryController),
                ],
              ),
              const SizedBox(height: 24),
              _buildCard(
                title: ar ? "اللياقة والنظام الغذائي" : "Fitness & Diet",
                children: [
                  _buildLabel('setup_goal'.tr()),
                  const SizedBox(height: 12),
                  Column(
                    children: [
                      _buildGoalBtn('lose', 'prof_goal_fat_loss'.tr()),
                      const SizedBox(height: 8),
                      _buildGoalBtn('maintain', 'prof_goal_maintain'.tr()),
                      const SizedBox(height: 8),
                      _buildGoalBtn('gain', 'prof_goal_muscle'.tr()),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _buildLabel('prof_activity'.tr()),
                  const SizedBox(height: 8),
                  _buildDropdown(
                    value: _activity,
                    items: {
                      'sedentary': 'prof_act_sedentary'.tr(),
                      'light': 'prof_act_light'.tr(),
                      'moderate': 'prof_act_moderate'.tr(),
                      'active': 'prof_act_active'.tr(),
                      'very_active': 'prof_act_very_active'.tr(),
                    },
                    onChanged: (v) => setState(() => _activity = v!),
                  ),
                  const SizedBox(height: 24),
                  _buildLabel(ar ? "مستوى اللياقة" : "Fitness Level"),
                  const SizedBox(height: 8),
                  _buildDropdown(
                    value: _fitnessLevel,
                    items: {
                      'beginner': ar ? "مبتدئ" : "Beginner",
                      'intermediate': ar ? "متوسط" : "Intermediate",
                      'advanced': ar ? "متقدم" : "Advanced",
                    },
                    onChanged: (v) => setState(() => _fitnessLevel = v!),
                  ),
                  const SizedBox(height: 24),
                  _buildLabel(ar ? "التفضيل الغذائي" : "Dietary Preference"),
                  const SizedBox(height: 8),
                  _buildDropdown(
                    value: _dietaryPreference,
                    items: {
                      'no_restriction': ar ? "لا قيود" : "No Restriction",
                      'vegetarian': ar ? "نباتي (فيجيتيريان)" : "Vegetarian",
                      'vegan': ar ? "نباتي صرف (فيجان)" : "Vegan",
                      'halal': ar ? "حلال" : "Halal",
                      'keto': ar ? "كيتو" : "Keto",
                    },
                    onChanged: (v) => setState(() => _dietaryPreference = v!),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 64,
                child: ElevatedButton(
                  onPressed: _loading ? null : _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                    elevation: 10,
                    shadowColor: AppTheme.primaryColor.withOpacity(0.5),
                  ),
                  child: _loading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(LucideIcons.sparkles, color: Colors.white),
                            const SizedBox(width: 12),
                            Text('setup_start'.tr(), style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCard({required String title, required List<Widget> children}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(28), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
          const SizedBox(height: 8),
          const Divider(),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInput({required String label, required TextEditingController controller, bool isNumber = false, bool isPhone = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel(label),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: isNumber ? TextInputType.number : (isPhone ? TextInputType.phone : TextInputType.text),
          decoration: InputDecoration(
            isDense: true,
            filled: true,
            fillColor: const Color(0xFFF8F8FC),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          ),
          validator: (v) => (v == null || v.isEmpty) ? "Required" : null,
        ),
      ],
    );
  }

  Widget _buildLabel(String label) {
    return Text(label.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryColor, letterSpacing: 1));
  }

  Widget _buildGoalBtn(String id, String label) {
    final active = _goal == id;
    return GestureDetector(
      onTap: () => setState(() => _goal = id),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: active ? AppTheme.primaryColor : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: active ? AppTheme.primaryColor : AppTheme.primaryColor.withOpacity(0.1), width: 2),
        ),
        alignment: Alignment.center,
        child: Text(label, style: TextStyle(color: active ? Colors.white : Colors.grey[600], fontWeight: FontWeight.bold, fontSize: 14)),
      ),
    );
  }

  Widget _buildDropdown({required String value, required Map<String, String> items, required void Function(String?) onChanged}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(color: const Color(0xFFF8F8FC), borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.primaryColor.withOpacity(0.1))),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          isExpanded: true,
          icon: const Icon(LucideIcons.chevronDown, size: 16, color: AppTheme.primaryColor),
          onChanged: onChanged,
          items: items.entries.map((e) => DropdownMenuItem(value: e.key, child: Text(e.value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)))).toList(),
        ),
      ),
    );
  }
}
