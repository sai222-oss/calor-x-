import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/i18n_service.dart';
import '../../../core/theme.dart';

class MainLayout extends StatelessWidget {
  final Widget child;
  const MainLayout({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: false,
      body: child,
      floatingActionButton: _buildFAB(context),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: _buildBottomNav(context),
    );
  }

  Widget _buildFAB(BuildContext context) {
    return FloatingActionButton(
      onPressed: () => context.push('/scan'),
      backgroundColor: Colors.transparent,
      elevation: 0,
      shape: const CircleBorder(),
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: const LinearGradient(
            colors: [Color(0xFF1A1A2E), Color(0xFF6C63FF)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF6C63FF).withOpacity(0.4),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: const Icon(LucideIcons.camera, color: Colors.white, size: 28),
      ),
    );
  }

  Widget _buildBottomNav(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    
    int currentIndex = 0;
    if (location.startsWith('/dashboard')) currentIndex = 0;
    else if (location.startsWith('/ai-coach')) currentIndex = 1;
    else if (location.startsWith('/progress')) currentIndex = 3;
    else if (location.startsWith('/profile')) currentIndex = 4;

    return BottomAppBar(
      padding: EdgeInsets.zero,
      notchMargin: 8,
      shape: const CircularNotchedRectangle(),
      clipBehavior: Clip.antiAlias,
      child: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        elevation: 0,
        selectedItemColor: AppTheme.primaryColor,
        unselectedItemColor: AppTheme.mutedColor,
        selectedLabelStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
        unselectedLabelStyle: const TextStyle(fontSize: 10),
        currentIndex: currentIndex,
        onTap: (index) {
          if (index == 2) {
            context.push('/scan');
            return;
          }
          switch (index) {
            case 0:
              context.go('/dashboard');
              break;
            case 1:
              context.go('/ai-coach');
              break;
            case 3:
              context.go('/progress');
              break;
            case 4:
              context.go('/profile');
              break;
          }
        },
        items: [
          BottomNavigationBarItem(icon: const Icon(LucideIcons.home), label: 'nav_home'.tr()),
          BottomNavigationBarItem(icon: const Icon(LucideIcons.messageCircle), label: 'dash_ai_coach'.tr()),
          const BottomNavigationBarItem(icon: Icon(Icons.circle, color: Colors.transparent, size: 32), label: ''),
          BottomNavigationBarItem(icon: const Icon(LucideIcons.trendingUp), label: 'nav_progress'.tr()),
          BottomNavigationBarItem(icon: const Icon(LucideIcons.user), label: 'nav_profile'.tr()),
        ],
      ),
    );
  }
}
