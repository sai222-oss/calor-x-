import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-16 max-w-4xl">


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
                        ← العودة للرئيسية
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
