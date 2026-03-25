import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Color(0xFF1A1A2E)),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSection(
              title: 'سياسة الخصوصية',
              subtitle: 'آخر تحديث: فبراير 2026',
              content: [
                _ContentSection(
                  title: '1. من نحن',
                  body: 'كالور إكس ("نحن"، "خدمتنا") هو تطبيق تتبع التغذية المدعوم بالذكاء الاصطناعي، متخصص في المطبخ العربي. نلتزم بحماية بياناتك الشخصية وخصوصيتك.',
                ),
                _ContentSection(
                  title: '2. البيانات التي نجمعها',
                  listItems: [
                    'بيانات الحساب: البريد الإلكتروني وكلمة المرور (مشفرة) عند التسجيل.',
                    'بيانات الملف الشخصي: معلومات اختيارية كالاسم والعمر والوزن والطول والأهداف الغذائية.',
                    'صور الطعام: الصور التي ترفعها لتحليلها غذائياً. تُعالج بواسطة نموذج GPT-4o من OpenAI ويُخزّن ناتج التحليل في قاعدة بياناتنا.',
                    'بيانات الاستخدام: بيانات تشخيصية أساسية لتحسين الخدمة.',
                  ],
                ),
                _ContentSection(
                  title: '3. كيف نستخدم بياناتك',
                  listItems: [
                    'لتقديم خدمة كالور إكس وصيانتها وتحسينها.',
                    'لتحليل صور الطعام وإعادة المعلومات الغذائية إليك.',
                    'لحفظ نتائج التحليل وتقليل معالجة الذكاء الاصطناعي المتكررة.',
                    'لتخصيص أهداف السعرات الحرارية والمغذيات الكبرى بناءً على ملفك الشخصي.',
                  ],
                ),
                _ContentSection(
                  title: '4. حقوقك',
                  body: 'يحق لك الوصول إلى بياناتك الشخصية وتصحيحها أو تصديرها أو حذفها. للتواصل: privacy@calor-x.app',
                ),
                _ContentSection(
                  title: '5. الأمان',
                  body: 'نستخدم تشفير HTTPS وسياسات أمان Supabase على مستوى الصفوف (RLS) وكلمات مرور مشفرة لحماية بياناتك.',
                ),
                _ContentSection(
                  title: '6. التواصل',
                  body: 'لأي استفسارات تخص الخصوصية: privacy@calor-x.app',
                ),
              ],
            ),
            const SizedBox(height: 40),
            Center(
              child: TextButton(
                onPressed: () => context.go('/'),
                child: const Text('← العودة للرئيسية', style: TextStyle(color: AppTheme.primaryColor)),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({required String title, required String subtitle, required List<_ContentSection> content}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E))),
        const SizedBox(height: 8),
        Text(subtitle, style: const TextStyle(fontSize: 14, color: Colors.grey)),
        const SizedBox(height: 32),
        ...content.map((s) => Padding(
              padding: const EdgeInsets.only(bottom: 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(s.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E))),
                  const SizedBox(height: 12),
                  if (s.body != null)
                    Text(s.body!, style: const TextStyle(fontSize: 16, color: Color(0xFF8888A0), height: 1.6)),
                  if (s.listItems != null)
                    ...s.listItems!.map((item) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Padding(
                                padding: EdgeInsets.only(top: 8),
                                child: Icon(Icons.circle, size: 6, color: Color(0xFF8888A0)),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(item, style: const TextStyle(fontSize: 16, color: Color(0xFF8888A0), height: 1.6)),
                              ),
                            ],
                          ),
                        )),
                ],
              ),
            )),
      ],
    );
  }
}

class _ContentSection {
  final String title;
  final String? body;
  final List<String>? listItems;

  _ContentSection({required this.title, this.body, this.listItems});
}
