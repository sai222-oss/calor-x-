const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://lurcmwqvgjfsfzsmvkne.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY. Check your setup.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function upgrade() {
    const email = "atman.homam@gmail.com";

    // 1. Get the user from auth.users (requires service role key to query auth schema indirectly or we can get from profiles)
    // Our schema usually copies email to profiles, let's check profiles directly.
    const { data: profiles, error: profileErr } = await supabase.from('profiles').select('id, full_name').eq('email', email);

    if (profileErr) {
        console.error("Error fetching profile:", profileErr);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.error(`User with email ${email} not found in profiles table.`);
        // Fallback: search auth users via admin API
        const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
        if (userErr) {
            console.error("Error listing auth users:", userErr);
            return;
        }
        const user = users.users.find(u => u.email === email);
        if (user) {
            console.log("Found user in auth, updating profile...");
            const { error: updateErr } = await supabase.from('profiles').update({ plan: 'pro' }).eq('id', user.id);
            if (updateErr) console.error("Error updating plan:", updateErr);
            else console.log(`Successfully upgraded ${email} (ID: ${user.id}) to Pro!`);
        } else {
            console.error("User not found in auth.users either.");
        }
        return;
    }

    const user = profiles[0];
    console.log(`Found profile: ${user.id} (${user.full_name})`);
    const { error: updateErr } = await supabase.from('profiles').update({ plan: 'pro' }).eq('id', user.id);

    if (updateErr) console.error("Error updating plan:", updateErr);
    else console.log(`Successfully upgraded ${email} to Pro!`);
}

upgrade();
