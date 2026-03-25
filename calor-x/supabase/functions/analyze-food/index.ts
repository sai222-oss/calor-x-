declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANALYSIS_VERSION = 'v14.0.0-regional-bundled';

// Food Database Priorities for Regional Accuracy
const REGIONAL_FOOD_PRIORITIES = `
ARABIC FOOD PRIORITIES (CRITICAL FOR SCANNING ACCURACY):
1. Maghreb: Couscous (كسكس), Tagine (طاجين), Harira (حريرة), Msemen (مسمن), Bastilla (بسطيلة), Rfissa (رفيسة).
2. Levant & Gulf: Shawarma (شاورما), Kofta (كفتة), Falafel (فلافل), Hummus (حمص), Kabsa (كبسة).
Analyze these specific dishes with extreme care for regional recipes and accurate weight estimation.
`;

function calculateHammingDistance(hash1: string, hash2: string): number {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 1000;
  let diff = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      const val1 = parseInt(hash1[i], 16);
      const val2 = parseInt(hash2[i], 16);
      let xor = val1 ^ val2;
      while (xor > 0) {
        diff += xor & 1;
        xor >>= 1;
      }
    }
  }
  return diff;
}

function parseAIResponse(aiResponse: string): any {
  try {
    return JSON.parse(aiResponse);
  } catch (e) {
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/```\n([\s\S]*?)\n```/);
    const candidate = jsonMatch ? jsonMatch[1] : aiResponse;
    return JSON.parse(candidate);
  }
}

