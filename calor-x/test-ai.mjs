

async function testGemini() {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDTrSMYpI_-ojzkDlYO7mElX2bgubmgAMI"; // Note: this is the key from the deploy script
    const model = "gemini-2.5-flash"; // Try newest flash
    const systemPrompt = `You are an expert nutritionist specialized in Middle Eastern and Arab cuisine.

When analyzing a food image:
1. Identify the dish or food name in both Arabic and English. If it is a random mix of ingredients, name it descriptively.
2. Estimate the portion size in grams.
3. List ALL visible ingredients with estimated weights. CRITICAL: If the image is a complex dish (like Kabsa, Salad, Pizza), you must break it down into its individual raw or cooked components. However, if the image is obviously a single raw or simple food item (e.g., just "Peanuts", just "An Apple", just "A Banana"), then it is perfectly fine and correct to return just that single ingredient in the list. Do not force a breakdown if it's just a handful of peanuts.
4. Calculate precise nutrition per ingredient and total, including micronutrients.
5. Cross-reference with standard Arab cuisine recipes where applicable.
6. Provide a short, simple health tip about the meal (e.g. "Low in protein", "High in carbs, consider a smaller portion", or "Great source of healthy fats" for peanuts).

Return ONLY JSON: { image_hash, dish_name_ar, dish_name_en, confidence, total_weight_g, total_nutrition: {calories, protein, carbs, fat, fiber, sugar, sodium, vitamin_c_mg, calcium_mg, iron_mg}, ingredients: [{name_ar, name_en, weight_g, calories, protein, carbs, fat, vitamin_c_mg, calcium_mg, iron_mg}], meal_type, health_tip_en, health_tip_ar }`;

    const payload = {
        contents: [{ parts: [{ text: systemPrompt }, { text: "This is a photo of A handful of Peanuts" }] }],
        generationConfig: { temperature: 0.0 }
    };

    try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await resp.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

testGemini();
