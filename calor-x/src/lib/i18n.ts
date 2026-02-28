// i18n string library for Calor X
// Default language: Arabic (ar)

export type Lang = "ar" | "en";

const strings = {
    // ─── Common ───────────────────────────────────────────
    app_name: { ar: "كالور إكس", en: "Calor X" },
    loading: { ar: "جاري التحميل…", en: "Loading…" },
    save: { ar: "حفظ", en: "Save" },
    cancel: { ar: "إلغاء", en: "Cancel" },
    back: { ar: "رجوع", en: "Back" },
    close: { ar: "إغلاق", en: "Close" },
    setup: { ar: "إعداد", en: "Setup" },

    // ─── Bottom Nav ────────────────────────────────────────
    nav_home: { ar: "الرئيسية", en: "Home" },
    nav_scan: { ar: "مسح", en: "Scan" },
    nav_coach: { ar: "مدرب AI", en: "AI Coach" },
    nav_profile: { ar: "الملف", en: "Profile" },

    // ─── Dashboard ─────────────────────────────────────────
    dash_welcome: { ar: "مرحباً بك", en: "Welcome" },
    dash_greeting: { ar: "مرحباً، {{name}}", en: "Hi, {{name}}" },
    dash_today_summary: { ar: "ملخص اليوم", en: "Today's Summary" },
    dash_of_target: { ar: "من {{n}} كيلوسعرة", en: "of {{n}} kcal" },
    dash_remaining: { ar: "متبقي {{n}} كيلوسعرة", en: "{{n}} remaining" },
    dash_meals_logged: { ar: "{{n}} وجبة مسجلة اليوم", en: "{{n}} meal(s) logged today" },
    dash_recent_meals: { ar: "آخر الوجبات", en: "Recent Meals" },
    dash_no_meals: { ar: "لا توجد وجبات اليوم", en: "No meals logged today." },
    dash_scan_first: { ar: "اضغط الكاميرا لمسح أول وجبة!", en: "Tap the camera to scan your first meal!" },
    dash_progress: { ar: "التقدم", en: "Progress" },
    dash_view_trends: { ar: "عرض الإحصائيات", en: "View trends" },
    dash_ai_coach: { ar: "مدرب AI", en: "AI Coach" },
    dash_personal_tips: { ar: "نصائح مخصصة لك", en: "Personalized tips" },
    dash_kcal: { ar: "كيلوسعرة", en: "kcal" },
    dash_protein: { ar: "بروتين", en: "Protein" },
    dash_carbs: { ar: "كربوهيدرات", en: "Carbs" },
    dash_fat: { ar: "دهون", en: "Fat" },
    dash_protein_short: { ar: "ب", en: "P" },
    goal_lose_weight: { ar: "🔥 وضع إنقاص الوزن", en: "🔥 Fat Loss Mode" },
    goal_gain_muscle: { ar: "💪 وضع بناء العضلات", en: "💪 Muscle Gain Mode" },
    goal_maintain: { ar: "⚖️ وضع المحافظة", en: "⚖️ Maintenance Mode" },

    // ─── Scan ──────────────────────────────────────────────
    scan_title: { ar: "مسح الطعام", en: "Scan Food" },
    scan_tap_to_pick: { ar: "اضغط لاختيار صورة", en: "Tap to pick a photo" },
    scan_tap_subtitle: { ar: "صوّر طعامك لتحليله", en: "Photo your food to analyse it" },
    scan_analysing: { ar: "جاري تحليل الطعام…", en: "Analysing food…" },
    scan_please_wait: { ar: "قد يستغرق ذلك لحظة", en: "This may take a moment" },
    scan_camera: { ar: "كاميرا", en: "Camera" },
    scan_upload: { ar: "رفع صورة", en: "Upload" },
    scan_another: { ar: "مسح صورة أخرى", en: "Scan Another" },
    scan_tips_title: { ar: "نصائح لأفضل نتيجة", en: "Tips for best results" },
    scan_tip1: { ar: "إضاءة جيدة", en: "Good lighting" },
    scan_tip2: { ar: "الطعام في مركز الصورة", en: "Food centered in frame" },
    scan_tip3: { ar: "زاوية من الأعلى أفضل", en: "Top-down angle works best" },
    scan_tip4: { ar: "تجنب الظلال الكثيفة", en: "Avoid heavy shadows" },
    scan_uploaded: { ar: "تم رفع الصورة — جاري التحليل…", en: "Image uploaded — analysing…" },
    scan_err_type: { ar: "الرجاء اختيار صورة JPEG أو PNG أو WebP", en: "Please select a JPEG, PNG or WebP image" },
    scan_err_size: { ar: "يجب أن يكون حجم الصورة أقل من 5 ميجابايت", en: "Image must be under 5 MB" },
    scan_err_login: { ar: "الرجاء تسجيل الدخول أولاً", en: "Please log in first" },

    // ─── Results ───────────────────────────────────────────
    res_title: { ar: "نتائج التحليل", en: "Analysis Results" },
    res_confidence: { ar: "متأكد بنسبة {{n}}%", en: "Confident {{n}}%" },
    res_cached: { ar: "مخزن مؤقتاً", en: "Cached" },
    res_edited: { ar: "تم التعديل", en: "Edited" },
    res_summary: { ar: "ملخص الغذاء", en: "Nutrition Summary" },
    res_calories: { ar: "سعرات", en: "Calories" },
    res_protein_g: { ar: "بروتين", en: "Protein" },
    res_carbs_g: { ar: "كربوهيدرات", en: "Carbs" },
    res_fat_g: { ar: "دهون", en: "Fat" },
    res_fiber_g: { ar: "ألياف", en: "Fiber" },
    res_sugar_g: { ar: "سكر", en: "Sugar" },
    res_sodium_mg: { ar: "صوديوم", en: "Sodium" },
    res_progress: { ar: "التقدم اليومي", en: "Daily Progress" },
    res_gym_intel: { ar: "تحليل الرياضيين", en: "Gym Intelligence" },
    res_meal_timing: { ar: "توقيت الوجبة", en: "Meal Timing" },
    res_gi: { ar: "مؤشر السكر (GI)", en: "Glycemic Index" },
    res_protein_quality: { ar: "جودة البروتين", en: "Protein Quality" },
    res_health_insights: { ar: "نصائح صحية", en: "Health Insights" },
    res_ingredients: { ar: "المكونات المكتشفة (قابلة للتعديل)", en: "Detected Ingredients (Editable)" },
    res_edit_hint: { ar: "اضغط على القلم لتعديل الوزن", en: "Tap pencil to edit weight" },
    res_vitamins: { ar: "الفيتامينات والمعادن", en: "Vitamins & Minerals" },
    res_add_today: { ar: "أضف إلى اليوم", en: "Add to Today" },
    res_saving: { ar: "جاري الحفظ…", en: "Saving…" },
    res_save_success: { ar: "تم حفظ الوجبة!", en: "Meal saved!" },
    res_save_error: { ar: "فشل حفظ الوجبة", en: "Failed to save meal" },

    // ─── Progress ──────────────────────────────────────────
    prog_title: { ar: "تقدمك", en: "Your Progress" },
    prog_day_streak: { ar: "🔥 أيام متتالية", en: "🔥 Day Streak" },
    prog_total_meals: { ar: "🍽️ إجمالي الوجبات", en: "🍽️ Total Meals" },
    prog_7day_cal: { ar: "السعرات — آخر 7 أيام", en: "Calories — Last 7 Days" },
    prog_no_meals_week: { ar: "لا توجد وجبات هذا الأسبوع. ابدأ بمسح طعامك!", en: "No meals logged this week. Start scanning food!" },
    prog_today_vs_goals: { ar: "اليوم مقارنة بالأهداف", en: "Today vs Goals" },
    prog_setup_goals: { ar: "أكمل إعداد ملفك الشخصي لرؤية أهدافك", en: "Complete your profile setup to see goals" },
    prog_calories: { ar: "السعرات الحرارية", en: "Calories" },
    prog_protein: { ar: "البروتين", en: "Protein" },
    prog_carbs: { ar: "الكربوهيدرات", en: "Carbs" },
    prog_fat: { ar: "الدهون", en: "Fat" },
    prog_below_goal: { ar: "دون الهدف", en: "Below Goal" },
    prog_goal_reached: { ar: "الهدف محقق ✓", en: "Goal Reached ✓" },
    // Arabic short day names (RTL order Sun→Sat)
    day_sun: { ar: "أح", en: "Sun" },
    day_mon: { ar: "إث", en: "Mon" },
    day_tue: { ar: "ثل", en: "Tue" },
    day_wed: { ar: "أر", en: "Wed" },
    day_thu: { ar: "خم", en: "Thu" },
    day_fri: { ar: "جم", en: "Fri" },
    day_sat: { ar: "سب", en: "Sat" },

    // ─── AI Coach ──────────────────────────────────────────
    coach_title: { ar: "مدرب الذكاء الاصطناعي", en: "AI Coach" },
    coach_subtitle: { ar: "متخصص في التغذية والرياضة", en: "Nutrition & Fitness Specialist" },
    coach_greeting: { ar: "مرحباً! أنا مدرب كالور إكس الذكي 💪\n\nأعرف ملفك الشخصي وأهدافك اليومية وكل ما أكلته اليوم — لذلك يمكنني تقديم نصائح حقيقية ومخصصة لك.\n\nاسألني عن التغذية، وجبات الجيم، أو أهدافك!", en: "Hello! I'm your Calor X AI Coach 💪\n\nI know your profile, daily goals, and everything you've eaten today — so I can give you real, personalized advice.\n\nAsk me anything about nutrition, gym meals, or your targets!" },
    coach_quick_title: { ar: "أسئلة سريعة", en: "QUICK QUESTIONS" },
    coach_placeholder: { ar: "اكتب سؤالك هنا…", en: "Ask about meals, macros, gym nutrition…" },
    coach_send_hint: { ar: "اضغط Enter للإرسال · Shift+Enter لسطر جديد", en: "Press Enter to send · Shift+Enter for new line" },
    coach_analyzing: { ar: "جاري تحليل بياناتك…", en: "Analyzing your data…" },
    coach_error: { ar: "تعذر الاتصال بمدرب الذكاء الاصطناعي. تحقق من اتصالك.", en: "Failed to reach AI Coach. Check your connection." },
    coach_error_msg: { ar: "⚠️ تعذر الاتصال بالخادم الآن. حاول مرة أخرى.", en: "⚠️ Couldn't connect to the server right now. Please try again." },

    // ─── Profile ───────────────────────────────────────────
    prof_title: { ar: "الملف الشخصي", en: "Profile" },
    prof_user: { ar: "مستخدم", en: "User" },
    prof_biometrics: { ar: "القياسات الجسدية", en: "Biometrics" },
    prof_weight: { ar: "الوزن", en: "Weight" },
    prof_height: { ar: "الطول", en: "Height" },
    prof_age: { ar: "العمر", en: "Age" },
    prof_bmi: { ar: "مؤشر كتلة الجسم", en: "BMI" },
    prof_bmi_under: { ar: "نقص الوزن", en: "Underweight" },
    prof_bmi_healthy: { ar: "وزن طبيعي", en: "Healthy" },
    prof_bmi_over: { ar: "زيادة وزن", en: "Overweight" },
    prof_bmi_obese: { ar: "سمنة", en: "Obese" },
    prof_activity: { ar: "مستوى النشاط", en: "Activity Level" },
    prof_act_sedentary: { ar: "خامل", en: "Sedentary" },
    prof_act_light: { ar: "نشاط خفيف", en: "Lightly Active" },
    prof_act_moderate: { ar: "نشاط معتدل", en: "Moderately Active" },
    prof_act_active: { ar: "نشيط جداً", en: "Very Active" },
    prof_act_very_active: { ar: "رياضي محترف", en: "Athlete" },
    prof_daily_targets: { ar: "الأهداف اليومية", en: "Daily Targets" },
    prof_this_week: { ar: "هذا الأسبوع", en: "This Week" },
    prof_meals_logged: { ar: "وجبات مسجلة", en: "Meals logged" },
    prof_kcal_tracked: { ar: "كيلوسعرة مسجلة", en: "kcal tracked" },
    prof_edit: { ar: "تعديل الملف", en: "Edit Profile" },
    prof_privacy: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
    prof_terms: { ar: "شروط الخدمة", en: "Terms of Service" },
    prof_logout: { ar: "تسجيل الخروج", en: "Sign Out" },
    prof_logout_ok: { ar: "تم تسجيل الخروج", en: "Logged out" },
    prof_goal_fat_loss: { ar: "خسارة دهون", en: "Fat Loss" },
    prof_goal_muscle: { ar: "بناء عضلات", en: "Muscle Gain" },
    prof_goal_maintain: { ar: "الحفاظ على الوزن", en: "Maintenance" },

    // ─── Setup ────────────────────────────────────────────
    setup_title: { ar: "أنشئ ملفك الشخصي", en: "Create Your Profile" },
    setup_name: { ar: "الاسم", en: "Name" },
    setup_age: { ar: "العمر", en: "Age" },
    setup_weight: { ar: "الوزن (كجم)", en: "Weight (kg)" },
    setup_height: { ar: "الطول (سم)", en: "Height (cm)" },
    setup_goal: { ar: "هدفك", en: "Your Goal" },
    setup_start: { ar: "ابدأ رحلتك", en: "Start Journey" },
    setup_saving: { ar: "جاري حفظ الملف…", en: "Saving profile…" },

    // ─── Quick coach prompts ────────────────────────────────
    qp1: { ar: "ماذا أتناول بعد التمرين اليوم؟", en: "What should I eat post-workout today?" },
    qp2: { ar: "هل أحقق هدف البروتين؟", en: "Am I hitting my protein goal?" },
    qp3: { ar: "اقترح وجبة عربية غنية بالبروتين", en: "Suggest a high-protein Arab meal" },
    qp4: { ar: "كم تبقى من سعراتي الحرارية؟", en: "How many calories do I have left?" },
    qp5: { ar: "أفضل وجبة قبل التمرين من المطبخ العربي؟", en: "Best pre-workout meal from Arab cuisine?" },

    // ─── Pricing ──────────────────────────────────────────
    price_title: { ar: "اختر خطتك", en: "Choose Your Plan" },
    price_subtitle: { ar: "اشترك أو ألغِ في أي وقت — بدون قيود أو رسوم خفية.", en: "Upgrade or cancel anytime — no lock-in, no hidden fees." },
    price_footer: { ar: "جميع الأسعار بالدولار الأمريكي · إلغاء في أي وقت · بدون عقود", en: "All prices in USD · Cancel anytime · No contracts" },

    plan_free: { ar: "مجاني", en: "Free" },
    plan_standard: { ar: "قياسي", en: "Standard" },
    plan_pro: { ar: "احترافي", en: "Pro" },

    desc_free: { ar: "جرّب التطبيق بدون بطاقة", en: "Try it out, no card needed" },
    desc_standard: { ar: "مثالي للمتابعة اليومية المنتظمة", en: "Everything you need for daily tracking" },
    desc_pro: { ar: "للرياضيين وأصحاب الأهداف الجادة", en: "For serious athletes & health goals" },

    feat_community_support: { ar: "دعم مجتمعي", en: "Community support" },
    feat_scan_1: { ar: "وجبة واحدة يومياً", en: "1 food scan per day" },
    feat_scan_10: { ar: "10 وجبات يومياً", en: "10 food scans per day" },
    feat_scan_unlimited: { ar: "مسح غير محدود", en: "Unlimited food scans" },
    feat_basic_info: { ar: "معلومات السعرات الأساسية", en: "Basic calorie info only" },
    feat_full_macro: { ar: "تحليل العناصر الغذائية بالكامل", en: "Full macro & calorie breakdown" },
    feat_trends: { ar: "إحصائيات التقدم", en: "Health trends & progress charts" },
    feat_no_ads: { ar: "بدون إعلانات", en: "No ads" },
    feat_ai_coach: { ar: "مدرب الذكاء الاصطناعي (غير محدود)", en: "AI Nutrition Coach (unlimited)" },
    feat_meal_planning: { ar: "تخطيط الوجبات وافكار وصفات", en: "Meal planning & recipe ideas" },
    feat_pdf_reports: { ar: "تقارير PDF وتصدير البيانات", en: "PDF reports & data export" },
    feat_micro: { ar: "تتبع المغذيات الدقيقة (فيتامينات)", en: "Micronutrient tracking (vitamins, minerals)" },
    feat_priority: { ar: "دعم فني ذو أولوية", en: "Priority support" },

    cta_start_free: { ar: "ابدأ مجاناً", en: "Start Free" },
    cta_get_standard: { ar: "احصل على قياسي", en: "Get Standard" },
    cta_get_pro: { ar: "احصل على احترافي", en: "Get Pro" },

    popular_badge: { ar: "⭐ الأكثر شيوعاً", en: "⭐ Most Popular" },
    forever: { ar: "للأبد", en: "forever" },
    per_month: { ar: "/شهرياً", en: "/month" },

    // ─── Landing Page ─────────────────────────────────────
    hero_tag: { ar: "تغذية ذكية للمطبخ العربي", en: "AI-Powered Nutrition for Arabic Cuisine" },
    hero_cta: { ar: "ابدأ مجاناً", en: "Start Free" },
    hero_plans: { ar: "عرض الخطط", en: "See Plans" },
    hero_stat_countries: { ar: "دولة عربية", en: "Arab Countries" },
    hero_stat_ai: { ar: "تحليل ذكي", en: "Powered Analysis" },
    hero_stat_dishes: { ar: "أكثر من مليون وجبة", en: "1M+ Arabic Dishes" },
    hero_desc: { ar: "صوّر طعامك، احصل على التحليل الغذائي الكامل، وتحدث مع مدربك الذكي — في ثوانٍ.", en: "Snap your food, get full nutrition analysis, and chat with your AI coach — in seconds." },

    feat_title: { ar: "مصمم للمطبخ العربي", en: "Built for Arabic Cuisine" },
    feat_subtitle: { ar: "كل ميزة تم بناؤها مع مراعاة المطبخ العربي والثقافة العربية.", en: "Every feature was built with Arabic food, culture, and users in mind." },

    feat_recognition_title: { ar: "التعرف الذكي على الطعام", en: "AI Food Recognition" },
    feat_recognition_desc: { ar: "صوّر أي وجبة — عربية أو عالمية — واحصل على تحليل غذائي فوري ودقيق.", en: "Snap any meal — Arabic or international — and get instant, detailed nutritional analysis." },

    feat_breakdown_title: { ar: "تحليل غذائي شامل", en: "Full Nutrition Breakdown" },
    feat_breakdown_desc: { ar: "السعرات، البروتين، الكربوهيدرات، الدهون، المعادن والفيتامينات — كل ذلك في مكان واحد.", en: "Calories, protein, carbs, fat, vitamins and minerals — all in one place." },

    feat_coach_title: { ar: "مدرب التغذية الذكي", en: "AI Nutrition Coach" },
    feat_coach_desc: { ar: "تحدث بالعربية أو الإنجليزية مع مدربك الشخصي الذي يعرف أهدافك وماذا أكلت اليوم.", en: "Chat in Arabic or English with your personal AI coach who knows your goals and daily intake." },

    feat_secure_title: { ar: "خصوصية وأمان", en: "Private & Secure" },
    feat_secure_desc: { ar: "بياناتك الصحية تبقى ملكك. نستخدم أعلى معايير التشفير والخصوصية.", en: "Your health data stays yours. We use top-tier encryption and privacy standards." },

    footer_desc: { ar: "مساعدك الذكي للتغذية في المطبخ العربي", en: "Your intelligent nutrition assistant for Arabic cuisine" },
    footer_product: { ar: "المنتج", en: "Product" },
    footer_features: { ar: "الميزات", en: "Features" },
    footer_pricing: { ar: "الأسعار", en: "Pricing" },
    footer_privacy: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
    footer_terms: { ar: "شروط الخدمة", en: "Terms of Service" },
    footer_regions: { ar: "المناطق", en: "Regions" },
    footer_rights: { ar: "جميع الحقوق محفوظة © {{year}} كالور إكس", en: "© {{year}} Calor X. All rights reserved." },

    // ─── Plan / Upgrade Gate ───────────────────────────────
    upgrade_title: { ar: "ميزة مدفوعة", en: "Paid Feature" },
    upgrade_subtitle: { ar: "قم بالترقية للوصول إلى هذه الميزة", en: "Upgrade your plan to access this feature" },
    upgrade_btn: { ar: "ترقية الآن", en: "Upgrade Now" },

    scan_limit_title: { ar: "وصلت إلى حد المسح اليومي", en: "Daily Scan Limit Reached" },
    scan_limit_free: { ar: "المستخدمون المجانيون يحصلون على مسح واحد يومياً.", en: "Free users get 1 scan per day." },
    scan_limit_standard: { ar: "المستخدمون القياسيون يحصلون على 10 مسحات يومياً.", en: "Standard users get 10 scans per day." },
    scan_limit_cta: { ar: "قم بترقية خطتك للحصول على المزيد", en: "Upgrade your plan for more scans" },

    coach_locked_title: { ar: "مدرب الذكاء الاصطناعي — Pro فقط", en: "AI Coach — Pro Only" },
    coach_locked_desc: { ar: "قم بترقية خطتك إلى قياسي أو احترافي للحصول على وصول غير محدود لمدرب الذكاء الاصطناعي.", en: "Upgrade to Standard or Pro to get unlimited access to your AI Nutrition Coach." },

    // ─── Meal Planning ─────────────────────────────────────
    meal_plan_title: { ar: "تخطيط الوجبات", en: "Meal Planning" },
    meal_plan_tab_today: { ar: "اليوم", en: "Today" },
    meal_plan_tab_week: { ar: "الأسبوع", en: "Week Plan" },
    meal_plan_tab_recipes: { ar: "وصفات", en: "Recipes" },
    meal_plan_ai_title: { ar: "اقتراحات اليوم", en: "Today's Suggestions" },
    meal_plan_ai_loading: { ar: "جاري توليد خطة وجباتك…", en: "Generating your meal plan…" },
    meal_plan_ai_btn: { ar: "اقتراح وجبات اليوم", en: "Suggest Today's Meals" },
    meal_plan_week_title: { ar: "خطة أسبوعية مقترحة", en: "Suggested Weekly Plan" },
    meal_plan_locked: { ar: "تخطيط الوجبات متاح لمستخدمي Pro فقط", en: "Meal planning is available for Pro users only" },
    meal_plan_recipe_cal: { ar: "سعرة حرارية", en: "kcal" },
    meal_plan_recipe_protein: { ar: "بروتين", en: "protein" },

    // ─── Micronutrients ────────────────────────────────────
    micro_title: { ar: "تتبع المغذيات الدقيقة", en: "Micronutrient Tracking" },
    micro_subtitle: { ar: "الفيتامينات والمعادن من وجباتك الأخيرة", en: "Vitamins & minerals from your recent meals" },
    micro_no_data: { ar: "لا توجد بيانات بعد — امسح وجباتك لرؤية المغذيات الدقيقة", en: "No data yet — scan your meals to see micronutrients" },
    micro_rdi: { ar: "من الجرعة اليومية الموصى بها", en: "of daily RDI" },
    micro_sources: { ar: "مصادر", en: "Sources" },
    micro_from_meal: { ar: "من الوجبة", en: "from meal" },
    micro_7day: { ar: "آخر 7 أيام", en: "Last 7 days" },
    micro_vitamins: { ar: "الفيتامينات", en: "Vitamins" },
    micro_minerals: { ar: "المعادن", en: "Minerals" },

    // ─── PDF Export ────────────────────────────────────────
    pdf_export_btn: { ar: "📥 تصدير تقرير PDF", en: "📥 Export PDF Report" },
    pdf_exporting: { ar: "جاري إنشاء التقرير…", en: "Generating report…" },
    pdf_export_success: { ar: "تم تحميل التقرير!", en: "Report downloaded!" },
    pdf_export_error: { ar: "فشل إنشاء التقرير", en: "Failed to generate report" },
    pdf_pro_only: { ar: "تصدير PDF متاح لمستخدمي Pro فقط", en: "PDF export is available for Pro users only" },

    // ─── Support ──────────────────────────────────────────
    support_title: { ar: "الدعم الفني", en: "Support" },
    support_free: { ar: "دعم مجتمعي — استجابة خلال 48 ساعة", en: "Community support — response within 48h" },
    support_priority: { ar: "⭐ دعم ذو أولوية — استجابة خلال 24 ساعة", en: "⭐ Priority support — response within 24h" },
    support_email_btn: { ar: "راسلنا بالبريد الإلكتروني", en: "Email Us" },
    support_whatsapp_btn: { ar: "تواصل عبر واتساب", en: "WhatsApp Us" },

    // ─── Nav ──────────────────────────────────────────────
    nav_meal_plan: { ar: "وجباتي", en: "Meals" },
    nav_micros: { ar: "مغذيات", en: "Micros" },
} as const;

export type StringKey = keyof typeof strings;

export function translate(key: StringKey, lang: Lang, vars?: Record<string, string | number>): string {
    const entry = strings[key];
    if (!entry) return key;
    let text: string = entry[lang] ?? (entry as any).en;
    if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
            text = text.replace(`{{${k}}}`, String(v));
        });
    }
    return text;
}

export default strings;
