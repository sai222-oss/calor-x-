import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/i18n_service.dart';
import '../../../core/theme.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF1A1A2E),
              Color(0xFF303050),
              const Color(0xFF6C63FF),
            ],
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'app_name'.tr(),
                style: const TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'مساعدك الذكي للتغذية الصحية',
                style: TextStyle(color: Colors.white, fontSize: 20),
              ),
              const SizedBox(height: 48),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  children: [
                    _buildFeatureItem(
                      icon: LucideIcons.smartphone,
                      title: 'مسح ذكي للطعام',
                      desc: 'التعرف على الأطباق العربية بدقة عالية',
                    ),
                    const SizedBox(height: 24),
                    _buildFeatureItem(
                      icon: LucideIcons.brain,
                      title: 'مدرب AI شخصي',
                      desc: 'نصائح مخصصة لأهدافك الصحية',
                    ),
                    const SizedBox(height: 24),
                    _buildFeatureItem(
                      icon: LucideIcons.trendingUp,
                      title: 'تتبع تقدمك',
                      desc: 'راقب سعراتك وعناصرك الغذائية',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    final session = Supabase.instance.client.auth.currentSession;
                    if (session != null) {
                      context.go('/dashboard');
                    } else {
                      context.push('/profile-setup');
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF1A1A2E),
                    padding: const EdgeInsets.symmetric(vertical: 24),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 10,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Text(
                        'ابدأ الآن مع تجربة مجانية لمدة 7 أيام',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(width: 8),
                      Icon(LucideIcons.arrowLeft, size: 20), // Arabic RTL handled by layout if specified
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureItem({required IconData icon, required String title, required String desc}) {
    return Row(
      textDirection: TextDirection.rtl,
      children: [
        Icon(icon, color: Colors.white, size: 36),
        const SizedBox(width: 24),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            textDirection: TextDirection.rtl,
            children: [
              Text(
                title,
                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                desc,
                style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 14),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
