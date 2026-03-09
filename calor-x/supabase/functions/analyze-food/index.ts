import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { calculateHammingDistance, parseAIResponse } from './utils.ts';

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANALYSIS_VERSION = 'v13.0.0-base64-direct';

async function callOpenAI(apiKey: string, base64Image: string, mimeType: string, imageHash: string): Promise<{ text: string, modelUsed: string }> {
  const model = "gpt-4o-mini";
  const systemPrompt = `You are an expert nutritionist specialized in Middle Eastern and Arab cuisine.

When analyzing a food image:
1. Identify the dish or food name in both Arabic and English. If it is a random mix of ingredients, name it descriptively.
2. Estimate the portion size in grams.
3. List ALL visible ingredients with estimated weights. CRITICAL: If the image is a complex dish (like Kabsa, Salad, Pizza), you must break it down into its individual raw or cooked components. However, if the image is obviously a single raw or simple food item (e.g., just "Peanuts", just "An Apple", just "A Banana"), then it is perfectly fine and correct to return just that single ingredient in the list. Do not force a breakdown if it's just a handful of peanuts.
4. Calculate precise nutrition per ingredient and total, including micronutrients.
5. Cross-reference with standard Arab cuisine recipes where applicable.
6. Provide a short, simple health tip about the meal (e.g. "Low in protein", "High in carbs, consider a smaller portion", or "Great source of healthy fats" for peanuts).

Return ONLY this JSON:
{
  "image_hash": "${imageHash || 'none'}",
  "dish_name_ar": "",
  "dish_name_en": "",
  "confidence": 0.95,
  "total_weight_g": 0,
  "total_nutrition": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "fiber": 0,
    "sugar": 0,
    "sodium": 0,
    "vitamin_c_mg": 0,
    "calcium_mg": 0,
    "iron_mg": 0
  },
  "ingredients": [
    {
      "name_ar": "",
      "name_en": "",
      "weight_g": 0,
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "vitamin_c_mg": 0,
      "calcium_mg": 0,
      "iron_mg": 0
    }
  ],
  "meal_type": "breakfast|lunch|dinner|snack",
  "health_tip_en": "High in protein, good for recovery.",
  "health_tip_ar": "عالي بالبروتين، ممتاز للاستشفاء العضلي."
}`;

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 2048,
      temperature: 0.0,
      response_format: { type: "json_object" }
    })
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI error ${resp.status}: ${err}`);
  }

  const data = await resp.json();
  return { text: data.choices[0].message.content, modelUsed: model };
}

async function callGemini(apiKey: string, base64Image: string, mimeType: string, imageHash: string): Promise<{ text: string, modelUsed: string }> {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
  const systemPrompt = `You are an expert nutritionist specialized in Middle Eastern and Arab cuisine.

When analyzing a food image:
1. Identify the dish or food name in both Arabic and English. If it is a random mix of ingredients, name it descriptively.
2. Estimate the portion size in grams.
3. List ALL visible ingredients with estimated weights. CRITICAL: If the image is a complex dish (like Kabsa, Salad, Pizza), you must break it down into its individual raw or cooked components. However, if the image is obviously a single raw or simple food item (e.g., just "Peanuts", just "An Apple", just "A Banana"), then it is perfectly fine and correct to return just that single ingredient in the list. Do not force a breakdown if it's just a handful of peanuts.
4. Calculate precise nutrition per ingredient and total, including micronutrients.
5. Cross-reference with standard Arab cuisine recipes where applicable.
6. Provide a short, simple health tip about the meal (e.g. "Low in protein", "High in carbs, consider a smaller portion", or "Great source of healthy fats" for peanuts).

