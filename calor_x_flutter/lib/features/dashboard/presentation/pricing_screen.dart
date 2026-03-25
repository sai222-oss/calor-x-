import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/i18n_service.dart';
import '../../../core/theme.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class PricingScreen extends StatefulWidget {
  const PricingScreen({super.key});

  @override
  State<PricingScreen> createState() => _PricingScreenState();
}

class _PricingScreenState extends State<PricingScreen> {
  bool isYearly = true;
  String? userId;
  String? userEmail;

  @override
  void initState() {
    super.initState();
    final user = Supabase.instance.client.auth.currentUser;
    if (user != null) {
      userId = user.id;
      userEmail = user.email;
    }
  }

  void _handleProCheckout() async {
    if (userId == null) {
      context.push('/auth');
      return;
    }

    const variantMonthly = "d9756ec1-1e8b-4e71-b15a-b2edff5e4bbe";
    const variantYearly = "feab0bcd-4222-4841-a1a4-10f05b915b01";
    final variantId = isYearly ? variantYearly : variantMonthly;
    final checkoutUrl = "https://calorx.lemonsqueezy.com/checkout/buy/$variantId?checkout[email]=$userEmail";

    final uri = Uri.parse(checkoutUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8FC),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(icon: const Icon(LucideIcons.arrowLeft, color: Color(0xFF1A1A2E)), onPressed: () => context.pop()),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildHeader(),
            const SizedBox(height: 24),
            _buildBillingToggle(),
            const SizedBox(height: 32),
            _buildPlansGrid(),
            const SizedBox(height: 40),
            Text('price_footer'.tr(), style: const TextStyle(fontSize: 12, color: Colors.grey)),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          Text('price_title'.tr(), textAlign: TextAlign.center, style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E))),
          const SizedBox(height: 12),
          Text('price_subtitle'.tr(), textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, color: Color(0xFF8888A0))),
        ],
      ),
    );
  }

  Widget _buildBillingToggle() {
    return Column(
      children: [
        Container(
          width: 340,
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey[200]!), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)]),
          child: Row(
            children: [
              _buildToggleBtn('toggle_monthly'.tr(), !isYearly, () => setState(() => isYearly = false)),
              _buildToggleBtn('toggle_yearly'.tr(), isYearly, () => setState(() => isYearly = true)),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          decoration: BoxDecoration(color: const Color(0xFF1A1A2E), borderRadius: BorderRadius.circular(100)),
          child: const Text('⭐ وفر 40% مع الخطة السنوية', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  Widget _buildToggleBtn(String label, bool active, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(color: active ? AppTheme.primaryColor : Colors.transparent, borderRadius: BorderRadius.circular(16), boxShadow: active ? [BoxShadow(color: AppTheme.primaryColor.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 4))] : null),
          alignment: Alignment.center,
          child: Text(label, style: TextStyle(color: active ? Colors.white : const Color(0xFF8888A0), fontSize: 13, fontWeight: FontWeight.w900)),
        ),
      ),
    );
  }

  Widget _buildPlansGrid() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          _buildPlanCard(
            name: 'plan_free'.tr(),
            price: '0',
            period: 'forever'.tr(),
            desc: 'desc_free'.tr(),
            features: ['feat_scan_1', 'feat_basic_info', 'feat_community_support', 'nav_coach', 'feat_full_macro', 'feat_no_ads'],
            featStatus: [true, true, true, false, false, false],
            cta: 'cta_start_free'.tr(),
            isPopular: false,
            highlight: false,
            onTap: () => context.go('/auth'),
          ),
          const SizedBox(height: 24),
          _buildPlanCard(
            name: 'plan_pro'.tr(),
            price: isYearly ? '3' : '5',
            period: 'per_month'.tr(),
            desc: isYearly ? 'يُفوتر بـ 36\$/سنوياً' : 'desc_pro'.tr(),
            features: ['feat_scan_unlimited', 'feat_ai_coach', 'feat_meal_planning', 'feat_pdf_reports', 'feat_micro', 'feat_priority'],
            featStatus: [true, true, true, true, true, true],
            cta: 'cta_get_pro'.tr(),
            isPopular: true,
            highlight: true,
            onTap: _handleProCheckout,
          ),
        ],
      ),
    );
  }

  Widget _buildPlanCard({
    required String name,
    required String price,
    required String period,
    required String desc,
    required List<String> features,
    required List<bool> featStatus,
    required String cta,
    required bool isPopular,
    required bool highlight,
    required VoidCallback onTap,
  }) {
    final bg = highlight ? AppTheme.primaryColor : Colors.white;
    final textCol = highlight ? Colors.white : const Color(0xFF1A1A2E);
    final secTextCol = highlight ? Colors.white70 : const Color(0xFF8888A0);

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(24),
            border: highlight ? Border.all(color: AppTheme.primaryColor, width: 2) : Border.all(color: Colors.transparent),
            boxShadow: [BoxShadow(color: highlight ? AppTheme.primaryColor.withOpacity(0.12) : const Color(0xFF6C63FF).withOpacity(0.04), blurRadius: 30, offset: const Offset(0, 8))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: textCol)),
              const SizedBox(height: 16),
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text('\$', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: secTextCol)),
                  Text(price, style: TextStyle(fontSize: 56, fontWeight: FontWeight.w900, color: textCol)),
                  const SizedBox(width: 4),
                  Text(period, style: TextStyle(fontSize: 14, color: secTextCol)),
                ],
              ),
              const SizedBox(height: 8),
              Text(desc, style: TextStyle(fontSize: 13, color: secTextCol)),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: onTap,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: highlight ? Colors.white : AppTheme.primaryColor,
                    foregroundColor: highlight ? AppTheme.primaryColor : Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
                  ),
                  child: Text(cta, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
              const SizedBox(height: 24),
              ...List.generate(features.length, (idx) {
                final isIncluded = featStatus[idx];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    children: [
                      Icon(isIncluded ? LucideIcons.check : LucideIcons.x, size: 18, color: isIncluded ? (highlight ? Colors.white : AppTheme.primaryColor) : (highlight ? Colors.white24 : Colors.grey[200])),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          features[idx].tr(),
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: isIncluded ? textCol : secTextCol),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
        if (isPopular)
          Positioned(
            top: -16,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(color: const Color(0xFF1A1A2E), borderRadius: BorderRadius.circular(100)),
                child: Text('popular_badge'.tr(), style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ),
          ),
      ],
    );
  }
}
