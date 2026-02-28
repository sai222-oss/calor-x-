import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                {/* English */}
                <section className="mb-16">
                    <h1 className="text-4xl font-bold mb-2 text-foreground">Privacy Policy</h1>
                    <p className="text-sm text-muted-foreground mb-8">Last updated: February 2026</p>

                    <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
                        <section>
                            <h2 className="text-2xl font-semibold mb-3">1. Who We Are</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Calor X ("we", "our", "us") is an AI-powered nutrition tracker specializing in Arabic cuisine. We are
                                committed to protecting your personal data and your privacy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">2. Data We Collect</h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                <li>
                                    <strong className="text-foreground">Account data:</strong> Email address and password (hashed) when
                                    you sign up.
                                </li>
                                <li>
                                    <strong className="text-foreground">Profile data:</strong> Optional details such as name, age, weight,
                                    height, and dietary goals you provide during onboarding.
                                </li>
                                <li>
                                    <strong className="text-foreground">Food images:</strong> Photos you upload for nutritional analysis.
                                    Images are processed by OpenAI's GPT-4o vision model and the result is cached in our Supabase database
                                    to reduce repeat API calls.
                                </li>
                                <li>
                                    <strong className="text-foreground">Usage data:</strong> Basic telemetry such as features used and
                                    error logs, used to improve the service.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Data</h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                <li>To provide, maintain, and improve the Calor X service.</li>
                                <li>To analyze food images and return nutritional information to you.</li>
                                <li>To cache analysis results and reduce redundant AI processing.</li>
                                <li>To personalize calorie and macro-nutrient targets based on your profile.</li>
                                <li>To detect and fix bugs and errors.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">4. AI & Third-Party Processing</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Food images are sent to <strong className="text-foreground">OpenAI</strong> for analysis under OpenAI's
                                data processing terms. OpenAI does not use API-submitted content to train their models by default. Image
                                URLs are stored temporarily in our Supabase database as part of the analysis cache.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">5. Data Retention</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Analysis results are stored in our cache indefinitely to improve response times. You may request
                                deletion of your account and all associated data by contacting us. We will process deletion requests
                                within 30 days.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">6. Data Sharing</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We do <strong className="text-foreground">not</strong> sell your personal data. We share data only with:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                                <li>
                                    <strong className="text-foreground">Supabase</strong> — our database and authentication provider.
                                </li>
                                <li>
                                    <strong className="text-foreground">OpenAI</strong> — for AI image analysis only.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">7. Your Rights</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                You have the right to access, correct, export, or delete the personal data we hold about you. To
                                exercise any of these rights, please contact us at{" "}
                                <a href="mailto:privacy@calor-x.app" className="text-primary underline">
                                    privacy@calor-x.app
                                </a>
                                .
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">8. Security</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We use industry-standard measures including HTTPS encryption, Supabase Row-Level Security (RLS), and
                                hashed passwords. No method of transmission over the internet is 100% secure; we strive to use
                                commercially acceptable means to protect your data.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">9. Children's Privacy</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Calor X is not directed to children under 13. We do not knowingly collect personal information from
                                children.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">10. Changes to This Policy</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We may update this policy occasionally. We will notify you of significant changes via email or an
                                in-app notice. Continued use of the app after changes constitutes your acceptance of the updated policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">11. Contact</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                For any privacy-related questions:{" "}
                                <a href="mailto:privacy@calor-x.app" className="text-primary underline">
                                    privacy@calor-x.app
                                </a>
                            </p>
                        </section>
                    </div>
                </section>

                {/* Divider */}
                <hr className="border-border mb-16" />

                {/* Arabic */}
                <section dir="rtl" className="mb-16">
                    <h1 className="text-4xl font-bold mb-2 text-foreground">سياسة الخصوصية</h1>
                    <p className="text-sm text-muted-foreground mb-8">آخر تحديث: فبراير 2026</p>

                    <div className="space-y-8 text-foreground">
                        <section>
                            <h2 className="text-2xl font-semibold mb-3">1. من نحن</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                كالور إكس ("نحن"، "خدمتنا") هو تطبيق تتبع التغذية المدعوم بالذكاء الاصطناعي، متخصص في المطبخ العربي. نلتزم
                                بحماية بياناتك الشخصية وخصوصيتك.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">2. البيانات التي نجمعها</h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                <li>
                                    <strong className="text-foreground">بيانات الحساب:</strong> البريد الإلكتروني وكلمة المرور (مشفرة)
                                    عند التسجيل.
                                </li>
                                <li>
                                    <strong className="text-foreground">بيانات الملف الشخصي:</strong> معلومات اختيارية كالاسم والعمر
                                    والوزن والطول والأهداف الغذائية.
                                </li>
                                <li>
                                    <strong className="text-foreground">صور الطعام:</strong> الصور التي ترفعها لتحليلها غذائياً. تُعالج
                                    بواسطة نموذج GPT-4o من OpenAI ويُخزّن ناتج التحليل في قاعدة بياناتنا.
                                </li>
                                <li>
                                    <strong className="text-foreground">بيانات الاستخدام:</strong> بيانات تشخيصية أساسية لتحسين الخدمة.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">3. كيف نستخدم بياناتك</h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                <li>لتقديم خدمة كالور إكس وصيانتها وتحسينها.</li>
                                <li>لتحليل صور الطعام وإعادة المعلومات الغذائية إليك.</li>
                                <li>لحفظ نتائج التحليل وتقليل معالجة الذكاء الاصطناعي المتكررة.</li>
                                <li>لتخصيص أهداف السعرات الحرارية والمغذيات الكبرى بناءً على ملفك الشخصي.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">4. حقوقك</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                يحق لك الوصول إلى بياناتك الشخصية وتصحيحها أو تصديرها أو حذفها. للتواصل:{" "}
                                <a href="mailto:privacy@calor-x.app" className="text-primary underline">
                                    privacy@calor-x.app
                                </a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">5. الأمان</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                نستخدم تشفير HTTPS وسياسات أمان Supabase على مستوى الصفوف (RLS) وكلمات مرور مشفرة لحماية بياناتك.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">6. التواصل</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                لأي استفسارات تخص الخصوصية:{" "}
                                <a href="mailto:privacy@calor-x.app" className="text-primary underline">
                                    privacy@calor-x.app
                                </a>
                            </p>
                        </section>
                    </div>
                </section>

                <div className="text-center">
                    <Link to="/" className="text-primary hover:underline text-sm">
                        ← Back to Home / العودة للرئيسية
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
