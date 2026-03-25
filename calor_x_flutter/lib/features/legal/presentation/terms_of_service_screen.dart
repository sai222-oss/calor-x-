import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/theme.dart';

class TermsOfServiceScreen extends StatelessWidget {
  const TermsOfServiceScreen({super.key});

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
              title: 'شروط الخدمة',
              subtitle: 'آخر تحديث: فبراير 2026',
              content: [
                _ContentSection(
                  title: '1. قبول الشروط',
                  body: 'باستخدامك لتطبيق كالور إكس ("التطبيق")، فإنك توافق على هذه الشروط وسياسة الخصوصية. إذا كنت لا توافق، يرجى عدم استخدام التطبيق.',
                ),
                _ContentSection(
                  title: '2. وصف الخدمة',
                  body: 'كالور إكس هو تطبيق تتبع تغذية مدعوم بالذكاء الاصطناعي يحلل صور الطعام ويوفر معلومات غذائية تقريبية. التطبيق مخصص لأغراض الصحة العامة وليس بديلاً عن الرعاية الصحية المتخصصة.',
                ),
                _ContentSection(
                  title: '3. حسابات المستخدمين',
                  listItems: [
                    'يجب أن يكون عمرك 13 عامًا على الأقل لإنشاء حساب.',
                    'أنت مسؤول عن الحفاظ على سرية بيانات دخولك.',
                    'أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك.',
                  ],
                ),
                _ContentSection(
                  title: '4. إخلاء مسؤولية الذكاء الاصطناعي',
                  body: 'البيانات الغذائية المقدمة من التطبيق مُولَّدة بواسطة الذكاء الاصطناعي وهي تقديرية فقط. لا تعتمد على التطبيق وحده لإدارة حالة طبية. استشر دائمًا مختصًا صحيًا مؤهلاً قبل إجراء تغييرات غذائية كبيرة.',
                ),
                _ContentSection(
                  title: '5. الاشتراكات والفواتير',
                  body: 'قد يقدم كالور إكس خططًا مجانية ومدفوعة. يتم إصدار فواتير الاشتراكات المدفوعة مسبقًا على أساس شهري أو سنوي. يمكنك الإلغاء في أي وقت؛ ويسري الإلغاء في نهاية فترة الفوترة الحالية.',
                ),
                _ContentSection(
                  title: '6. تحديد المسؤولية',
                  body: 'لن يكون كالور إكس مسؤولاً عن أي أضرار غير مباشرة أو عرضية ناجمة عن استخدامك للخدمة أو الاعتماد على البيانات الغذائية المُولَّدة بالذكاء الاصطناعي.',
                ),
                _ContentSection(
                  title: '7. التواصل',
                  body: 'لأي استفسارات بشأن هذه الشروط: support@calor-x.app',
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
