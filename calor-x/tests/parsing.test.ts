import { describe, it, expect } from 'vitest';
import { parseAIResponse } from '../supabase/functions/analyze-food/utils';

describe('parseAIResponse', () => {
  // --- Raw JSON ---
  it('parses raw JSON', () => {
    const raw = JSON.stringify({ dish_label: 'Shawarma', confidence: 0.92 });
    expect(parseAIResponse(raw).dish_label).toBe('Shawarma');
  });

  it('parses raw JSON with leading/trailing whitespace and newlines', () => {
    const raw = `  \n${JSON.stringify({ dish_label: 'Kabsa', confidence: 0.95 })}\n  `;
    expect(parseAIResponse(raw).dish_label).toBe('Kabsa');
  });

  it('preserves numeric types (confidence as number)', () => {
    const raw = JSON.stringify({ dish_label: 'Falafel', confidence: 0.8 });
    const result = parseAIResponse(raw);
    expect(typeof result.confidence).toBe('number');
    expect(result.confidence).toBe(0.8);
  });

  // --- Fenced JSON ---
  it('parses fenced JSON with ```json lang tag', () => {
    const fenced = '```json\n{"dish_label":"Hummus","confidence":0.88}\n```';
    expect(parseAIResponse(fenced).dish_label).toBe('Hummus');
  });

  it('parses fenced block with no json language tag', () => {
    const fenced = '```\n{"dish_label":"Mansaf","confidence":0.85}\n```';
    expect(parseAIResponse(fenced).dish_label).toBe('Mansaf');
  });

  it('parses messy response with preamble text and fenced json block', () => {
    const messy = 'Here is your analysis:\n```json\n{"dish_label":"Tagine","confidence":0.90}\n```\nEnd of response.';
    expect(parseAIResponse(messy).dish_label).toBe('Tagine');
  });

  it('parses messy response with plain fence (no json tag)', () => {
    const messy = 'Some text\n```\n{"dish_label":"Falafel","confidence":0.80}\n```\nFooter';
    expect(parseAIResponse(messy).dish_label).toBe('Falafel');
  });

  // --- Nested structure ---
  it('parses ingredients array correctly', () => {
    const data = {
      dish_label: 'Couscous',
      confidence: 0.91,
      ingredients: [
        { name: 'Semolina', quantity_g: 150, nutrition: { calories: 530 } }
      ],
      total: { calories: 530 }
    };
    const result = parseAIResponse(JSON.stringify(data));
    expect(Array.isArray(result.ingredients)).toBe(true);
    expect(result.ingredients[0].name).toBe('Semolina');
  });

  // --- Error handling ---
  it('throws on completely invalid input', () => {
    expect(() => parseAIResponse('not json at all')).toThrow();
  });

  it('throws on empty string', () => {
    expect(() => parseAIResponse('')).toThrow();
  });
});
