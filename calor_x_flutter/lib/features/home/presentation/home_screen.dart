import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/i18n_service.dart';
import '../../../core/theme.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  void _checkSession() {
    final session = Supabase.instance.client.auth.currentSession;
    if (session != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.go('/dashboard');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildHero(context),
            _buildFeatures(context),
            _buildFooter(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHero(BuildContext context) {
    return Stack(
      children: [
        // Background Image
        Container(
          height: MediaQuery.of(context).size.height,
          width: double.infinity,
          decoration: const BoxDecoration(
            color: Color(0xFF1A1A2E),
          ),
          child: Opacity(
            opacity: 0.9,
            child: CachedNetworkImage(
              imageUrl: 'https://images.unsplash.com/photo-1547928576-a4a3323dce9a?w=800',
              fit: BoxFit.cover,
              errorWidget: (context, url, error) => const SizedBox(),
            ),
          ),
        ),
        // Overlays
        Container(
          height: MediaQuery.of(context).size.height,
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.transparent,
                const Color(0xFF1A1A2E).withOpacity(0.5),
                const Color(0xFF1A1A2E),
              ],
            ),
          ),
        ),
        Container(
          height: MediaQuery.of(context).size.height,
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: [
                Colors.purple.withOpacity(0.1),
                Colors.pinkAccent.withOpacity(0.1),
              ],
            ),
          ),
        ),
        // Content
        Positioned.fill(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 60),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(100),
                    border: Border.all(color: Colors.white.withOpacity(0.2)),
                    boxShadow: [BoxShadow(color: AppTheme.primaryColor.withOpacity(0.3), blurRadius: 15)],
                  ),
                  child: Text(
                    'app_name'.tr().toUpperCase(),
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.2),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'hero_tag'.tr(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.w900, height: 1.2),
                ),
                const SizedBox(height: 16),
                Text(
                  'hero_desc'.tr(),
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 18, fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 48),
                SizedBox(
                  width: 240,
                  height: 64,
                  child: ElevatedButton(
                    onPressed: () => context.push('/auth'),
                    style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.zero,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
                      elevation: 10,
                      shadowColor: AppTheme.primaryColor.withOpacity(0.5),
                    ),
                    child: Ink(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFF1A1A2E), Color(0xFF6C63FF)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                        borderRadius: BorderRadius.circular(100),
                        border: Border.all(color: Colors.white.withOpacity(0.1)),
                      ),
                      child: Container(
                        alignment: Alignment.center,
                        child: Text('hero_cta'.tr(), style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        // Header
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          child: ClipRect(
            child: BackdropFilter(
              filter: ui.ImageFilter.blur(sigmaX: 16, sigmaY: 16),
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF1A1A2E).withOpacity(0.85),
                  border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.1))),
                ),
                child: SafeArea(
                  bottom: false,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Calor X',
                          style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1),
                        ),
                        Row(
                          children: [
                            TextButton(
                              onPressed: () => context.push('/auth'),
                              style: TextButton.styleFrom(
                                foregroundColor: Colors.white.withOpacity(0.9),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              ),
                              child: Text('auth_sign_in'.tr(), style: const TextStyle(fontWeight: FontWeight.w600)),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton(
                              onPressed: () => context.push('/auth', extra: {'mode': 'signup'}),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF6C63FF),
                                foregroundColor: Colors.white,
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
                              ),
                              child: Text('auth_sign_up'.tr(), style: const TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFeatures(BuildContext context) {
    final features = [
      {'icon': LucideIcons.camera, 'title': 'feat_recognition_title'.tr(), 'desc': 'feat_recognition_desc'.tr(), 'image': 'https://images.unsplash.com/photo-1547928576-a4a3323dce9a?w=800'},
      {'icon': LucideIcons.brain, 'title': 'feat_breakdown_title'.tr(), 'desc': 'feat_breakdown_desc'.tr(), 'image': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800'},
      {'icon': LucideIcons.messageSquare, 'title': 'feat_coach_title'.tr(), 'desc': 'feat_coach_desc'.tr(), 'image': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'},
      {'icon': LucideIcons.shield, 'title': 'feat_secure_title'.tr(), 'desc': 'feat_secure_desc'.tr(), 'image': 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800'},
    ];

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      child: Column(
        children: [
          Text('feat_title'.tr(), textAlign: TextAlign.center, style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
          const SizedBox(height: 12),
          Text('feat_subtitle'.tr(), textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, color: Colors.grey)),
          const SizedBox(height: 60),
          ...features.map((f) => _buildFeatureCard(f)),
        ],
      ),
    );
  }

  Widget _buildFeatureCard(Map<String, dynamic> f) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: Colors.grey[100]!),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
            child: SizedBox(
              height: 200,
              width: double.infinity,
              child: CachedNetworkImage(
                imageUrl: f['image'],
                fit: BoxFit.cover,
                errorWidget: (context, url, error) => Container(color: Colors.grey[200], child: const Icon(Icons.error)),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(color: AppTheme.primaryColor.withOpacity(0.08), borderRadius: BorderRadius.circular(16)),
                  child: Icon(f['icon'] as IconData, color: AppTheme.primaryColor, size: 20),
                ),
                const SizedBox(height: 16),
                Text(f['title'] as String, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
                const SizedBox(height: 12),
                Text(f['desc'] as String, style: const TextStyle(fontSize: 14, color: Color(0xFF4B5563), height: 1.6)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 40),
      child: Column(
        children: [
          const Divider(),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextButton(onPressed: () => context.push('/privacy'), child: Text('prof_privacy'.tr(), style: const TextStyle(color: Colors.grey))),
              const Text(' • ', style: TextStyle(color: Colors.grey)),
              TextButton(onPressed: () => context.push('/terms'), child: Text('prof_terms'.tr(), style: const TextStyle(color: Colors.grey))),
            ],
          ),
          const SizedBox(height: 20),
          Text('© 2026 Calor X. All rights reserved.', style: const TextStyle(color: Colors.grey, fontSize: 12)),
        ],
      ),
    );
  }
}
