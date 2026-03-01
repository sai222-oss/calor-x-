import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const WEBHOOK_SECRET = Deno.env.get("LEMON_SQUEEZY_WEBHOOK_SECRET") || ""

serve(async (req) => {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 })

    const signature = req.headers.get("x-signature")
    if (!signature) return new Response("Missing signature", { status: 401 })

    // Lemon squeezy webhook body needs to be used exactly as received for HMAC SHA-256
    const rawBody = await req.arrayBuffer()
    const textBody = new TextDecoder().decode(rawBody)

    // Verify signature
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(WEBHOOK_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    )

    const expectedSignature = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(textBody)
    )

    const expectedHex = Array.from(new Uint8Array(expectedSignature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")

    if (signature !== expectedHex) {
        return new Response("Invalid signature", { status: 401 })
    }

    const payload = JSON.parse(textBody)
    const eventName = payload.meta.event_name
    const customData = payload.meta.custom_data || {}
    const userId = customData.user_id

    if (!userId) {
        // If there is no custom user_id attached, it might be a test event or a purchase outside of our flow.
        return new Response("Missing custom user_id in payload", { status: 200 })
    }

    let newPlan = "free"

    // We are checking for the specific variant IDs
    const variantId = payload.data.attributes.variant_id?.toString()

    if (eventName === "subscription_created" || eventName === "subscription_resumed" || eventName === "subscription_updated") {
        // Free -> Pro
        if (variantId === "1353475" || variantId === "1353430") {
            newPlan = "pro"
        } else {
            // In case another product is bought, return ok but don't elevate to pro
            return new Response("Ignored unknown variant", { status: 200 })
        }
    } else if (eventName === "subscription_cancelled" || eventName === "subscription_expired" || eventName === "subscription_payment_failed") {
        // Pro -> Free
        newPlan = "free"
    } else {
        return new Response("Event ignored", { status: 200 })
    }

    // Update Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase
        .from("profiles")
        .update({ plan: newPlan })
        .eq("id", userId)

    if (error) {
        console.error("Error updating profile plan:", error)
        return new Response("Internal server error updating profile", { status: 500 })
    }

    return new Response(JSON.stringify({ success: true, plan: newPlan }), {
        headers: { "Content-Type": "application/json" },
        status: 200
    })
})
