export interface FoodIngredient {
    name_ar: string;
    name_en: string;
    typical_g: number;
    per100g: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

export interface FoodItem {
    id: string;
    name_ar: string;
    name_en: string;
    category: string;
    per100g: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
        sugar: number;
        sodium: number;
    };
    typical_serving_g: number;
    ingredients: FoodIngredient[];
}

export const foodDatabase: FoodItem[] = [
    // Street food
    {
        id: 'shawarma_chicken',
        name_ar: 'شاورما دجاج',
        name_en: 'Chicken Shawarma',
        category: 'Street Food',
        per100g: { calories: 245, protein: 14, carbs: 22, fat: 11, fiber: 1.5, sugar: 2, sodium: 450 },
        typical_serving_g: 250,
        ingredients: [
            { name_ar: 'خبز بيتا', name_en: 'Pita Bread', typical_g: 80, per100g: { calories: 275, protein: 9, carbs: 55, fat: 1.2 } },
            { name_ar: 'دجاج شاورما', name_en: 'Shawarma Chicken', typical_g: 100, per100g: { calories: 195, protein: 29, carbs: 0, fat: 8 } },
            { name_ar: 'ثومية', name_en: 'Garlic Sauce', typical_g: 30, per100g: { calories: 450, protein: 1, carbs: 4, fat: 48 } },
            { name_ar: 'مخلل', name_en: 'Pickles', typical_g: 20, per100g: { calories: 11, protein: 0.5, carbs: 2, fat: 0 } },
            { name_ar: 'بطاطا مقلية', name_en: 'French Fries', typical_g: 20, per100g: { calories: 312, protein: 3.4, carbs: 41, fat: 15 } }
        ]
    },
    {
        id: 'falafel_sandwich',
        name_ar: 'ساندويتش فلافل',
        name_en: 'Falafel Sandwich',
        category: 'Street Food',
        per100g: { calories: 280, protein: 8, carbs: 35, fat: 12, fiber: 5, sugar: 3, sodium: 500 },
        typical_serving_g: 220,
        ingredients: [
            { name_ar: 'خبز بيتا', name_en: 'Pita Bread', typical_g: 80, per100g: { calories: 275, protein: 9, carbs: 55, fat: 1.2 } },
            { name_ar: 'فلافل', name_en: 'Falafel', typical_g: 80, per100g: { calories: 333, protein: 13, carbs: 31, fat: 17 } },
            { name_ar: 'طحينة', name_en: 'Tahini Sauce', typical_g: 30, per100g: { calories: 250, protein: 5, carbs: 6, fat: 24 } },
            { name_ar: 'سلطة', name_en: 'Salad', typical_g: 30, per100g: { calories: 20, protein: 1, carbs: 4, fat: 0.2 } }
        ]
    },
    {
        id: 'manakeesh_zaatar',
        name_ar: 'مناقيش زعتر',
        name_en: 'Zaatar Manakeesh',
        category: 'Street Food',
        per100g: { calories: 330, protein: 8, carbs: 42, fat: 15, fiber: 3, sugar: 1, sodium: 400 },
        typical_serving_g: 150,
        ingredients: [
            { name_ar: 'عجينة مناقيش', name_en: 'Dough', typical_g: 120, per100g: { calories: 290, protein: 8, carbs: 50, fat: 5 } },
            { name_ar: 'زيت زيتون', name_en: 'Olive Oil', typical_g: 20, per100g: { calories: 884, protein: 0, carbs: 0, fat: 100 } },
            { name_ar: 'زعتر', name_en: 'Zaatar Blend', typical_g: 10, per100g: { calories: 250, protein: 9, carbs: 30, fat: 10 } }
        ]
    },
    {
        id: 'kaak',
        name_ar: 'كعك',
        name_en: 'Kaak',
        category: 'Street Food',
        per100g: { calories: 280, protein: 9, carbs: 55, fat: 3, fiber: 2, sugar: 4, sodium: 350 },
        typical_serving_g: 100,
        ingredients: [
            { name_ar: 'عجينة الكعك', name_en: 'Kaak Dough', typical_g: 90, per100g: { calories: 270, protein: 8, carbs: 53, fat: 2 } },
            { name_ar: 'سمسم', name_en: 'Sesame Seeds', typical_g: 10, per100g: { calories: 573, protein: 17, carbs: 23, fat: 49 } }
        ]
    },
    {
        id: 'msemen',
        name_ar: 'مسمن',
        name_en: 'Msemen',
        category: 'Street Food',
        per100g: { calories: 340, protein: 6, carbs: 45, fat: 15, fiber: 2, sugar: 1, sodium: 380 },
        typical_serving_g: 100,
        ingredients: [
            { name_ar: 'دقيق', name_en: 'Flour', typical_g: 60, per100g: { calories: 364, protein: 10, carbs: 76, fat: 1 } },
            { name_ar: 'سميد', name_en: 'Semolina', typical_g: 20, per100g: { calories: 360, protein: 12, carbs: 72, fat: 1 } },
            { name_ar: 'زيت و زبدة', name_en: 'Oil & Butter', typical_g: 20, per100g: { calories: 800, protein: 0, carbs: 0, fat: 85 } }
        ]
    },
    {
        id: 'harira',
        name_ar: 'حريرة',
        name_en: 'Harira Soup',
        category: 'Street Food',
        per100g: { calories: 85, protein: 4, carbs: 12, fat: 2.5, fiber: 2.5, sugar: 1.5, sodium: 320 },
        typical_serving_g: 300,
        ingredients: [
            { name_ar: 'حمص', name_en: 'Chickpeas', typical_g: 50, per100g: { calories: 164, protein: 8, carbs: 27, fat: 2.5 } },
            { name_ar: 'عدس', name_en: 'Lentils', typical_g: 30, per100g: { calories: 116, protein: 9, carbs: 20, fat: 0.3 } },
            { name_ar: 'طماطم', name_en: 'Tomatoes', typical_g: 100, per100g: { calories: 18, protein: 0.8, carbs: 3.9, fat: 0.2 } },
            { name_ar: 'لحم', name_en: 'Meat', typical_g: 30, per100g: { calories: 250, protein: 26, carbs: 0, fat: 15 } },
            { name_ar: 'شعرية', name_en: 'Vermicelli', typical_g: 20, per100g: { calories: 350, protein: 12, carbs: 70, fat: 1.5 } }
        ]
    },
    {
        id: 'bissara',
        name_ar: 'بصارة',
        name_en: 'Bissara',
        category: 'Street Food',
        per100g: { calories: 110, protein: 6, carbs: 15, fat: 3, fiber: 4, sugar: 1, sodium: 300 },
        typical_serving_g: 250,
        ingredients: [
            { name_ar: 'فول مجروش', name_en: 'Fava Beans', typical_g: 80, per100g: { calories: 341, protein: 26, carbs: 58, fat: 1.5 } },
            { name_ar: 'زيت زيتون', name_en: 'Olive Oil', typical_g: 10, per100g: { calories: 884, protein: 0, carbs: 0, fat: 100 } },
            { name_ar: 'ثوم وتوابل', name_en: 'Garlic & Spices', typical_g: 5, per100g: { calories: 149, protein: 6, carbs: 33, fat: 0.5 } }
        ]
    },

    // Main dishes
    {
        id: 'couscous_meat',
        name_ar: 'كسكس باللحم والخضار',
        name_en: 'Couscous with Meat & Vegetables',
        category: 'Main Dish',
        per100g: { calories: 130, protein: 5.5, carbs: 18, fat: 4, fiber: 2.5, sugar: 2, sodium: 280 },
        typical_serving_g: 400,
        ingredients: [
            { name_ar: 'كسكس مطبوخ', name_en: 'Cooked Couscous', typical_g: 150, per100g: { calories: 112, protein: 3.8, carbs: 23, fat: 0.2 } },
            { name_ar: 'لحم غنم', name_en: 'Lamb', typical_g: 80, per100g: { calories: 294, protein: 25, carbs: 0, fat: 21 } },
            { name_ar: 'خضار مشكلة', name_en: 'Mixed Vegetables', typical_g: 120, per100g: { calories: 35, protein: 1.5, carbs: 7, fat: 0.2 } },
            { name_ar: 'مرق', name_en: 'Broth', typical_g: 50, per100g: { calories: 15, protein: 1, carbs: 1, fat: 1 } }
        ]
    },
    {
        id: 'tagine_chicken',
        name_ar: 'طاجين دجاج',
        name_en: 'Chicken Tagine',
        category: 'Main Dish',
        per100g: { calories: 160, protein: 10, carbs: 6, fat: 10, fiber: 1.5, sugar: 2, sodium: 350 },
        typical_serving_g: 350,
        ingredients: [
            { name_ar: 'دجاج', name_en: 'Chicken', typical_g: 150, per100g: { calories: 195, protein: 29, carbs: 0, fat: 8 } },
            { name_ar: 'زيتون', name_en: 'Olives', typical_g: 30, per100g: { calories: 115, protein: 0.8, carbs: 6, fat: 10 } },
            { name_ar: 'بطاطس', name_en: 'Potatoes', typical_g: 100, per100g: { calories: 77, protein: 2, carbs: 17, fat: 0.1 } },
            { name_ar: 'بصل وزيت', name_en: 'Onions & Oil', typical_g: 70, per100g: { calories: 120, protein: 1, carbs: 8, fat: 10 } }
        ]
    },
    {
        id: 'kabsa_chicken',
        name_ar: 'كبسة دجاج',
        name_en: 'Chicken Kabsa',
        category: 'Main Dish',
        per100g: { calories: 180, protein: 8, carbs: 22, fat: 7, fiber: 1.5, sugar: 1.5, sodium: 380 },
        typical_serving_g: 400,
        ingredients: [
            { name_ar: 'أرز كبسة', name_en: 'Kabsa Rice', typical_g: 220, per100g: { calories: 150, protein: 3, carbs: 28, fat: 3 } },
            { name_ar: 'دجاج مشوي', name_en: 'Roasted Chicken', typical_g: 150, per100g: { calories: 195, protein: 29, carbs: 0, fat: 8 } },
            { name_ar: 'مكسرات محمصة', name_en: 'Roasted Nuts', typical_g: 15, per100g: { calories: 600, protein: 15, carbs: 20, fat: 55 } },
            { name_ar: 'صلصة الكبسة', name_en: 'Kabsa Sauce', typical_g: 15, per100g: { calories: 80, protein: 1, carbs: 5, fat: 6 } }
        ]
    },
    {
        id: 'mandi_meat',
        name_ar: 'مندي لحم',
        name_en: 'Meat Mandi',
        category: 'Main Dish',
        per100g: { calories: 230, protein: 10, carbs: 20, fat: 12, fiber: 1, sugar: 1, sodium: 400 },
        typical_serving_g: 450,
        ingredients: [
            { name_ar: 'أرز مندي', name_en: 'Mandi Rice', typical_g: 250, per100g: { calories: 160, protein: 3, carbs: 28, fat: 4 } },
            { name_ar: 'لحم غنم', name_en: 'Lamb', typical_g: 180, per100g: { calories: 294, protein: 25, carbs: 0, fat: 21 } },
            { name_ar: 'مكسرات', name_en: 'Nuts', typical_g: 20, per100g: { calories: 600, protein: 15, carbs: 20, fat: 55 } }
        ]
    },
    {
        id: 'machboos_chicken',
        name_ar: 'مجبوس دجاج',
        name_en: 'Chicken Machboos',
        category: 'Main Dish',
        per100g: { calories: 175, protein: 8, carbs: 21, fat: 6.5, fiber: 1.5, sugar: 1.5, sodium: 390 },
        typical_serving_g: 400,
        ingredients: [
            { name_ar: 'أرز مجبوس', name_en: 'Machboos Rice', typical_g: 220, per100g: { calories: 145, protein: 3, carbs: 27, fat: 3 } },
            { name_ar: 'دجاج مجبوس', name_en: 'Machboos Chicken', typical_g: 150, per100g: { calories: 195, protein: 29, carbs: 0, fat: 8 } },
            { name_ar: 'حشو', name_en: 'Hashu (Stuffing)', typical_g: 30, per100g: { calories: 200, protein: 5, carbs: 25, fat: 8 } }
        ]
    },
    {
        id: 'mansaf',
        name_ar: 'منسف',
        name_en: 'Mansaf',
        category: 'Main Dish',
        per100g: { calories: 210, protein: 12, carbs: 18, fat: 10, fiber: 0.5, sugar: 1, sodium: 450 },
        typical_serving_g: 450,
        ingredients: [
            { name_ar: 'أرز منسف', name_en: 'Mansaf Rice', typical_g: 200, per100g: { calories: 150, protein: 3, carbs: 28, fat: 4 } },
            { name_ar: 'لحم غنم', name_en: 'Lamb', typical_g: 150, per100g: { calories: 294, protein: 25, carbs: 0, fat: 21 } },
            { name_ar: 'جميد', name_en: 'Jameed Sauce', typical_g: 80, per100g: { calories: 120, protein: 10, carbs: 4, fat: 8 } },
            { name_ar: 'خبز شراك', name_en: 'Shrak Bread', typical_g: 20, per100g: { calories: 260, protein: 8, carbs: 50, fat: 2 } }
        ]
    },
    {
        id: 'maqluba',
        name_ar: 'مقلوبة',
        name_en: 'Maqluba',
        category: 'Main Dish',
        per100g: { calories: 165, protein: 6, carbs: 20, fat: 7, fiber: 2, sugar: 2, sodium: 350 },
        typical_serving_g: 400,
        ingredients: [
            { name_ar: 'أرز مطبوخ', name_en: 'Cooked Rice', typical_g: 200, per100g: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 } },
            { name_ar: 'باذنجان وقرنبيط مقلي', name_en: 'Fried Eggplant & Cauliflower', typical_g: 100, per100g: { calories: 150, protein: 2, carbs: 10, fat: 12 } },
            { name_ar: 'دجاج مسلوق', name_en: 'Boiled Chicken', typical_g: 100, per100g: { calories: 165, protein: 31, carbs: 0, fat: 4 } }
        ]
    },
    {
        id: 'fatteh_hummus',
        name_ar: 'فتة حمص',
        name_en: 'Hummus Fatteh',
        category: 'Main Dish',
        per100g: { calories: 190, protein: 6, carbs: 18, fat: 10, fiber: 4, sugar: 2, sodium: 400 },
        typical_serving_g: 350,
        ingredients: [
            { name_ar: 'حمص مسلوق', name_en: 'Boiled Chickpeas', typical_g: 150, per100g: { calories: 164, protein: 8.9, carbs: 27, fat: 2.6 } },
            { name_ar: 'خبز مقلي', name_en: 'Fried Bread', typical_g: 50, per100g: { calories: 450, protein: 8, carbs: 60, fat: 20 } },
            { name_ar: 'لبن وطحينة', name_en: 'Yogurt & Tahini Sauce', typical_g: 120, per100g: { calories: 120, protein: 5, carbs: 6, fat: 8 } },
            { name_ar: 'صنوبر وزبدة', name_en: 'Pine Nuts & Butter', typical_g: 30, per100g: { calories: 650, protein: 12, carbs: 10, fat: 65 } }
        ]
    },

    // Grills
    {
        id: 'kofta',
        name_ar: 'كفتة مشوية',
        name_en: 'Grilled Kofta',
        category: 'Grills',
        per100g: { calories: 250, protein: 18, carbs: 3, fat: 18, fiber: 0.5, sugar: 0.5, sodium: 550 },
        typical_serving_g: 200,
        ingredients: [
            { name_ar: 'لحم مفروم', name_en: 'Minced Meat', typical_g: 180, per100g: { calories: 280, protein: 18, carbs: 0, fat: 22 } },
            { name_ar: 'بصل وبقدونس', name_en: 'Onion & Parsley', typical_g: 20, per100g: { calories: 40, protein: 1.5, carbs: 9, fat: 0.2 } }
        ]
    },
    {
        id: 'shish_tawook',
        name_ar: 'شيش طاووق',
        name_en: 'Shish Tawook',
        category: 'Grills',
        per100g: { calories: 180, protein: 22, carbs: 2, fat: 9, fiber: 0.2, sugar: 0.5, sodium: 450 },
        typical_serving_g: 200,
        ingredients: [
            { name_ar: 'صدر دجاج', name_en: 'Chicken Breast', typical_g: 180, per100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6 } },
            { name_ar: 'تتبيلة', name_en: 'Marinade', typical_g: 20, per100g: { calories: 250, protein: 2, carbs: 5, fat: 25 } }
        ]
    },
    {
        id: 'grilled_lamb',
        name_ar: 'ريش غنم مشوية',
        name_en: 'Grilled Lamb Chops',
        category: 'Grills',
        per100g: { calories: 320, protein: 22, carbs: 0.5, fat: 25, fiber: 0, sugar: 0, sodium: 300 },
        typical_serving_g: 250,
        ingredients: [
            { name_ar: 'ريش غنم', name_en: 'Lamb Chops', typical_g: 250, per100g: { calories: 320, protein: 22, carbs: 0.5, fat: 25 } }
        ]
    },
    {
        id: 'mixed_grill',
        name_ar: 'مشاوي مشكلة',
        name_en: 'Mixed Grill',
        category: 'Grills',
        per100g: { calories: 240, protein: 20, carbs: 2, fat: 16, fiber: 0.3, sugar: 0.5, sodium: 450 },
        typical_serving_g: 300,
        ingredients: [
            { name_ar: 'شيش طاووق', name_en: 'Shish Tawook', typical_g: 100, per100g: { calories: 180, protein: 22, carbs: 2, fat: 9 } },
            { name_ar: 'كفتة', name_en: 'Kofta', typical_g: 100, per100g: { calories: 250, protein: 18, carbs: 3, fat: 18 } },
            { name_ar: 'شقف لحم', name_en: 'Meat Cubes', typical_g: 100, per100g: { calories: 280, protein: 20, carbs: 0, fat: 22 } }
        ]
    },

    // Salads
    {
        id: 'fattoush',
        name_ar: 'فتوش',
        name_en: 'Fattoush',
        category: 'Salads',
        per100g: { calories: 95, protein: 1.5, carbs: 8, fat: 6, fiber: 1.5, sugar: 2, sodium: 300 },
        typical_serving_g: 250,
        ingredients: [
            { name_ar: 'خضار مشكلة', name_en: 'Mixed Greens', typical_g: 180, per100g: { calories: 20, protein: 1, carbs: 4, fat: 0.2 } },
            { name_ar: 'خبز مقلي', name_en: 'Fried Bread', typical_g: 30, per100g: { calories: 450, protein: 8, carbs: 60, fat: 20 } },
            { name_ar: 'زيت زيتون ودبس رمان', name_en: 'Olive Oil & Pomegranate Molasses', typical_g: 40, per100g: { calories: 300, protein: 0, carbs: 20, fat: 25 } }
        ]
    },
    {
        id: 'tabbouleh',
        name_ar: 'تبولة',
        name_en: 'Tabbouleh',
        category: 'Salads',
        per100g: { calories: 120, protein: 2, carbs: 9, fat: 8, fiber: 2.5, sugar: 1.5, sodium: 250 },
        typical_serving_g: 150,
        ingredients: [
            { name_ar: 'بقدونس مقطع', name_en: 'Chopped Parsley', typical_g: 80, per100g: { calories: 36, protein: 3, carbs: 6, fat: 0.8 } },
            { name_ar: 'برغل', name_en: 'Bulgur', typical_g: 30, per100g: { calories: 342, protein: 12, carbs: 76, fat: 1.3 } },
            { name_ar: 'طماطم وبصل', name_en: 'Tomatoes & Onions', typical_g: 25, per100g: { calories: 22, protein: 1, carbs: 5, fat: 0.2 } },
            { name_ar: 'زيت زيتون وعصير ليمون', name_en: 'Olive Oil & Lemon', typical_g: 15, per100g: { calories: 500, protein: 0, carbs: 5, fat: 55 } }
        ]
    },
    {
        id: 'hummus',
        name_ar: 'حمص متبل',
        name_en: 'Hummus',
        category: 'Salads',
        per100g: { calories: 166, protein: 8, carbs: 14, fat: 10, fiber: 6, sugar: 0.5, sodium: 380 },
        typical_serving_g: 100,
        ingredients: [
            { name_ar: 'حمص مسلوق', name_en: 'Boiled Chickpeas', typical_g: 70, per100g: { calories: 164, protein: 8.9, carbs: 27, fat: 2.6 } },
            { name_ar: 'طحينة', name_en: 'Tahini', typical_g: 15, per100g: { calories: 595, protein: 17, carbs: 21, fat: 54 } },
            { name_ar: 'زيت زيتون', name_en: 'Olive Oil', typical_g: 10, per100g: { calories: 884, protein: 0, carbs: 0, fat: 100 } },
            { name_ar: 'عصير ليمون وثوم', name_en: 'Lemon & Garlic', typical_g: 5, per100g: { calories: 25, protein: 1, carbs: 8, fat: 0 } }
        ]
    },
    {
        id: 'mutabal',
        name_ar: 'متبل باذنجان',
        name_en: 'Mutabal',
        category: 'Salads',
        per100g: { calories: 140, protein: 3, carbs: 9, fat: 11, fiber: 4, sugar: 3, sodium: 350 },
        typical_serving_g: 100,
        ingredients: [
            { name_ar: 'باذنجان مشوي', name_en: 'Roasted Eggplant', typical_g: 75, per100g: { calories: 35, protein: 1, carbs: 8, fat: 0.2 } },
            { name_ar: 'طحينة', name_en: 'Tahini', typical_g: 15, per100g: { calories: 595, protein: 17, carbs: 21, fat: 54 } },
            { name_ar: 'زبادي', name_en: 'Yogurt', typical_g: 5, per100g: { calories: 60, protein: 3.5, carbs: 4.7, fat: 3.3 } },
            { name_ar: 'زيت زيتون', name_en: 'Olive Oil', typical_g: 5, per100g: { calories: 884, protein: 0, carbs: 0, fat: 100 } }
        ]
    },
    {
        id: 'baba_ghanoush',
        name_ar: 'بابا غنوج',
        name_en: 'Baba Ghanoush',
        category: 'Salads',
        per100g: { calories: 100, protein: 1.5, carbs: 10, fat: 6, fiber: 3.5, sugar: 3.5, sodium: 250 },
        typical_serving_g: 100,
        ingredients: [
            { name_ar: 'باذنجان مشوي', name_en: 'Roasted Eggplant', typical_g: 70, per100g: { calories: 35, protein: 1, carbs: 8, fat: 0.2 } },
            { name_ar: 'خضار مقطعة', name_en: 'Diced Vegetables', typical_g: 20, per100g: { calories: 25, protein: 1, carbs: 5, fat: 0.2 } },
            { name_ar: 'دبس رمان وزيت', name_en: 'Pomegranate Molasses & Oil', typical_g: 10, per100g: { calories: 400, protein: 0, carbs: 30, fat: 30 } }
        ]
    },

    // Breads
    {
        id: 'khubz',
        name_ar: 'خبز عربي',
        name_en: 'Arabic Khubz',
        category: 'Breads',
        per100g: { calories: 275, protein: 9, carbs: 55, fat: 1.2, fiber: 2, sugar: 1.5, sodium: 450 },
        typical_serving_g: 80,
        ingredients: [
            { name_ar: 'دقيق قمح', name_en: 'Wheat Flour', typical_g: 100, per100g: { calories: 275, protein: 9, carbs: 55, fat: 1.2 } }
        ]
    },
    {
        id: 'pita',
        name_ar: 'خبز بيتا',
        name_en: 'Pita Bread',
        category: 'Breads',
        per100g: { calories: 275, protein: 9, carbs: 55, fat: 1.2, fiber: 2, sugar: 1.5, sodium: 450 },
        typical_serving_g: 60,
        ingredients: [
            { name_ar: 'دقيق قمح', name_en: 'Wheat Flour', typical_g: 100, per100g: { calories: 275, protein: 9, carbs: 55, fat: 1.2 } }
        ]
    },
    {
        id: 'rghaif',
        name_ar: 'رغيف',
        name_en: 'Rghaif',
        category: 'Breads',
        per100g: { calories: 340, protein: 6, carbs: 45, fat: 15, fiber: 2, sugar: 1, sodium: 380 },
        typical_serving_g: 120,
        ingredients: [
            { name_ar: 'دقيق وسميد', name_en: 'Flour & Semolina', typical_g: 80, per100g: { calories: 360, protein: 11, carbs: 74, fat: 1 } },
            { name_ar: 'زبدة وزيت', name_en: 'Butter & Oil', typical_g: 20, per100g: { calories: 800, protein: 0, carbs: 0, fat: 85 } }
        ]
    },
    {
        id: 'batbout',
        name_ar: 'بطبوط',
        name_en: 'Batbout',
        category: 'Breads',
        per100g: { calories: 250, protein: 8, carbs: 50, fat: 1, fiber: 3, sugar: 1, sodium: 300 },
        typical_serving_g: 50,
        ingredients: [
            { name_ar: 'دقيق', name_en: 'Flour', typical_g: 100, per100g: { calories: 250, protein: 8, carbs: 50, fat: 1 } }
        ]
    },
    {
        id: 'khobz_eddar',
        name_ar: 'خبز الدار',
        name_en: 'Khobz Eddar',
        category: 'Breads',
        per100g: { calories: 280, protein: 9, carbs: 52, fat: 3.5, fiber: 2.5, sugar: 2, sodium: 350 },
        typical_serving_g: 100,
        ingredients: [
            { name_ar: 'دقيق وسميد', name_en: 'Flour & Semolina', typical_g: 90, per100g: { calories: 360, protein: 11, carbs: 74, fat: 1 } },
            { name_ar: 'زيت وزبدة', name_en: 'Oil & Butter', typical_g: 10, per100g: { calories: 800, protein: 0, carbs: 0, fat: 85 } }
        ]
    },

    // Desserts
    {
        id: 'baklava',
        name_ar: 'بقلاوة',
        name_en: 'Baklava',
        category: 'Desserts',
        per100g: { calories: 430, protein: 6, carbs: 48, fat: 25, fiber: 3, sugar: 30, sodium: 50 },
        typical_serving_g: 50,
        ingredients: [
            { name_ar: 'عجينة فيلو', name_en: 'Phyllo Dough', typical_g: 30, per100g: { calories: 300, protein: 8, carbs: 60, fat: 3 } },
            { name_ar: 'مكسرات', name_en: 'Nuts', typical_g: 35, per100g: { calories: 600, protein: 15, carbs: 20, fat: 55 } },
            { name_ar: 'قطر وزبدة', name_en: 'Syrup & Butter', typical_g: 35, per100g: { calories: 450, protein: 0, carbs: 70, fat: 15 } }
        ]
    },
    {
        id: 'kunafa',
        name_ar: 'كنافة',
        name_en: 'Kunafa',
        category: 'Desserts',
        per100g: { calories: 350, protein: 7, carbs: 45, fat: 16, fiber: 1, sugar: 25, sodium: 150 },
        typical_serving_g: 150,
        ingredients: [
            { name_ar: 'عجينة كنافة', name_en: 'Kunafa Dough', typical_g: 50, per100g: { calories: 320, protein: 5, carbs: 60, fat: 5 } },
            { name_ar: 'جبن أو قشطة', name_en: 'Cheese or Cream', typical_g: 50, per100g: { calories: 300, protein: 10, carbs: 5, fat: 25 } },
            { name_ar: 'قطر', name_en: 'Syrup', typical_g: 50, per100g: { calories: 300, protein: 0, carbs: 75, fat: 0 } }
        ]
    },
    {
        id: 'basbousa',
        name_ar: 'بسبوسة',
        name_en: 'Basbousa',
        category: 'Desserts',
        per100g: { calories: 380, protein: 5, carbs: 62, fat: 13, fiber: 1.5, sugar: 40, sodium: 120 },
        typical_serving_g: 80,
        ingredients: [
            { name_ar: 'سميد', name_en: 'Semolina', typical_g: 40, per100g: { calories: 360, protein: 12, carbs: 72, fat: 1 } },
            { name_ar: 'سمن', name_en: 'Ghee', typical_g: 10, per100g: { calories: 900, protein: 0, carbs: 0, fat: 100 } },
            { name_ar: 'جوز هند وقطر', name_en: 'Coconut & Syrup', typical_g: 50, per100g: { calories: 350, protein: 2, carbs: 70, fat: 15 } }
        ]
    },
    {
        id: 'maamoul',
        name_ar: 'معمول',
        name_en: 'Maamoul',
        category: 'Desserts',
        per100g: { calories: 420, protein: 5, carbs: 55, fat: 20, fiber: 3, sugar: 25, sodium: 40 },
        typical_serving_g: 40,
        ingredients: [
            { name_ar: 'عجينة معمول', name_en: 'Maamoul Dough', typical_g: 60, per100g: { calories: 400, protein: 6, carbs: 50, fat: 20 } },
            { name_ar: 'حشوة تمر أو مكسرات', name_en: 'Date/Nut Filling', typical_g: 40, per100g: { calories: 350, protein: 3, carbs: 65, fat: 8 } }
        ]
    },
    {
        id: 'halwa',
        name_ar: 'حلاوة طحينية',
        name_en: 'Halwa',
        category: 'Desserts',
        per100g: { calories: 480, protein: 12, carbs: 50, fat: 28, fiber: 4, sugar: 40, sodium: 50 },
        typical_serving_g: 30,
        ingredients: [
            { name_ar: 'طحينة', name_en: 'Tahini', typical_g: 50, per100g: { calories: 595, protein: 17, carbs: 21, fat: 54 } },
            { name_ar: 'سكر', name_en: 'Sugar', typical_g: 50, per100g: { calories: 387, protein: 0, carbs: 100, fat: 0 } }
        ]
    },

    // Drinks
    {
        id: 'mint_tea',
        name_ar: 'شاي نعناع بلدي',
        name_en: 'Mint Tea',
        category: 'Drinks',
        per100g: { calories: 35, protein: 0, carbs: 9, fat: 0, fiber: 0, sugar: 9, sodium: 2 },
        typical_serving_g: 150,
        ingredients: [
            { name_ar: 'شاي أخضر ونعناع', name_en: 'Green Tea & Mint', typical_g: 5, per100g: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
            { name_ar: 'سكر', name_en: 'Sugar', typical_g: 10, per100g: { calories: 387, protein: 0, carbs: 100, fat: 0 } },
            { name_ar: 'ماء', name_en: 'Water', typical_g: 85, per100g: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
        ]
    },
    {
        id: 'ayran',
        name_ar: 'عيران (شنينة)',
        name_en: 'Ayran',
        category: 'Drinks',
        per100g: { calories: 35, protein: 2, carbs: 3, fat: 1.5, fiber: 0, sugar: 3, sodium: 150 },
        typical_serving_g: 250,
        ingredients: [
            { name_ar: 'لبن (زبادي)', name_en: 'Yogurt', typical_g: 50, per100g: { calories: 60, protein: 3.5, carbs: 4.7, fat: 3.3 } },
            { name_ar: 'ماء وملح', name_en: 'Water & Salt', typical_g: 50, per100g: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
        ]
    },
    {
        id: 'jallab',
        name_ar: 'جلاب',
        name_en: 'Jallab',
        category: 'Drinks',
        per100g: { calories: 50, protein: 0, carbs: 13, fat: 0, fiber: 0, sugar: 12, sodium: 5 },
        typical_serving_g: 200,
        ingredients: [
            { name_ar: 'شراب جلاب', name_en: 'Jallab Syrup', typical_g: 20, per100g: { calories: 250, protein: 0, carbs: 65, fat: 0 } },
            { name_ar: 'مكسرات', name_en: 'Nuts', typical_g: 5, per100g: { calories: 600, protein: 15, carbs: 20, fat: 55 } },
            { name_ar: 'ماء', name_en: 'Water', typical_g: 75, per100g: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
        ]
    },
    {
        id: 'tamarind_juice',
        name_ar: 'عصير تمر هندي',
        name_en: 'Tamarind Juice',
        category: 'Drinks',
        per100g: { calories: 45, protein: 0, carbs: 11, fat: 0, fiber: 0, sugar: 11, sodium: 5 },
        typical_serving_g: 200,
        ingredients: [
            { name_ar: 'تمر هندي وسكر', name_en: 'Tamarind & Sugar', typical_g: 15, per100g: { calories: 300, protein: 0, carbs: 75, fat: 0 } },
            { name_ar: 'ماء', name_en: 'Water', typical_g: 85, per100g: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
        ]
    },

    // Fast Food Chains (Arab region adaptations)
    {
        id: 'al_baik_chicken',
        name_ar: 'بروستد البيك',
        name_en: 'Al Baik Broasted Chicken',
        category: 'Fast Food',
        per100g: { calories: 280, protein: 15, carbs: 14, fat: 18, fiber: 1, sugar: 0.5, sodium: 550 },
        typical_serving_g: 350,
        ingredients: [
            { name_ar: 'دجاج بروستد', name_en: 'Broasted Chicken', typical_g: 250, per100g: { calories: 280, protein: 15, carbs: 14, fat: 18 } },
            { name_ar: 'صلصة ثوم البيك', name_en: 'Al Baik Garlic Sauce', typical_g: 50, per100g: { calories: 450, protein: 1, carbs: 4, fat: 48 } },
            { name_ar: 'بطاطا البيك', name_en: 'Al Baik Fries', typical_g: 50, per100g: { calories: 312, protein: 3.4, carbs: 41, fat: 15 } }
        ]
    },
    {
        id: 'hardees_arab',
        name_ar: 'هارديز (حصة عربية)',
        name_en: 'Hardees Burger (Arab Portion)',
        category: 'Fast Food',
        per100g: { calories: 270, protein: 12, carbs: 25, fat: 14, fiber: 1.5, sugar: 4, sodium: 480 },
        typical_serving_g: 300,
        ingredients: [
            { name_ar: 'برجر ضخم', name_en: 'Large Burger', typical_g: 300, per100g: { calories: 270, protein: 12, carbs: 25, fat: 14 } }
        ]
    },
    {
        id: 'mcdonalds_arab',
        name_ar: 'ماكدونالدز (حجم ديوانية/عربي)',
        name_en: 'McDonalds (Arab Share)',
        category: 'Fast Food',
        per100g: { calories: 280, protein: 11, carbs: 28, fat: 13, fiber: 1.5, sugar: 5, sodium: 450 },
        typical_serving_g: 250,
        ingredients: [
            { name_ar: 'برجر وبطاطس', name_en: 'Burger & Fries', typical_g: 250, per100g: { calories: 280, protein: 11, carbs: 28, fat: 13 } }
        ]
    },
    {
        id: 'kfc_arab',
        name_ar: 'صينية كنتاكي (عائلية)',
        name_en: 'KFC (Family Meal Portion)',
        category: 'Fast Food',
        per100g: { calories: 290, protein: 14, carbs: 16, fat: 19, fiber: 1, sugar: 1, sodium: 600 },
        typical_serving_g: 300,
        ingredients: [
            { name_ar: 'دجاج مقلي', name_en: 'Fried Chicken', typical_g: 200, per100g: { calories: 300, protein: 15, carbs: 12, fat: 21 } },
            { name_ar: 'بطاطس وكول سلو', name_en: 'Fries & Coleslaw', typical_g: 100, per100g: { calories: 270, protein: 2, carbs: 25, fat: 15 } }
        ]
    },

    // Raw Ingredients / Basics
    {
        id: 'tomato_raw',
        name_ar: 'طماطم',
        name_en: 'Tomato',
        category: 'Raw Ingredients',
        per100g: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5 },
        typical_serving_g: 100,
        ingredients: [
            { name_ar: 'طماطم', name_en: 'Tomato', typical_g: 100, per100g: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 } }
        ]
    },
    {
        id: 'potato_raw',
        name_ar: 'بطاطس',
        name_en: 'Potato',
        category: 'Raw Ingredients',
        per100g: { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, sugar: 0.8, sodium: 6 },
        typical_serving_g: 150,
        ingredients: [
            { name_ar: 'بطاطس', name_en: 'Potato', typical_g: 150, per100g: { calories: 77, protein: 2, carbs: 17, fat: 0.1 } }
        ]
    },
    {
        id: 'onion_raw',
        name_ar: 'بصل',
        name_en: 'Onion',
        category: 'Raw Ingredients',
        per100g: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2, sodium: 4 },
        typical_serving_g: 50,
        ingredients: [
            { name_ar: 'بصل', name_en: 'Onion', typical_g: 50, per100g: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 } }
        ]
    },
    {
        id: 'rice_cooked',
        name_ar: 'أرز مطبوخ',
        name_en: 'Cooked White Rice',
        category: 'Raw Ingredients',
        per100g: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1 },
        typical_serving_g: 150,
        ingredients: [
            { name_ar: 'أرز أبيض', name_en: 'White Rice', typical_g: 150, per100g: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 } }
        ]
    },
    {
        id: 'egg_boiled',
        name_ar: 'بيض مسلوق',
        name_en: 'Boiled Egg',
        category: 'Raw Ingredients',
        per100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124 },
        typical_serving_g: 50,
        ingredients: [
            { name_ar: 'بيضة', name_en: 'Egg', typical_g: 50, per100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11 } }
        ]
    },
    {
        id: 'chicken_breast',
        name_ar: 'صدر دجاج (مطبوخ)',
        name_en: 'Cooked Chicken Breast',
        category: 'Raw Ingredients',
        per100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
        typical_serving_g: 150,
        ingredients: [
            { name_ar: 'صدر دجاج', name_en: 'Chicken Breast', typical_g: 150, per100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6 } }
        ]
    },
    {
        id: 'olive_oil',
        name_ar: 'زيت زيتون',
        name_en: 'Olive Oil',
        category: 'Raw Ingredients',
        per100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 2 },
        typical_serving_g: 15,
        ingredients: [
            { name_ar: 'زيت زيتون', name_en: 'Olive Oil', typical_g: 15, per100g: { calories: 884, protein: 0, carbs: 0, fat: 100 } }
        ]
    }
];

// Helper search function to match string
export const searchFoodDatabase = (query: string): FoodItem[] => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return foodDatabase.filter(food =>
        food.name_ar.includes(q) ||
        food.name_en.toLowerCase().includes(q) ||
        food.category.toLowerCase().includes(q)
    );
};
