import { Link } from "react-router-dom";

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-16 max-w-4xl">



                {/* Arabic */}
                <section dir="rtl" className="mb-16">
                    <h1 className="text-4xl font-bold mb-2 text-foreground">شروط الخدمة</h1>
                    <p className="text-sm text-muted-foreground mb-8">آخر تحديث: فبراير 2026</p>

                    <div className="space-y-8 text-foreground">
                        <section>
                            <h2 className="text-2xl font-semibold mb-3">1. قبول الشروط</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                باستخدامك لتطبيق كالور إكس ("التطبيق")، فإنك توافق على هذه الشروط وسياسة الخصوصية. إذا كنت لا توافق، يرجى عدم استخدام التطبيق.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">2. وصف الخدمة</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                كالور إكس هو تطبيق تتبع تغذية مدعوم بالذكاء الاصطناعي يحلل صور الطعام ويوفر معلومات غذائية تقريبية. التطبيق مخصص لأغراض الصحة العامة <strong className="text-foreground">وليس</strong> بديلاً عن الرعاية الصحية المتخصصة.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">3. حسابات المستخدمين</h2>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                <li>يجب أن يكون عمرك 13 عامًا على الأقل لإنشاء حساب.</li>
                                <li>أنت مسؤول عن الحفاظ على سرية بيانات دخولك.</li>
                                <li>أنت مسؤول عن جميع الأنشطة التي تحدث تحت حسابك.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">4. إخلاء مسؤولية الذكاء الاصطناعي</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                البيانات الغذائية المقدمة من التطبيق مُولَّدة بواسطة الذكاء الاصطناعي وهي <strong className="text-foreground">تقديرية فقط</strong>. لا تعتمد على التطبيق وحده لإدارة حالة طبية. استشر دائمًا مختصًا صحيًا مؤهلاً قبل إجراء تغييرات غذائية كبيرة.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">5. الاشتراكات والفواتير</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                قد يقدم كالور إكس خططًا مجانية ومدفوعة. يتم إصدار فواتير الاشتراكات المدفوعة مسبقًا على أساس شهري أو سنوي. يمكنك الإلغاء في أي وقت؛ ويسري الإلغاء في نهاية فترة الفوترة الحالية.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">6. تحديد المسؤولية</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                لن يكون كالور إكس مسؤولاً عن أي أضرار غير مباشرة أو عرضية ناجمة عن استخدامك للخدمة أو الاعتماد على البيانات الغذائية المُولَّدة بالذكاء الاصطناعي.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">7. التواصل</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                لأي استفسارات بشأن هذه الشروط:{" "}
                                <a href="mailto:support@calor-x.app" className="text-primary underline">
                                    support@calor-x.app
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

export default TermsOfService;
