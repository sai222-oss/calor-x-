import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.40.0';

Deno.serve(async (req: Request) => {
    return new Response(JSON.stringify({ message: "Supabase client 2.40.0 import works!" }), {
        headers: { "Content-Type": "application/json" },
    });
});
