import 'package:flutter/foundation.dart';

enum Lang { ar, en }

class I18nService {
  static Lang _currentLang = Lang.ar;

  static Lang get currentLang => _currentLang;

  static void setLang(Lang lang) {
    _currentLang = lang;
  }

  static const Map<String, Map<Lang, String>> _strings = {
    // Common
    'app_name': {Lang.ar: "كالور إكس", Lang.en: "Calor X"},
    'loading': {Lang.ar: "جاري التحميل…", Lang.en: "Loading…"},
    'save': {Lang.ar: "حفظ", Lang.en: "Save"},
    'cancel': {Lang.ar: "إلغاء", Lang.en: "Cancel"},
    'back': {Lang.ar: "رجوع", Lang.en: "Back"},
    'close': {Lang.ar: "إغلاق", Lang.en: "Close"},
    'setup': {Lang.ar: "إعداد", Lang.en: "Setup"},
    'return_home': {Lang.ar: "العودة للرئيسية", Lang.en: "Return Home"},
    'pro_plan': {Lang.ar: "خطة برو", Lang.en: "Pro Plan"},
    'err_not_logged_in': {Lang.ar: "الرجاء تسجيل الدخول أولاً", Lang.en: "User not logged in"},
    'err_analysis_failed': {Lang.ar: "فشل التحليل", Lang.en: "Analysis failed"},

    // Bottom Nav
    'nav_home': {Lang.ar: "الرئيسية", Lang.en: "Home"},
    'nav_scan': {Lang.ar: "مسح", Lang.en: "Scan"},
    'nav_coach': {Lang.ar: "مدرب AI", Lang.en: "AI Coach"},
    'nav_profile': {Lang.ar: "الملف", Lang.en: "Profile"},
    'nav_meal_plan': {Lang.ar: "وجباتي", Lang.en: "Meals"},
    'nav_micros': {Lang.ar: "مغذيات", Lang.en: "Micros"},

    // Dashboard
    'dash_welcome': {Lang.ar: "مرحباً بك", Lang.en: "Welcome"},
    'dash_greeting': {Lang.ar: "مرحباً، {{name}}", Lang.en: "Hi, {{name}}"},
    'dash_today_summary': {Lang.ar: "ملخص اليوم", Lang.en: "Today's Summary"},
    'dash_of_target': {Lang.ar: "من {{n}} كيلوسعرة", Lang.en: "of {{n}} kcal"},
    'dash_remaining': {Lang.ar: "متبقي {{n}} كيلوسعرة", Lang.en: "{{n}} remaining"},
    'dash_meals_logged': {Lang.ar: "{{n}} وجبة مسجلة اليوم", Lang.en: "{{n}} meal(s) logged today"},
    'dash_recent_meals': {Lang.ar: "آخر الوجبات", Lang.en: "Recent Meals"},
    'dash_no_meals': {Lang.ar: "لا توجد وجبات اليوم", Lang.en: "No meals logged today."},
    'dash_scan_first': {Lang.ar: "اضغط الكاميرا لمسح أول وجبة!", Lang.en: "Tap the camera to scan your first meal!"},
    'dash_progress': {Lang.ar: "التقدم", Lang.en: "Progress"},
    'dash_view_trends': {Lang.ar: "عرض الإحصائيات", Lang.en: "View trends"},
    'dash_ai_coach': {Lang.ar: "مدرب الذكاء الاصطناعي", Lang.en: "AI Coach"},
    'dash_personal_tips': {Lang.ar: "نصائح مخصصة لك", Lang.en: "Personalized tips"},
    'dash_kcal': {Lang.ar: "كيلوسعرة", Lang.en: "kcal"},
    'dash_protein': {Lang.ar: "بروتين", Lang.en: "Protein"},
    'dash_carbs': {Lang.ar: "كربوهيدرات", Lang.en: "Carbs"},
    'dash_fat': {Lang.ar: "دهون", Lang.en: "Fat"},
    'dash_protein_short': {Lang.ar: "ب", Lang.en: "P"},
    'goal_lose_weight': {Lang.ar: "🔥 وضع إنقاص الوزن", Lang.en: "🔥 Fat Loss Mode"},
    'goal_gain_muscle': {Lang.ar: "💪 وضع بناء العضلات", Lang.en: "💪 Muscle Gain Mode"},
    'goal_maintain': {Lang.ar: "⚖️ وضع المحافظة", Lang.en: "⚖️ Maintenance Mode"},
    'lose_weight': {Lang.ar: "خسارة الوزن", Lang.en: "Weight Loss"},
    'gain_muscle': {Lang.ar: "بناء العضلات", Lang.en: "Muscle Gain"},
    'maintenance': {Lang.ar: "المحافظة على الوزن", Lang.en: "Maintenance"},
    'dash_daily_streak_badge': {Lang.ar: "🔥 أيام متتالية {{n}}", Lang.en: "Daily Streak 🔥 {{n}}"},
    'dash_ready_crush': {Lang.ar: "مستعد لتحقيق أهدافك اليوم؟ هيا لنسجل طعامك! 🚀", Lang.en: "Ready to crush your goals today? Let's track some delicious food! 🚀"},
    'dash_quick_actions': {Lang.ar: "إجراءات سريعة", Lang.en: "Quick Actions"},
    'dash_smart_advice': {Lang.ar: "نصائح ذكية", Lang.en: "Smart advice"},
    'dash_daily_recipes': {Lang.ar: "وصفات يومية", Lang.en: "Daily recipes"},
    'dash_vitamins': {Lang.ar: "فيتامينات", Lang.en: "Vitamins"},
    'dash_generate_scan': {Lang.ar: "مسح جديد", Lang.en: "Generate Scan"},
    'dash_protein_g': {Lang.ar: "جم بروتين", Lang.en: "g protein"},

    // Scan
    'scan_title': {Lang.ar: "مسح الطعام", Lang.en: "Scan Food"},
    'scan_tap_to_pick': {Lang.ar: "اضغط لاختيار صورة", Lang.en: "Tap to pick a photo"},
    'scan_tap_subtitle': {Lang.ar: "صوّر طعامك لتحليله", Lang.en: "Photo your food to analyse it"},
    'scan_analysing': {Lang.ar: "جاري تحليل الطعام…", Lang.en: "Analysing food…"},
    'scan_please_wait': {Lang.ar: "قد يستغرق ذلك لحظة", Lang.en: "This may take a moment"},
    'scan_camera': {Lang.ar: "كاميرا", Lang.en: "Camera"},
    'scan_upload': {Lang.ar: "رفع صورة", Lang.en: "Upload"},
    'scan_another': {Lang.ar: "مسح صورة أخرى", Lang.en: "Scan Another"},
    'scan_tips_title': {Lang.ar: "نصائح لأفضل نتيجة", Lang.en: "Tips for best results"},
    'scan_tip1': {Lang.ar: "إضاءة جيدة", Lang.en: "Good lighting"},
    'scan_tip2': {Lang.ar: "الطعام في مركز الصورة", Lang.en: "Food centered in frame"},
    'scan_tip3': {Lang.ar: "زاوية من الأعلى أفضل", Lang.en: "Top-down angle works best"},
    'scan_tip4': {Lang.ar: "تجنب الظلال الكثيفة", Lang.en: "Avoid heavy shadows"},
    'scan_uploaded': {Lang.ar: "تم رفع الصورة — جاري التحليل…", Lang.en: "Image uploaded — analysing…"},
    'scan_err_type': {Lang.ar: "الرجاء اختيار صورة JPEG أو PNG أو WebP", Lang.en: "Please select a JPEG, PNG or WebP image"},
    'scan_err_size': {Lang.ar: "يجب أن يكون حجم الصورة أقل من 5 ميجابايت", Lang.en: "Image must be under 5 MB"},
    'scan_err_login': {Lang.ar: "الرجاء تسجيل الدخول أولاً", Lang.en: "Please log in first"},
    'scan_err_camera': {Lang.ar: "تعذر الوصول للكاميرا", Lang.en: "Camera access denied"},
    'scan_enter_manually': {Lang.ar: "إدخال يدوي", Lang.en: "Enter Manually"},
    'scan_search_food': {Lang.ar: "ابحث عن طعام (مثل: شاورما)", Lang.en: "Search food (e.g., Shawarma)"},
    'scan_change': {Lang.ar: "تغيير", Lang.en: "Change"},
    'scan_typical_portion': {Lang.ar: "جم حصة معتادة", Lang.en: "g typical portion"},
    'scan_no_foods': {Lang.ar: "لم يتم العثور على أطعمة. جرب بحثاً مختلفاً.", Lang.en: "No foods found. Try a different search."},
    'scan_search_placeholder': {Lang.ar: "ابحث عن أطباق عربية...", Lang.en: "Search for Middle Eastern foods..."},
    'scan_enter_weight': {Lang.ar: "أدخل الوزن", Lang.en: "Enter Weight"},
    'scan_grams': {Lang.ar: "جرام", Lang.en: "grams"},
    'scan_calc_nutrition': {Lang.ar: "حساب العناصر الغذائية", Lang.en: "Calculate Nutrition"},
    'scan_upload_image': {Lang.ar: "رفع صورة طعام", Lang.en: "Upload Food Image"},
    'scan_capture': {Lang.ar: "التقاط", Lang.en: "Capture"},
    'scan_change_image': {Lang.ar: "تغيير الصورة", Lang.en: "Change Image"},
    'scan_err_analysis_failed_title': {Lang.ar: "فشل تحليل الصورة", Lang.en: "Analysis Failed"},
    'scan_try_again': {Lang.ar: "المحاولة مرة أخرى", Lang.en: "Try Again"},
    'scan_back_home': {Lang.ar: "العودة للرئيسية", Lang.en: "Back to Home"},
    'scan_ar_fallback': {Lang.ar: "المستشعرات ثلاثية الأبعاد غير مدعومة. سيتم الاعتماد على الذكاء الاصطناعي.", Lang.en: "AR Depth Sensing is not supported on this device. Fallback to AI estimation."},

    // Results
    'res_title': {Lang.ar: "نتائج التحليل", Lang.en: "Analysis Results"},
    'res_confidence': {Lang.ar: "متأكد بنسبة {{n}}%", Lang.en: "Confident {{n}}%"},
    'res_cached': {Lang.ar: "مخزن مؤقتاً", Lang.en: "Cached"},
    'res_edited': {Lang.ar: "تم التعديل", Lang.en: "Edited"},
    'res_summary': {Lang.ar: "ملخص الغذاء", Lang.en: "Nutrition Summary"},
    'res_calories': {Lang.ar: "سعرات", Lang.en: "Calories"},
    'res_protein_g': {Lang.ar: "بروتين", Lang.en: "Protein"},
    'res_carbs_g': {Lang.ar: "كربوهيدرات", Lang.en: "Carbs"},
    'res_fat_g': {Lang.ar: "دهون", Lang.en: "Fat"},
    'res_fiber_g': {Lang.ar: "ألياف", Lang.en: "Fiber"},
    'res_sugar_g': {Lang.ar: "سكر", Lang.en: "Sugar"},
    'res_sodium_mg': {Lang.ar: "صوديوم", Lang.en: "Sodium"},
    'res_progress': {Lang.ar: "التقدم اليومي", Lang.en: "Daily Progress"},
    'res_gym_intel': {Lang.ar: "تحليل الرياضيين", Lang.en: "Gym Intelligence"},
    'res_meal_timing': {Lang.ar: "توقيت الوجبة", Lang.en: "Meal Timing"},
    'res_gi': {Lang.ar: "مؤشر السكر (GI)", Lang.en: "Glycemic Index"},
    'res_protein_quality': {Lang.ar: "جودة البروتين", Lang.en: "Protein Quality"},
    'res_health_insights': {Lang.ar: "نصائح صحية", Lang.en: "Health Insights"},
    'res_ingredients': {Lang.ar: "المكونات المكتشفة (قابلة للتعديل)", Lang.en: "Detected Ingredients (Editable)"},
    'res_edit_hint': {Lang.ar: "اضغط على القلم لتعديل الوزن", Lang.en: "Tap pencil to edit weight"},
    'res_vitamins': {Lang.ar: "الفيتامينات والمعادن", Lang.en: "Vitamins & Minerals"},
    'res_add_today': {Lang.ar: "أضف إلى اليوم", Lang.en: "Add to Today"},
    'res_saving': {Lang.ar: "جاري الحفظ…", Lang.en: "Saving…"},
    'res_save_success': {Lang.ar: "تم حفظ الوجبة!", Lang.en: "Meal saved!"},
    'res_save_error': {Lang.ar: "فشل حفظ الوجبة", Lang.en: "Failed to save meal"},
    'res_ingredient_added': {Lang.ar: "تم إضافة المكون!", Lang.en: "Ingredient added!"},
    'res_high_accuracy_db_match': {Lang.ar: "تطابق عالي الدقة", Lang.en: "High accuracy Database Match"},
    'res_adjust_portions': {Lang.ar: "تعديل الكميات", Lang.en: "Adjust Portions"},
    'res_missing_something': {Lang.ar: "هل ينقص شيء؟", Lang.en: "Missing Something?"},
    'res_missing_something_desc': {
      Lang.ar: "هل فات الذكاء الاصطناعي مكونات مخفية تماماً مثل زيت الزيتون، المرق، أو اللحوم في الطبقة السفلية؟ أضفها يدوياً لتسجيل دقيق!",
      Lang.en: "Did the AI miss completely hidden ingredients like olive oil, broth, or bottom-layer meats? Add them manually to perfect your log!",
    },
    'res_add_hidden_ingredient': {Lang.ar: "إضافة مكون مخفي", Lang.en: "Add Hidden Ingredient"},
    'res_add_ingredient_title': {Lang.ar: "إضافة مكون", Lang.en: "Add Ingredient"},
    'res_search_ingredient': {Lang.ar: "ابحث (مثل: زيت زيتون، دجاج، أرز)", Lang.en: "Search (e.g., Olive Oil, Chicken, Rice)"},
    'res_g_typical': {Lang.ar: "جم معتاد", Lang.en: "g typical"},
    'res_no_items': {Lang.ar: "لم يتم العثور على أطعمة.", Lang.en: "No items found."},
    'res_search_to_add': {Lang.ar: "ابحث عن مكونات لإضافتها...", Lang.en: "Search for ingredients to add..."},
    'res_enter_hidden_weight': {Lang.ar: "أدخل الوزن المخفي", Lang.en: "Enter Hidden Weight"},
    'res_add_to_result': {Lang.ar: "إضافة للنتيجة!", Lang.en: "Add to Result!"},
    'res_save_to_log': {Lang.ar: "حفظ بالسجل ({{kcal}} سعرة)", Lang.en: "Save to Log ({{kcal}} kcal)"},
    'res_scan_another': {Lang.ar: "مسح جديد", Lang.en: "Scan Another"},
    'res_done': {Lang.ar: "تم", Lang.en: "Done"},
    'res_fix_results': {Lang.ar: "تصحيح النتائج", Lang.en: "Fix Results"},
    'vit_a': {Lang.ar: "فيتامين A", Lang.en: "Vitamin A"},
    'vit_c': {Lang.ar: "فيتامين C", Lang.en: "Vitamin C"},
    'vit_d': {Lang.ar: "فيتامين D", Lang.en: "Vitamin D"},
    'vit_b12': {Lang.ar: "فيتامين B12", Lang.en: "Vitamin B12"},
    'calcium': {Lang.ar: "الكالسيوم", Lang.en: "Calcium"},
    'iron': {Lang.ar: "الحديد", Lang.en: "Iron"},
    'magnesium': {Lang.ar: "المغنيسيوم", Lang.en: "Magnesium"},
    'potassium': {Lang.ar: "البوتاسيوم", Lang.en: "Potassium"},
    'zinc': {Lang.ar: "الزنك", Lang.en: "Zinc"},
    'sodium': {Lang.ar: "الصوديوم", Lang.en: "Sodium"},
    'fiber': {Lang.ar: "الألياف", Lang.en: "Fiber"},
    'sugar': {Lang.ar: "السكر", Lang.en: "Sugar"},

    // Progress
    'prog_title': {Lang.ar: "تقدمك", Lang.en: "Your Progress"},
    'prog_day_streak': {Lang.ar: "🔥 أيام متتالية", Lang.en: "🔥 Day Streak"},
    'prog_total_meals': {Lang.ar: "🍽️ إجمالي الوجبات", Lang.en: "🍽️ Total Meals"},
    'prog_7day_cal': {Lang.ar: "السعرات — آخر 7 أيام", Lang.en: "Calories — Last 7 Days"},
    'prog_no_meals_week': {
      Lang.ar: "لا توجد وجبات هذا الأسبوع. ابدأ بمسح طعامك!",
      Lang.en: "No meals logged this week. Start scanning food!",
    },
    'prog_today_vs_goals': {Lang.ar: "اليوم مقارنة بالأهداف", Lang.en: "Today vs Goals"},
    'prog_setup_goals': {Lang.ar: "أكمل إعداد ملفك الشخصي لرؤية أهدافك", Lang.en: "Complete your profile setup to see goals"},
    'prog_calories': {Lang.ar: "السعرات الحرارية", Lang.en: "Calories"},
    'prog_protein': {Lang.ar: "البروتين", Lang.en: "Protein"},
    'prog_carbs': {Lang.ar: "الكربوهيدرات", Lang.en: "Carbs"},
    'prog_fat': {Lang.ar: "الدهون", Lang.en: "Fat"},
    'prog_below_goal': {Lang.ar: "دون الهدف", Lang.en: "Below Goal"},
    'prog_goal_reached': {Lang.ar: "الهدف محقق ✓", Lang.en: "Goal Reached ✓"},
    'day_sun': {Lang.ar: "أح", Lang.en: "Sun"},
    'day_mon': {Lang.ar: "إث", Lang.en: "Mon"},
    'day_tue': {Lang.ar: "ثل", Lang.en: "Tue"},
    'day_wed': {Lang.ar: "أر", Lang.en: "Wed"},
    'day_thu': {Lang.ar: "خم", Lang.en: "Thu"},
    'day_fri': {Lang.ar: "جم", Lang.en: "Fri"},
    'day_sat': {Lang.ar: "سب", Lang.en: "Sat"},

    // AI Coach
    'coach_title': {Lang.ar: "مدرب الذكاء الاصطناعي", Lang.en: "AI Coach"},
    'coach_subtitle': {Lang.ar: "متخصص في التغذية والرياضة", Lang.en: "Nutrition & Fitness Specialist"},
    'coach_greeting': {
      Lang.ar:
          "مرحباً! أنا مدرب كالور إكس الذكي 💪\n\nأعرف ملفك الشخصي وأهدافك اليومية وكل ما أكلته اليوم — لذلك يمكنني تقديم نصائح حقيقية ومخصصة لك.\n\nاسألني عن التغذية، وجبات الجيم، أو أهدافك!",
      Lang.en:
          "Hello! I'm your Calor X AI Coach 💪\n\nI know your profile, daily goals, and everything you've eaten today — so I can give you real, personalized advice.\n\nAsk me anything about nutrition, gym meals, or your targets!",
    },
    'coach_quick_title': {Lang.ar: "أسئلة سريعة", Lang.en: "QUICK QUESTIONS"},
    'coach_placeholder': {Lang.ar: "اكتب سؤالك هنا…", Lang.en: "Ask about meals, macros, gym nutrition…"},
    'coach_send_hint': {Lang.ar: "اضغط Enter للإرسال · Shift+Enter لسطر جديد", Lang.en: "Press Enter to send · Shift+Enter for new line"},
    'coach_analyzing': {Lang.ar: "جاري تحليل بياناتك…", Lang.en: "Analyzing your data…"},
    'coach_error': {
      Lang.ar: "تعذر الاتصال بمدرب الذكاء الاصطناعي. تحقق من اتصالك.",
      Lang.en: "Failed to reach AI Coach. Check your connection.",
    },
    'coach_error_msg': {
      Lang.ar: "⚠️ تعذر الاتصال بالخادم الآن. حاول مرة أخرى.",
      Lang.en: "⚠️ Couldn't connect to the server right now. Please try again.",
    },

    // Profile
    'prof_title': {Lang.ar: "الملف الشخصي", Lang.en: "Profile"},
    'prof_user': {Lang.ar: "مستخدم", Lang.en: "User"},
    'prof_biometrics': {Lang.ar: "القياسات الجسدية", Lang.en: "Biometrics"},
    'prof_weight': {Lang.ar: "الوزن", Lang.en: "Weight"},
    'prof_height': {Lang.ar: "الطول", Lang.en: "Height"},
    'prof_age': {Lang.ar: "العمر", Lang.en: "Age"},
    'prof_bmi': {Lang.ar: "مؤشر كتلة الجسم", Lang.en: "BMI"},
    'prof_bmi_under': {Lang.ar: "نقص الوزن", Lang.en: "Underweight"},
    'prof_bmi_healthy': {Lang.ar: "وزن طبيعي", Lang.en: "Healthy"},
    'prof_bmi_over': {Lang.ar: "زيادة وزن", Lang.en: "Overweight"},
    'prof_bmi_obese': {Lang.ar: "سمنة", Lang.en: "Obese"},
    'prof_activity': {Lang.ar: "مستوى النشاط", Lang.en: "Activity Level"},
    'prof_act_sedentary': {Lang.ar: "خامل", Lang.en: "Sedentary"},
    'prof_act_light': {Lang.ar: "نشاط خفيف", Lang.en: "Lightly Active"},
    'prof_act_moderate': {Lang.ar: "نشاط معتدل", Lang.en: "Moderately Active"},
    'prof_act_active': {Lang.ar: "نشيط جداً", Lang.en: "Very Active"},
    'prof_act_very_active': {Lang.ar: "رياضي محترف", Lang.en: "Athlete"},
    'prof_daily_targets': {Lang.ar: "الأهداف اليومية", Lang.en: "Daily Targets"},
    'prof_this_week': {Lang.ar: "هذا الأسبوع", Lang.en: "This Week"},
    'prof_meals_logged': {Lang.ar: "وجبات مسجلة", Lang.en: "Meals logged"},
    'prof_kcal_tracked': {Lang.ar: "كيلوسعرة مسجلة", Lang.en: "kcal tracked"},
    'prof_edit': {Lang.ar: "تعديل الملف", Lang.en: "Edit Profile"},
    'prof_privacy': {Lang.ar: "سياسة الخصوصية", Lang.en: "Privacy Policy"},
    'prof_terms': {Lang.ar: "شروط الخدمة", Lang.en: "Terms of Service"},
    'prof_logout': {Lang.ar: "تسجيل الخروج", Lang.en: "Sign Out"},
    'prof_logout_ok': {Lang.ar: "تم تسجيل الخروج", Lang.en: "Logged out"},
    'prof_goal_fat_loss': {Lang.ar: "خسارة دهون", Lang.en: "Fat Loss"},
    'prof_goal_muscle': {Lang.ar: "بناء عضلات", Lang.en: "Muscle Gain"},
    'prof_goal_maintain': {Lang.ar: "الحفاظ على الوزن", Lang.en: "Maintenance"},
    'prof_daily_streak_badge': {Lang.ar: "🔥 أيام متتالية {{n}}", Lang.en: "Daily Streak 🔥 {{n}}"},
    'prof_kcal': {Lang.ar: "كيلوسعرة", Lang.en: "kcal"},

    // Setup
    'setup_title': {Lang.ar: "أنشئ ملفك الشخصي", Lang.en: "Create Your Profile"},
    'setup_name': {Lang.ar: "الاسم", Lang.en: "Name"},
    'setup_age': {Lang.ar: "العمر", Lang.en: "Age"},
    'setup_weight': {Lang.ar: "الوزن (كجم)", Lang.en: "Weight (kg)"},
    'setup_height': {Lang.ar: "الطول (سم)", Lang.en: "Height (cm)"},
    'setup_goal': {Lang.ar: "هدفك", Lang.en: "Your Goal"},
    'setup_start': {Lang.ar: "ابدأ رحلتك", Lang.en: "Start Journey"},
    'setup_saving': {Lang.ar: "جاري حفظ الملف…", Lang.en: "Saving profile…"},

    // Quick coach prompts
    'qp1': {Lang.ar: "ماذا أتناول بعد التمرين اليوم؟", Lang.en: "What should I eat post-workout today?"},
    'qp2': {Lang.ar: "هل أحقق هدف البروتين؟", Lang.en: "Am I hitting my protein goal?"},
    'qp3': {Lang.ar: "اقترح وجبة عربية غنية بالبروتين", Lang.en: "Suggest a high-protein Arab meal"},
    'qp4': {Lang.ar: "كم تبقى من سعراتي الحرارية؟", Lang.en: "How many calories do I have left?"},
    'qp5': {Lang.ar: "أفضل وجبة قبل التمرين من المطبخ العربي؟", Lang.en: "Best pre-workout meal from Arab cuisine?"},

    // Pricing / Plans
    'price_title': {Lang.ar: "اختر خطتك", Lang.en: "Choose Your Plan"},
    'price_subtitle': {
      Lang.ar: "اشترك أو ألغِ في أي وقت — بدون قيود أو رسوم خفية.",
      Lang.en: "Upgrade or cancel anytime — no lock-in, no hidden fees.",
    },
    'price_footer': {Lang.ar: "إلغاء في أي وقت · بدون عقود", Lang.en: "Cancel anytime · No contracts"},
    'plan_free': {Lang.ar: "مجاني", Lang.en: "Free"},
    'plan_standard': {Lang.ar: "قياسي", Lang.en: "Standard"},
    'plan_pro': {Lang.ar: "احترافي", Lang.en: "Pro"},
    'desc_free': {Lang.ar: "جرّب التطبيق بدون بطاقة", Lang.en: "Try it out, no card needed"},
    'desc_standard': {
      Lang.ar: "مثالي للمتابعة اليومية المنتظمة",
      Lang.en: "Everything you need for daily tracking",
    },
    'desc_pro': {
      Lang.ar: "للرياضيين وأصحاب الأهداف الجادة",
      Lang.en: "For serious athletes & health goals",
    },
    'feat_community_support': {Lang.ar: "دعم مجتمعي", Lang.en: "Community support"},
    'feat_scan_1': {Lang.ar: "وجبة واحدة يومياً", Lang.en: "1 food scan per day"},
    'feat_scan_10': {Lang.ar: "10 وجبات يومياً", Lang.en: "10 food scans per day"},
    'feat_scan_unlimited': {Lang.ar: "مسح غير محدود", Lang.en: "Unlimited food scans"},
    'feat_basic_info': {Lang.ar: "معلومات السعرات الأساسية", Lang.en: "Basic calorie info only"},
    'feat_full_macro': {Lang.ar: "تحليل العناصر الغذائية بالكامل", Lang.en: "Full macro & calorie breakdown"},
    'feat_trends': {Lang.ar: "إحصائيات التقدم", Lang.en: "Health trends & progress charts"},
    'feat_no_ads': {Lang.ar: "بدون إعلانات", Lang.en: "No ads"},
    'feat_ai_coach': {
      Lang.ar: "مدرب الذكاء الاصطناعي (غير محدود)",
      Lang.en: "AI Nutrition Coach (unlimited)",
    },
    'feat_meal_planning': {
      Lang.ar: "تخطيط الوجبات وافكار وصفات",
      Lang.en: "Meal planning & recipe ideas",
    },
    'feat_pdf_reports': {Lang.ar: "تقارير PDF وتصدير البيانات", Lang.en: "PDF reports & data export"},
    'feat_micro': {
      Lang.ar: "تتبع المغذيات الدقيقة (فيتامينات)",
      Lang.en: "Micronutrient tracking (vitamins, minerals)",
    },
    'feat_priority': {Lang.ar: "دعم فني ذو أولوية", Lang.en: "Priority support"},
    'cta_start_free': {Lang.ar: "ابدأ مجاناً", Lang.en: "Start Free"},
    'cta_get_standard': {Lang.ar: "احصل على قياسي", Lang.en: "Get Standard"},
    'cta_get_pro': {Lang.ar: "احصل على احترافي", Lang.en: "Get Pro"},
    'popular_badge': {Lang.ar: "⭐ الأكثر شيوعاً", Lang.en: "⭐ Most Popular"},
    'forever': {Lang.ar: "للأبد", Lang.en: "forever"},
    'per_month': {Lang.ar: "/شهرياً", Lang.en: "/month"},
    'per_year': {Lang.ar: "/سنوياً", Lang.en: "/year"},
    'toggle_monthly': {Lang.ar: "شهرياً", Lang.en: "Monthly"},
    'toggle_yearly': {Lang.ar: "سنوياً", Lang.en: "Yearly"},
    'save_15': {Lang.ar: "توفير 15٪", Lang.en: "Save 15%"},

    // Landing Page / Hero / Features / Footer
    'hero_tag': {Lang.ar: "رفيقك الذكي لحياة صحية", Lang.en: "Your Smart Health Companion"},
    'hero_cta': {Lang.ar: "ابدأ مجاناً", Lang.en: "Start Free"},
    'hero_plans': {Lang.ar: "عرض الخطط", Lang.en: "See Plans"},
    'hero_stat_countries': {Lang.ar: "مسجلين", Lang.en: "Active Users"},
    'hero_stat_ai': {Lang.ar: "تحليل ذكي", Lang.en: "Powered Analysis"},
    'hero_stat_dishes': {Lang.ar: "وجبة محللة", Lang.en: "Meals Analyzed"},
    'hero_desc': {
      Lang.ar: "صوّر طعامك، احصل على التحليل الغذائي الكامل، وتحدث مع مدربك الذكي — في ثوانٍ.",
      Lang.en: "Snap your food, get full nutrition analysis, and chat with your AI coach — in seconds.",
    },
    'feat_title': {Lang.ar: "مصمم للمطبخ العربي", Lang.en: "Built for Arabic Cuisine"},
    'feat_subtitle': {
      Lang.ar: "كل ميزة تم بناؤها مع مراعاة المطبخ العربي والثقافة العربية.",
      Lang.en: "Every feature was built with Arabic food, culture, and users in mind.",
    },
    'feat_recognition_title': {Lang.ar: "التعرف الذكي على الطعام", Lang.en: "AI Food Recognition"},
    'feat_recognition_desc': {
      Lang.ar: "صوّر أي وجبة — عربية أو عالمية — واحصل على تحليل غذائي فوري ودقيق.",
      Lang.en: "Snap any meal — Arabic or international — and get instant, detailed nutritional analysis.",
    },
    'feat_breakdown_title': {Lang.ar: "تحليل غذائي شامل", Lang.en: "Full Nutrition Breakdown"},
    'feat_breakdown_desc': {
      Lang.ar: "السعرات، البروتين، الكربوهيدرات، الدهون، المعادن والفيتامينات — كل ذلك في مكان واحد.",
      Lang.en: "Calories, protein, carbs, fat, vitamins and minerals — all in one place.",
    },
    'feat_coach_title': {Lang.ar: "مدرب التغذية الذكي", Lang.en: "AI Nutrition Coach"},
    'feat_coach_desc': {
      Lang.ar: "تحدث بالعربية أو الإنجليزية مع مدربك الشخصي الذي يعرف أهدافك وماذا أكلت اليوم.",
      Lang.en: "Chat in Arabic or English with your personal AI coach who knows your goals and daily intake.",
    },
    'feat_secure_title': {Lang.ar: "خصوصية وأمان", Lang.en: "Private & Secure"},
    'feat_secure_desc': {
      Lang.ar: "بياناتك الصحية تبقى ملكك. نستخدم أعلى معايير التشفير والخصوصية.",
      Lang.en: "Your health data stays yours. We use top-tier encryption and privacy standards.",
    },
    'footer_desc': {
      Lang.ar: "مساعدك الذكي للتغذية في المطبخ العربي",
      Lang.en: "Your intelligent nutrition assistant for Arabic cuisine",
    },
    'footer_product': {Lang.ar: "المنتج", Lang.en: "Product"},
    'footer_features': {Lang.ar: "الميزات", Lang.en: "Features"},
    'footer_pricing': {Lang.ar: "الأسعار", Lang.en: "Pricing"},
    'footer_privacy': {Lang.ar: "سياسة الخصوصية", Lang.en: "Privacy Policy"},
    'footer_terms': {Lang.ar: "شروط الخدمة", Lang.en: "Terms of Service"},
    'footer_rights': {
      Lang.ar: "جميع الحقوق محفوظة © {{year}} كالور إكس",
      Lang.en: "© {{year}} Calor X. All rights reserved.",
    },

    // Plan / Upgrade Gate
    'upgrade_title': {Lang.ar: "ميزة مدفوعة", Lang.en: "Paid Feature"},
    'upgrade_subtitle': {Lang.ar: "قم بالترقية للوصول إلى هذه الميزة", Lang.en: "Upgrade your plan to access this feature"},
    'upgrade_btn': {Lang.ar: "ترقية الآن", Lang.en: "Upgrade Now"},
    'scan_limit_title': {Lang.ar: "وصلت إلى حد المسح اليومي", Lang.en: "Daily Scan Limit Reached"},
    'scan_limit_free': {Lang.ar: "المستخدمون المجانيون يحصلون على مسح واحد يومياً.", Lang.en: "Free users get 1 scan per day."},
    'scan_limit_standard': {
      Lang.ar: "المستخدمون القياسيون يحصلون على 10 مسحات يومياً.",
      Lang.en: "Standard users get 10 scans per day.",
    },
    'scan_limit_cta': {Lang.ar: "قم بترقية خطتك للحصول على المزيد", Lang.en: "Upgrade your plan for more scans"},
    'coach_locked_title': {Lang.ar: "مدرب الذكاء الاصطناعي — Pro فقط", Lang.en: "AI Coach — Pro Only"},
    'coach_locked_desc': {
      Lang.ar: "قم بترقية خطتك إلى قياسي أو احترافي للحصول على وصول غير محدود لمدرب الذكاء الاصطناعي.",
      Lang.en: "Upgrade to Standard or Pro to get unlimited access to your AI Nutrition Coach.",
    },
    'micro_locked_title': {Lang.ar: "تتبع المغذيات — Pro فقط", Lang.en: "Micronutrients — Pro Only"},
    'micro_locked_desc': {
      Lang.ar: "قم بترقية خطتك إلى قياسي أو احترافي للحصول على وصول لتتبع المغذيات الدقيقة.",
      Lang.en: "Upgrade to Standard or Pro to get access to micronutrient tracking.",
    },

    // Meal Planning
    'meal_plan_title': {Lang.ar: "تخطيط الوجبات", Lang.en: "Meal Planning"},
    'meal_plan_tab_today': {Lang.ar: "اليوم", Lang.en: "Today"},
    'meal_plan_tab_week': {Lang.ar: "الأسبوع", Lang.en: "Week Plan"},
    'meal_plan_tab_recipes': {Lang.ar: "وصفات", Lang.en: "Recipes"},
    'meal_plan_ai_title': {Lang.ar: "اقتراحات اليوم", Lang.en: "Today's Suggestions"},
    'meal_plan_ai_loading': {Lang.ar: "جاري توليد خطة وجباتك…", Lang.en: "Generating your meal plan…"},
    'meal_plan_ai_btn': {Lang.ar: "اقتراح وجبات اليوم", Lang.en: "Suggest Today's Meals"},
    'meal_plan_week_title': {Lang.ar: "خطة أسبوعية مقترحة", Lang.en: "Suggested Weekly Plan"},
    'meal_plan_locked': {Lang.ar: "تخطيط الوجبات متاح لمستخدمي Pro فقط", Lang.en: "Meal planning is available for Pro users only"},
    'meal_plan_recipe_cal': {Lang.ar: "سعرة حرارية", Lang.en: "kcal"},
    'meal_plan_recipe_protein': {Lang.ar: "بروتين", Lang.en: "protein"},

    // Auth
    'auth_check_email': {Lang.ar: "تحقق من بريدك الإلكتروني", Lang.en: "Check your email"},
    'auth_email_verification_required': {Lang.ar: "مطلوب التحقق من البريد الإلكتروني", Lang.en: "Email Verification Required"},
    'auth_verification_sent': {
      Lang.ar: "أرسلنا رابط التحقق إلى بريدك الإلكتروني. يرجى التحقق لمواصلة استخدام التطبيق.",
      Lang.en: "We've sent a verification link to your email address. Please verify your email to continue.",
    },
    'auth_must_verify': {
      Lang.ar: "يجب التحقق من بريدك الإلكتروني قبل تسجيل الدخول.",
      Lang.en: "You must verify your email address before you can log in to Calor X. Please check your inbox for the verification link.",
    },
    'auth_return_login': {Lang.ar: "العودة لتسجيل الدخول", Lang.en: "Return to Login"},
    'auth_sign_in': {Lang.ar: "تسجيل الدخول", Lang.en: "Sign In"},
    'auth_sign_up': {Lang.ar: "إنشاء حساب", Lang.en: "Sign Up"},
    'auth_sign_in_desc': {Lang.ar: "سجل دخولك لحسابك", Lang.en: "Sign in to your account"},
    'auth_sign_up_desc': {Lang.ar: "أنشئ حسابك الجديد", Lang.en: "Create your account"},
    'auth_continue_google': {Lang.ar: "المتابعة باستخدام Google", Lang.en: "Continue with Google"},
    'auth_or': {Lang.ar: "أو", Lang.en: "or"},
    'auth_email': {Lang.ar: "البريد الإلكتروني", Lang.en: "Email"},
    'auth_password': {Lang.ar: "كلمة المرور", Lang.en: "Password"},
    'auth_sign_in_btn': {Lang.ar: "تسجيل الدخول", Lang.en: "Sign In"},
    'auth_sign_up_btn': {Lang.ar: "إنشاء حساب", Lang.en: "Sign Up"},
    'auth_agree_terms': {Lang.ar: "بتسجيلك، فإنك توافق على", Lang.en: "By signing up you agree to our"},
    'auth_and': {Lang.ar: "و", Lang.en: "and"},
    'auth_no_account': {Lang.ar: "ليس لديك حساب؟ إنشاء حساب ←", Lang.en: "Don't have an account? Sign up →"},
    'auth_has_account': {Lang.ar: "لديك حساب بالفعل؟ تسجيل الدخول ←", Lang.en: "Already have an account? Sign in →"},
    'auth_back_home': {Lang.ar: "← العودة للرئيسية", Lang.en: "← Back to Home"},

    // Micronutrients
    'micro_title': {Lang.ar: "تتبع المغذيات الدقيقة", Lang.en: "Micronutrient Tracking"},
    'micro_subtitle': {Lang.ar: "الفيتامينات والمعادن من وجباتك الأخيرة", Lang.en: "Vitamins & minerals from your recent meals"},
    'micro_no_data': {
      Lang.ar: "لا توجد بيانات بعد — امسح وجباتك لرؤية المغذيات الدقيقة",
      Lang.en: "No data yet — scan your meals to see micronutrients",
    },
    'micro_rdi': {Lang.ar: "من الجرعة اليومية الموصى بها", Lang.en: "of daily RDI"},
    'micro_sources': {Lang.ar: "مصادر", Lang.en: "Sources"},
    'micro_from_meal': {Lang.ar: "من الوجبة", Lang.en: "from meal"},
    'micro_7day': {Lang.ar: "آخر 7 أيام", Lang.en: "Last 7 days"},
    'micro_vitamins': {Lang.ar: "الفيتامينات", Lang.en: "Vitamins"},
    'micro_minerals': {Lang.ar: "المعادن", Lang.en: "Minerals"},

    // PDF Export
    'pdf_export_btn': {Lang.ar: "📥 تصدير تقرير PDF", Lang.en: "📥 Export PDF Report"},
    'pdf_exporting': {Lang.ar: "جاري إنشاء التقرير…", Lang.en: "Generating report…"},
    'pdf_export_success': {Lang.ar: "تم تحميل التقرير!", Lang.en: "Report downloaded!"},
    'pdf_export_error': {Lang.ar: "فشل إنشاء التقرير", Lang.en: "Failed to generate report"},
    'pdf_pro_only': {Lang.ar: "تصدير PDF متاح لمستخدمي Pro فقط", Lang.en: "PDF export is available for Pro users only"},

    // Support
    'support_title': {Lang.ar: "الدعم الفني", Lang.en: "Support"},
    'support_free': {
      Lang.ar: "دعم مجتمعي — استجابة خلال 48 ساعة",
      Lang.en: "Community support — response within 48h",
    },
    'support_priority': {
      Lang.ar: "⭐ دعم ذو أولوية — استجابة خلال 24 ساعة",
      Lang.en: "⭐ Priority support — response within 24h",
    },
    'support_email_btn': {Lang.ar: "راسلنا بالبريد الإلكتروني", Lang.en: "Email Us"},
    'support_whatsapp_btn': {Lang.ar: "تواصل عبر واتساب", Lang.en: "WhatsApp Us"},
  };

  static String translate(String key, {Map<String, dynamic>? vars}) {
    final entry = _strings[key];
    if (entry == null) return key;
    String text = entry[_currentLang] ?? entry[Lang.en] ?? key;
    if (vars != null) {
      vars.forEach((k, v) {
        text = text.replaceAll('{{$k}}', v.toString());
      });
    }
    return text;
  }
}

extension TranslateExtension on String {
  String tr({Map<String, dynamic>? vars}) => I18nService.translate(this, vars: vars);
}
