import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const SUPABASE_URL = 'https://lurcmwqvgjfsfzsmvkne.supabase.co';
const SUPABASE_ANON_KEY = 'ENTER_ANON_KEY_HERE'; // I'll need to use the actual one or just use fetch

async function testCoach() {
    console.log("Testing AI Coach function...");

    const resp = await fetch(`${SUPABASE_URL}/functions/v1/coach`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
            message: "Hello world",
            userId: "6f9471f0-06f1-432a-bc96-1c20e5c8e22a", // Just a dummy or real user
            conversationHistory: []
        })
    });

    const status = resp.status;
    const data = await resp.json();

    console.log("Status:", status);
    console.log("Data:", JSON.stringify(data, null, 2));
}

testCoach();
