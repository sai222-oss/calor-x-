Deno.serve(async (req: Request) => {
    return new Response(JSON.stringify({ message: "Zero-dependency Hello from Calor-X!" }), {
        headers: { "Content-Type": "application/json" },
    });
});
