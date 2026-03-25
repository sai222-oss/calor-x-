import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

Deno.serve(async (req: Request) => {
    return new Response(JSON.stringify({ message: "Supabase client import works!" }), {
        headers: { "Content-Type": "application/json" },
    });
});