Return ONLY JSON: { image_hash, dish_name_ar, dish_name_en, confidence, total_weight_g, total_nutrition: {calories, protein, carbs, fat, fiber, sugar, sodium, vitamin_c_mg, calcium_mg, iron_mg}, ingredients: [{name_ar, name_en, weight_g, calories, protein, carbs, fat, vitamin_c_mg, calcium_mg, iron_mg}], meal_type, health_tip_en, health_tip_ar }`;

  let lastError = '';
  for (const model of models) {

    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }, { inline_data: { mime_type: mimeType, data: base64Image } }] }],
          generationConfig: { temperature: 0.0 }
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text, modelUsed: model };
        // Sometimes Gemini returns ok but empty candidates (safety block)
        const finishReason = data?.candidates?.[0]?.finishReason;
        lastError = `Gemini ${model}: empty response (finishReason=${finishReason || 'unknown'})`;
        console.warn(lastError);
      } else {
        const errText = await resp.text();
        lastError = `Gemini ${model} HTTP ${resp.status}: ${errText.slice(0, 300)}`;
        console.warn(lastError);
      }
    } catch (e: any) {
      lastError = `Gemini ${model} exception: ${e.message}`;
      console.warn(lastError);
    }
  }
  throw new Error(`GEMINI_FAILED: ${lastError || 'All models failed'}`);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl, imageBase64, mimeType: clientMimeType, imageHash: rawImageHash, userId } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const imageHash = typeof rawImageHash === 'string' ? rawImageHash.trim().toLowerCase() : rawImageHash;

    // 1. Cache Check
    if (imageHash && userId) {
      const { data: cached } = await supabase.from('image_analysis_cache').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
      if (cached) {
        for (const c of cached) {
          if (calculateHammingDistance(imageHash, c.image_hash) <= 5) {
            return new Response(JSON.stringify(c.result_json), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
        }
      }
    }

    // 2. Get image data — prefer base64 sent directly from client (most reliable, no re-fetch needed)
    let imgBase64 = '';
    let mimeType = 'image/jpeg';

    if (imageBase64) {
      // Client sent base64 directly — use it straight away
      imgBase64 = imageBase64;
      mimeType = clientMimeType || 'image/jpeg';
    } else if (imageUrl) {
      // Fallback: fetch image from storage URL
      const imgResp = await fetch(imageUrl);
      if (!imgResp.ok) throw new Error(`Image fetch failed: ${imgResp.status}`);
      const imgBuffer = await imgResp.arrayBuffer();
      const imgBytes = new Uint8Array(imgBuffer);
      let raw = '';
      const chunkSize = 8192;
      for (let i = 0; i < imgBytes.length; i += chunkSize) { raw += String.fromCharCode(...imgBytes.subarray(i, i + chunkSize)); }
      imgBase64 = btoa(raw);
      // Gemini expects exactly 'image/jpeg', 'image/png', etc. If the content-type from headers is generic block, use what the client sent.
      mimeType = clientMimeType || imgResp.headers.get('content-type') || 'image/jpeg';
      if (mimeType === 'application/octet-stream') mimeType = 'image/jpeg';
    } else {
      throw new Error('No image data provided');
    }

    let result;
    let finalError = "";

    // Try Gemini first
    try {
      if (GEMINI_API_KEY) {
        result = await callGemini(GEMINI_API_KEY, imgBase64, mimeType, imageHash);
      }
    } catch (e: any) {
      console.warn("Gemini failed, trying OpenAI:", e?.message);
      finalError += `Gemini: ${e?.message}. `;
    }

    // Try OpenAI if Gemini failed
    if (!result && OPENAI_API_KEY) {
      try {
        result = await callOpenAI(OPENAI_API_KEY, imgBase64, mimeType, imageHash);
      } catch (e: any) {
        console.warn("OpenAI failed:", e?.message);
        finalError += `OpenAI: ${e?.message}. `;
      }
    }

    if (!result) {
      throw new Error(`Real analysis failed. Details: ${finalError || "No API keys configured"}`);
    }

    const nutritionData = parseAIResponse(result.text);
    nutritionData.model_used = result.modelUsed;
    nutritionData.image_hash = imageHash;
    nutritionData.analysis_version = ANALYSIS_VERSION;

    // Save to cache
    if (imageHash && userId) {
      const { error: cacheErr } = await supabase.from('image_analysis_cache').insert({ user_id: userId, image_hash: imageHash, image_url: imageUrl || '', result_json: nutritionData });
      if (cacheErr) console.warn("Cache save failed:", cacheErr);
    }

    return new Response(JSON.stringify(nutritionData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Final error:', error?.message || String(error));
    return new Response(JSON.stringify({ error: error?.message || String(error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
