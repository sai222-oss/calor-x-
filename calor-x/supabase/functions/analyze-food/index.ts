import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { calculateHammingDistance, parseAIResponse } from './utils.ts';

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANALYSIS_VERSION = 'v12.0.0-real-only';

async function callOpenAI(apiKey: string, base64Image: string, mimeType: string, imageHash: string): Promise<{ text: string, modelUsed: string }> {
  const model = "gpt-4o-mini"; // or gpt-4o for better vision
  const systemPrompt = `You are an expert nutritionist specialized in Middle Eastern and Arab cuisine.

When analyzing a food image:
1. Identify the dish name in both Arabic and English. If it is a random mix of ingredients (e.g. cooked tomatoes and potatoes), DO NOT force a traditional dish name. Instead, name it descriptively (e.g., "Tomato and Potato Mix" / "خليط طماطم وبطاطس").
2. Estimate the portion size in grams.
3. List ALL visible ingredients with estimated weights. CRITICAL: For complex/layered dishes (like Couscous, Tagine, or Kabsa), DO NOT blindly hallucinate ingredients that aren't there. You may infer necessary cooking bases (like oils, ghee, or broth) if the food texture implies it (e.g. glossy/wet grains). However, DO NOT add solid ingredients (like meat, eggs, or vegetables) unless they are clearly visible or partially visible.
4. Calculate precise nutrition per ingredient and total.
5. Cross-reference with standard Arab cuisine recipes where applicable.
6. If it's a restaurant dish, use standard restaurant portion sizes.

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
    "sodium": 0
  },
  "ingredients": [
    {
      "name_ar": "",
      "name_en": "",
      "weight_g": 0,
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0
    }
  ],
  "meal_type": "breakfast|lunch|dinner|snack",
  "cuisine_type": "moroccan|levantine|gulf|egyptian|general_arab",
  "glycemic_index": 65,
  "protein_quality_score": 8,
  "gym_tip": "Gym tip in English",
  "gym_tip_ar": "نفس النصيحة بالعربية"
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
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  const systemPrompt = `You are an expert nutritionist specialized in Middle Eastern and Arab cuisine.

When analyzing a food image:
1. Identify the dish name in both Arabic and English. If it is a random mix of ingredients (e.g. cooked tomatoes and potatoes), DO NOT force a traditional dish name. Instead, name it descriptively (e.g., "Tomato and Potato Mix" / "خليط طماطم وبطاطس").
2. Estimate the portion size in grams.
3. List ALL visible ingredients with estimated weights. CRITICAL: For complex/layered dishes (like Couscous, Tagine, or Kabsa), DO NOT blindly hallucinate ingredients that aren't there. You may infer necessary cooking bases (like oils, ghee, or broth) if the food texture implies it (e.g. glossy/wet grains). However, DO NOT add solid ingredients (like meat, eggs, or vegetables) unless they are clearly visible or partially visible.
4. Calculate precise nutrition per ingredient and total.
5. Cross-reference with standard Arab cuisine recipes where applicable.
6. If it's a restaurant dish, use standard restaurant portion sizes.

Return ONLY JSON: { image_hash, dish_name_ar, dish_name_en, confidence, total_weight_g, total_nutrition (calories, protein, carbs, fat, fiber, sugar, sodium), ingredients [{name_ar, name_en, weight_g, calories, protein, carbs, fat}], meal_type, cuisine_type, glycemic_index, protein_quality_score, gym_tip, gym_tip_ar }`;

  for (const model of models) {
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }, { inline_data: { mime_type: mimeType, data: base64Image } }] }]
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text, modelUsed: model };
      }
    } catch (e) { console.warn(`Model ${model} failed`, e); }
  }
  throw new Error("GEMINI_FAILED");
}

serve(async (req: Request) => {
  const requestStart = Date.now();
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl, imageHash: rawImageHash, userId } = await req.json();
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

    // 2. Real Analysis
    const imgResp = await fetch(imageUrl);
    if (!imgResp.ok) throw new Error("Image fetch failed");
    const imgBuffer = await imgResp.arrayBuffer();
    const imgBytes = new Uint8Array(imgBuffer);
    let imgBase64 = '';
    const chunkSize = 8192;
    for (let i = 0; i < imgBytes.length; i += chunkSize) { imgBase64 += String.fromCharCode(...imgBytes.subarray(i, i + chunkSize)); }
    imgBase64 = btoa(imgBase64);
    const mimeType = imgResp.headers.get('content-type') || 'image/jpeg';

    let result;
    let finalError = "";

    // Try Gemini
    try {
      if (GEMINI_API_KEY) {
        result = await callGemini(GEMINI_API_KEY, imgBase64, mimeType, imageHash);
      }
    } catch (e) {
      console.warn("Gemini failed, trying OpenAI:", e.message);
      finalError += `Gemini: ${e.message}. `;
    }

    // Try OpenAI if Gemini failed
    if (!result && OPENAI_API_KEY) {
      try {
        result = await callOpenAI(OPENAI_API_KEY, imgBase64, mimeType, imageHash);
      } catch (e) {
        console.warn("OpenAI failed:", e.message);
        finalError += `OpenAI: ${e.message}. `;
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
      await supabase.from('image_analysis_cache').insert({ user_id: userId, image_hash: imageHash, image_url: imageUrl, result_json: nutritionData }).catch(() => { });
    }

    return new Response(JSON.stringify(nutritionData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Final error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
