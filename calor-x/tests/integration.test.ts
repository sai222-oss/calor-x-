/**
 * Integration test: simulates the full normalize-and-cache pipeline
 * from analyze-food without needing a real OpenAI key or Supabase connection.
 *
 * Strategy:
 *   1. Use parseAIResponse (shared util) to parse an AI-like response.
 *   2. Apply the same normalization logic that index.ts uses.
 *   3. Assert final shape matches expectations.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseAIResponse, calculateHammingDistance } from '../supabase/functions/analyze-food/utils';

// ---------------------------------------------------------------------------
// Helpers that mirror the normalization logic in index.ts
// ---------------------------------------------------------------------------
const ANALYSIS_VERSION = 'v1.1.0-arab-tuned';
const MODEL_VERSION = 'gpt-4o-mini';

function normalizeNutritionData(raw: any, imageHash: string): any {
    const data = { ...raw };
    if (!data.dish_label && data.dish_name) data.dish_label = data.dish_name;
    if (!data.dish_label_ar && data.dish_name_ar) data.dish_label_ar = data.dish_name_ar;
    if (!data.total && data.total_nutrition) data.total = data.total_nutrition;
    if (!Array.isArray(data.ingredients)) data.ingredients = [];
    data.image_hash = imageHash;
    data.analysis_version = ANALYSIS_VERSION;
    data.detection_model_version = MODEL_VERSION;
    return data;
}

// ---------------------------------------------------------------------------
// Fake API responses
// ---------------------------------------------------------------------------
const FAKE_RAW_JSON_RESPONSE = JSON.stringify({
    dish_label: 'Kabsa',
    dish_label_ar: 'كبسة',
    confidence: 0.95,
    ingredients: [
        {
            name: 'Long-grain rice',
            name_ar: 'أرز',
            quantity_g: 200,
            nutrition_per_100g: { calories: 365, protein: 7, fat: 0.5, carbs: 80 },
            nutrition: { calories: 730, protein: 14, fat: 1, carbs: 160 }
        },
        {
            name: 'Chicken',
            name_ar: 'دجاج',
            quantity_g: 150,
            nutrition_per_100g: { calories: 165, protein: 31, fat: 3.6, carbs: 0 },
            nutrition: { calories: 248, protein: 47, fat: 5.4, carbs: 0 }
        }
    ],
    total: { calories: 978, protein: 61, fat: 6.4, carbs: 160 }
});

const FAKE_FENCED_JSON_RESPONSE = `
Here is the nutritional analysis:

\`\`\`json
{
  "dish_name": "Mandi",
  "dish_name_ar": "مندي",
  "confidence": 0.88,
  "ingredients": [],
  "total_nutrition": { "calories": 850, "protein": 55, "fat": 30, "carbs": 70 }
}
\`\`\`
`;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Integration: parseAIResponse + normalization pipeline', () => {
    it('processes a raw JSON OpenAI response for Kabsa correctly', () => {
        const imageHash = 'abcdef0123456789abcdef0123456789';
        const parsed = parseAIResponse(FAKE_RAW_JSON_RESPONSE);
        const result = normalizeNutritionData(parsed, imageHash);

        expect(result.dish_label).toBe('Kabsa');
        expect(result.dish_label_ar).toBe('كبسة');
        expect(result.confidence).toBe(0.95);
        expect(Array.isArray(result.ingredients)).toBe(true);
        expect(result.ingredients).toHaveLength(2);
        expect(result.total.calories).toBe(978);
        expect(result.image_hash).toBe(imageHash);
        expect(result.analysis_version).toBe(ANALYSIS_VERSION);
        expect(result.detection_model_version).toBe(MODEL_VERSION);
    });

    it('normalizes dish_name → dish_label when dish_label is absent (fenced response)', () => {
        const imageHash = '1234567890abcdef1234567890abcdef';
        const parsed = parseAIResponse(FAKE_FENCED_JSON_RESPONSE);
        const result = normalizeNutritionData(parsed, imageHash);

        // dish_name should be remapped to dish_label
        expect(result.dish_label).toBe('Mandi');
        expect(result.dish_label_ar).toBe('مندي');

        // total_nutrition should be remapped to total
        expect(result.total).toBeDefined();
        expect(result.total.calories).toBe(850);

        // ingredients defaults to []
        expect(result.ingredients).toHaveLength(0);

        expect(result.image_hash).toBe(imageHash);
        expect(result.analysis_version).toBe(ANALYSIS_VERSION);
    });

    it('fuzzy match: two photos of same dish within threshold are detected as duplicates', () => {
        // Simulate two hashes that differ by only 3 bits (well within threshold of 5)
        const hashA = 'abcdef0123456789';
        const hashB = 'abcdef0123456788'; // differ in last nibble: 9 vs 8 = 1 bit
        const distance = calculateHammingDistance(hashA, hashB);

        expect(distance).toBe(1);
        expect(distance).toBeLessThanOrEqual(5); // cache hit threshold
    });

    it('fuzzy match: heavily modified image exceeds threshold (cache miss)', () => {
        // Two hashes that differ by >> 5 bits
        const hashA = '0000000000000000';
        const hashB = 'ffffffffffffffff'; // every nibble: 0 vs f = 4 bits each, 16×4 = 64 bits
        const distance = calculateHammingDistance(hashA, hashB);

        expect(distance).toBe(64);
        expect(distance).toBeGreaterThan(5); // cache miss
    });

    it('throws gracefully on a completely corrupt AI response', () => {
        const corrupt = '<!DOCTYPE html><html>Error 500</html>';
        expect(() => parseAIResponse(corrupt)).toThrow();
    });
});