async function callOpenAI(apiKey: string, base64Image: string, mimeType: string, imageHash: string, correction?: string): Promise<{ text: string, modelUsed: string }> {
  const model = "gpt-4o-mini";
  const systemPrompt = `You are an expert nutritionist specialized in Middle Eastern and Arab cuisine.
${REGIONAL_FOOD_PRIORITIES}
When analyzing a food image:
1. Identify the dish or food name in both Arabic and English WITH MAXIMUM ACCURACY.
2. Look very carefully at the exact food in the image. Do NOT guess based on color alone. (Example: Don't assume white cubes are sugar without confirming texture).
3. Estimate the portion size in grams WITH HIGH PRECISION. Do NOT default to 100g.
4. List ALL visible ingredients with estimated weights.
5. Calculate precise nutrition per ingredient and total. Ensure you provide accurate and non-zero estimates for ALL micronutrients (vitamins and minerals) like magnesium, potassium, zinc, iron, etc., especially for foods like water or vegetables.
6. Provide a short, simple health tip about the meal in both languages.

${correction ? "CRITICAL: The user provided a correction for this image: " + correction + ". Re-analyze based on this correction." : ""}

Return ONLY this JSON:
{
  "image_hash": "${imageHash || 'none'}",
  "dish_name_ar": "",
  "dish_name_en": "",
  "confidence": 0.95,
  "total_weight_g": 0,
  "total_nutrition": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "sugar": 0, "sodium": 0, "vitA": 0, "vitC": 0, "vitD": 0, "vitB12": 0, "calcium": 0, "iron": 0, "magnesium": 0, "potassium": 0, "zinc": 0 },
  "ingredients": [ { "name_ar": "", "name_en": "", "weight_g": 0, "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "sugar": 0, "sodium": 0, "vitA": 0, "vitC": 0, "vitD": 0, "vitB12": 0, "calcium": 0, "iron": 0, "magnesium": 0, "potassium": 0, "zinc": 0 } ],
  "meal_type": "breakfast|lunch|dinner|snack",
  "health_tip_en": "",
  "health_tip_ar": ""
}`;

  console.log(`OpenAI: Fetching https://api.openai.com/v1/chat/completions`);
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

async function callGemini(apiKey: string, base64Image: string, mimeType: string, imageHash: string, correction?: string): Promise<{ text: string, modelUsed: string }> {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];
  const systemPrompt = `You are an expert nutritionist specialized in Middle Eastern and Arab cuisine.
${REGIONAL_FOOD_PRIORITIES}
When analyzing a food image:
1. Identify the dish or food name in both Arabic and English WITH MAXIMUM ACCURACY.
2. Look very carefully at the exact food in the image. Do NOT guess based on color alone. (Example: Don't assume white cubes are sugar without confirming texture).
3. Estimate the portion size in grams WITH HIGH PRECISION.
4. List ALL visible ingredients with estimated weights.
5. Calculate precise nutrition per ingredient and total. Ensure you provide accurate and realistic non-zero estimates for ALL micronutrients (vitamins and minerals) like magnesium, potassium, zinc, iron, calcium, vitA, vitC, etc., especially for foods like water or vegetables. Do not output 0 for minerals in water.
6. Provide a short, simple health tip about the meal in both languages.

${correction ? "CRITICAL: The user provided a correction for this image: " + correction + ". Re-analyze based on this correction." : ""}

Return ONLY JSON: { image_hash, dish_name_ar, dish_name_en, confidence, total_weight_g, total_nutrition: {calories, protein, carbs, fat, fiber, sugar, sodium, vitA, vitC, vitD, vitB12, calcium, iron, magnesium, potassium, zinc}, ingredients: [{name_ar, name_en, weight_g, calories, protein, carbs, fat, fiber, sugar, sodium, vitA, vitC, vitD, vitB12, calcium, iron, magnesium, potassium, zinc}], meal_type, health_tip_en, health_tip_ar }`;

  let lastError = '';
  for (const model of models) {
    try {
      console.log(`Gemini: Fetching https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`);
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.text();
    console.log('Request body length:', body.length);
    console.log('Request body start:', body.slice(0, 200));

    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (e: any) {
      throw new Error(`JSON_PARSE_ERROR: ${e.message} at body: ${body.slice(0, 100)}`);
    }

    const { image, imageUrl, imageBase64, mimeType: clientMimeType, imageHash: rawImageHash, userId, depth, correction } = parsedBody;
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const imageHash = typeof rawImageHash === 'string' ? rawImageHash.trim().toLowerCase() : rawImageHash;

    // 1. Cache Check (Plain Fetch)
    if (imageHash && userId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && !correction) {
      try {
        console.log(`Cache: Checking for hash ${imageHash}`);
        const cacheUrl = `${SUPABASE_URL}/rest/v1/image_analysis_cache?user_id=eq.${userId}&order=created_at.desc&limit=20`;
        const cacheResp = await fetch(cacheUrl, {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        });

        if (cacheResp.ok) {
          const cached = await cacheResp.json();
          for (const c of cached) {
            if (calculateHammingDistance(imageHash, c.image_hash) <= 5) {
              console.log('Cache: Found match');
              return new Response(JSON.stringify(c.result_json), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
          }
        }
      } catch (e) { console.warn('Cache check failed:', e); }
    }

    // 2. Get image data
    let imgBase64 = '';
    let mimeType = 'image/jpeg';

    if (image || imageBase64) {
      imgBase64 = image || imageBase64;
      mimeType = clientMimeType || 'image/jpeg';
    } else if (imageUrl) {
      console.log(`Image: Fetching ${imageUrl}`);
      const imgResp = await fetch(imageUrl);
      if (!imgResp.ok) throw new Error(`Image fetch failed: ${imgResp.status}`);
      const imgBuffer = await imgResp.arrayBuffer();
      const imgBytes = new Uint8Array(imgBuffer);
      let raw = '';
      const chunkSize = 8192;
      for (let i = 0; i < imgBytes.length; i += chunkSize) { raw += String.fromCharCode(...imgBytes.subarray(i, i + chunkSize)); }
      imgBase64 = btoa(raw);
      mimeType = clientMimeType || imgResp.headers.get('content-type') || 'image/jpeg';
    } else {
      throw new Error('No image data provided');
    }

    let result;
    let finalError = "";

    try {
      if (GEMINI_API_KEY) result = await callGemini(GEMINI_API_KEY, imgBase64, mimeType, imageHash, correction);
    } catch (e: any) {
      console.warn("Gemini failed:", e?.message);
      finalError += `Gemini: ${e?.message}. `;
    }

    if (!result && OPENAI_API_KEY) {
      try {
        result = await callOpenAI(OPENAI_API_KEY, imgBase64, mimeType, imageHash, correction);
      } catch (e: any) {
        console.warn("OpenAI failed:", e?.message);
        finalError += `OpenAI: ${e?.message}. `;
      }
    }

    if (!result) throw new Error(`Real analysis failed. Details: ${finalError || "No API keys or network connection"}`);

    const nutritionData = parseAIResponse(result.text);
    nutritionData.model_used = result.modelUsed;
    nutritionData.image_hash = imageHash;
    nutritionData.analysis_version = ANALYSIS_VERSION;

    if (imageHash && userId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const cacheUrl = `${SUPABASE_URL}/rest/v1/image_analysis_cache`;
        await fetch(cacheUrl, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ user_id: userId, image_hash: imageHash, image_url: imageUrl || '', result_json: nutritionData })
        });
      } catch (e) { console.warn('Cache save failed:', e); }
    }

    return new Response(JSON.stringify(nutritionData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Final error:', error?.message || String(error));
    return new Response(JSON.stringify({ error: error?.message || String(error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
