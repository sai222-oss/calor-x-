import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

declare const Deno: any;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const start = Date.now();
    try {
        const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

        const { message, userId, conversationHistory = [] } = await req.json();
        if (!message) throw new Error("message is required");

        let profileContext = "";
        let goalsContext = "";
        let todayMealsContext = "";

        if (userId) {
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
                const totals = meals.reduce((a: any, m: any) => ({ cal: a.cal + (m.calories || 0), prot: a.prot + (m.protein_g || 0), carbs: a.carbs + (m.carbs_g || 0), fat: a.fat + (m.fat_g || 0) }), { cal: 0, prot: 0, carbs: 0, fat: 0 });
                todayMealsContext = `TODAY'S MEALS: ${meals.map((m: any) => `${m.dish_name} (${Math.round(m.calories)}kcal)`).join(", ")}. TOTALS: ${Math.round(totals.cal)}kcal, P:${Math.round(totals.prot)}g C:${Math.round(totals.carbs)}g F:${Math.round(totals.fat)}g`;
                if (goals) todayMealsContext += `. REMAINING: ${Math.round(goals.calories_target - totals.cal)}kcal, P:${Math.round(goals.protein_g_target - totals.prot)}g`;
            } else {
                todayMealsContext = "TODAY'S MEALS: None logged yet.";
            }
        }

        const systemPrompt = `You are Calor X Coach — a bilingual (Arabic/English) AI nutrition and fitness coach specialized in Arab and international cuisine.
PERSONALITY: Motivating, direct, practical. Give real actionable advice with specific numbers.
LANGUAGE: Respond in the same language the user writes in.
${profileContext}
${goalsContext}
${todayMealsContext}`;

        const groqMessages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory.slice(-10).map((msg: any) => ({
                role: msg.role === "assistant" ? "assistant" : "user",
                content: msg.content
            })),
            { role: "user", content: message }
        ];

        const groqResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: groqMessages,
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!groqResp.ok) {
            const err = await groqResp.text();
            throw new Error(`Groq error ${groqResp.status}: ${err}`);
        }

        const data = await groqResp.json();
        const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

        return new Response(JSON.stringify({ reply }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Coach error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
