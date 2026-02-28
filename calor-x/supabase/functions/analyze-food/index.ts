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
  const systemPrompt = `You are a world-class deterministic nutrition analysis AI specialized in ARAB and INTERNATIONAL cuisine, calibrated for gym athletes and health-conscious users.

CRITICAL: Return ONLY valid JSON with NO markdown fences, no extra text, no explanation.

ARAB CUISINE RULES:
- Shared platters: estimate individual serving (~300-400g), NOT whole platter
- Rice dishes (Kabsa/Mandi): assume 1.5x calorie density due to oil/ghee
- Olive oil: assume at least 1 tbsp per serving for salads/dips

OUTPUT FORMAT — Return ONLY this exact JSON structure:
{
  "image_hash": "${imageHash || 'none'}",
  "dish_label": "English Name",
  "dish_label_ar": "Arabic Name",
  "confidence": 0.95,
  "glycemic_index": 65,
  "meal_timing": "post_workout",
  "protein_quality_score": 8,
  "gym_tip": "One sentence gym tip in English",
  "gym_tip_ar": "نفس النصيحة بالعربية",
  "ingredients": [
    {
      "name": "Ingredient",
      "name_ar": "Arabic",
      "quantity_g": 150,
      "nutrition_per_100g": { "calories": 165, "protein_g": 31.0, "fat_g": 3.6, "carbs_g": 0.0, "fiber_g": 0.0, "sugar_g": 0.0, "sodium_mg": 74 },
      "nutrition": { "calories": 248, "protein_g": 46.5, "fat_g": 5.4, "carbs_g": 0.0, "fiber_g": 0.0, "sugar_g": 0.0, "sodium_mg": 111 }
    }
  ],
  "total": {
    "calories": 650, "protein_g": 52.0, "fat_g": 18.0, "carbs_g": 65.0,
    "fiber_g": 4.0, "sugar_g": 3.0, "sodium_mg": 480,
    "vitamins_minerals": { "vitamin_c_mg": 12, "iron_mg": 3, "calcium_mg": 45, "potassium_mg": 420, "vitamin_d_iu": 0, "zinc_mg": 4 }
  }
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
  const systemPrompt = `You are a world-class deterministic nutrition analysis AI specialized in ARAB and INTERNATIONAL cuisine. Return ONLY JSON. Rules: Arab cuisine (shared platters ~400g), Rice density 1.5x, Olive oil default.`;

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
