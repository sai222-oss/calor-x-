import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

declare const Deno: any;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        const { message, userId, conversationHistory = [] } = await req.json();
        if (!message) throw new Error("message is required");

        let profileContext = "";
        let goalsContext = "";
        let todayMealsContext = "";

        if (userId) {
            console.log("Fetching context for userId:", userId);
            try {
                const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
                const today = new Date().toISOString().split("T")[0];

                const [profileRes, goalsRes, mealsRes] = await Promise.all([
                    supabase.from("profiles").select("*").eq("id", userId).single(),
                    supabase.from("daily_goals").select("*").eq("user_id", userId).single(),
                    supabase.from("meal_logs")
                        .select("dish_name, calories, protein_g, carbs_g, fat_g, fiber_g, logged_at")
                        .eq("user_id", userId)
                        .gte("logged_at", `${today}T00:00:00`)
                        .order("logged_at", { ascending: true }),
                ]);

                if (profileRes.error && profileRes.error.code !== "PGRST116") console.warn("Profile fetch error:", profileRes.error);
                if (goalsRes.error && goalsRes.error.code !== "PGRST116") console.warn("Goals fetch error:", goalsRes.error);
                if (mealsRes.error) console.warn("Meals fetch error:", mealsRes.error);

                const profile = profileRes.data;
                const goals = goalsRes.data;
                const meals = mealsRes.data || [];

                if (profile) {
                    profileContext = `USER PROFILE: Gender: ${profile.gender || "unknown"}, Age: ${profile.age || "unknown"}, Weight: ${profile.weight_kg ? profile.weight_kg + "kg" : "unknown"}, Height: ${profile.height_cm ? profile.height_cm + "cm" : "unknown"}, Goal: ${profile.health_goal || "unknown"}, Activity: ${profile.activity_level || "unknown"}`;
                }
                if (goals) {
                    goalsContext = `DAILY TARGETS: ${goals.calories_target}kcal, Protein ${goals.protein_g_target}g, Carbs ${goals.carbs_g_target}g, Fat ${goals.fat_g_target}g`;
                }
                if (meals.length > 0) {
                    const totals = meals.reduce((a: any, m: any) => ({
                        cal: a.cal + (Number(m.calories) || 0),
                        prot: a.prot + (Number(m.protein_g) || 0),
                        carbs: a.carbs + (Number(m.carbs_g) || 0),
                        fat: a.fat + (Number(m.fat_g) || 0)
                    }), { cal: 0, prot: 0, carbs: 0, fat: 0 });

                    todayMealsContext = `TODAY'S MEALS: ${meals.map((m: any) => `${m.dish_name} (${Math.round(Number(m.calories) || 0)}kcal)`).join(", ")}. TOTALS: ${Math.round(totals.cal)}kcal, P:${Math.round(totals.prot)}g C:${Math.round(totals.carbs)}g F:${Math.round(totals.fat)}g`;

                    if (goals && goals.calories_target) {
                        todayMealsContext += `. REMAINING: ${Math.round(Number(goals.calories_target) - totals.cal)}kcal, P:${Math.round(Number(goals.protein_g_target) - totals.prot)}g`;
                    }
                } else {
                    todayMealsContext = "TODAY'S MEALS: None logged yet.";
                }
                console.log("Context fetch complete");
            } catch (dbErr) {
                console.error("Database context fetch failed:", dbErr);
                // Continue without context rather than failing entirely
            }
        }

        const systemPrompt = `You are Calor X Coach — a bilingual (Arabic/English) AI nutrition and fitness coach specialized in Arab and international cuisine.
PERSONALITY: Motivating, direct, practical. Give real actionable advice with specific numbers.
LANGUAGE: Respond in the same language the user writes in.
${profileContext}
${goalsContext}
${todayMealsContext}`;

        console.log("Coach request context prepared. Messages in history:", conversationHistory.length);
        let reply = "";

        // 1. Try Gemini
        if (GEMINI_API_KEY) {
            const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
            let lastGeminiError = "";

            for (const model of models) {
                try {
                    console.log(`Trying Gemini model: ${model}`);

                    // Filter history to ensure alternating roles and no empty content
                    const cleanHistory = [];
                    let lastRole = "";

                    for (const m of conversationHistory) {
                        const role = m.role === 'assistant' ? 'model' : 'user';
                        if (role !== lastRole && m.content) {
                            cleanHistory.push({ role, parts: [{ text: m.content }] });
                            lastRole = role;
                        }
                    }

                    // If last history was user, and we want to add user message, we need to merge or skip
                    const contents = [...cleanHistory];
                    if (lastRole === 'user' && contents.length > 0) {
                        // Append to the last user message instead of adding a new one
                        contents[contents.length - 1].parts[0].text += "\n\n" + message;
                    } else {
                        contents.push({ role: 'user', parts: [{ text: message }] });
                    }

                    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            system_instruction: {
                                parts: [{ text: systemPrompt }]
                            },
                            contents: contents,
                            generationConfig: { temperature: 0.7 }
                        })
                    });

                    if (resp.ok) {
                        const data = await resp.json();
                        reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                        if (reply) {
                            console.log(`Gemini ${model} success`);
                            break;
                        } else {
                            const finishReason = data?.candidates?.[0]?.finishReason;
                            const safetyRatings = data?.candidates?.[0]?.safetyRatings;
                            console.warn(`Gemini ${model} returned empty response. Finish reason: ${finishReason}. Safety:`, JSON.stringify(safetyRatings));
                        }
                    } else {
                        const errText = await resp.text();
                        lastGeminiError = `Gemini ${model} HTTP ${resp.status}: ${errText}`;
                        console.warn(lastGeminiError);
                    }
                } catch (e: any) {
                    lastGeminiError = `Gemini ${model} exception: ${e.message}`;
                    console.warn(lastGeminiError);
                }
            }
        }

        // 2. Try OpenAI as fallback
        if (!reply && OPENAI_API_KEY) {
            try {
                console.log("Trying OpenAI fallback (gpt-4o-mini)");
                const resp = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                            { role: "system", content: systemPrompt },
                            ...conversationHistory.map((msg: any) => ({
                                role: msg.role === "assistant" ? "assistant" : "user",
                                content: msg.content
                            })),
                            { role: "user", content: message }
                        ],
                        temperature: 0.7
                    })
                });
                if (resp.ok) {
                    const data = await resp.json();
                    reply = data?.choices?.[0]?.message?.content || "";
                    if (reply) console.log("OpenAI success");
                } else {
                    const errText = await resp.text();
                    console.warn(`OpenAI HTTP ${resp.status}: ${errText}`);
                }
            } catch (e: any) {
                console.warn("OpenAI exception:", e.message);
            }
        }

        if (!reply) throw new Error("Failed to generate response from any AI provider (Gemini or OpenAI).");

        return new Response(JSON.stringify({ reply }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Coach function final error:", error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : "Unknown error",
                details: "Check function logs for more information."
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
