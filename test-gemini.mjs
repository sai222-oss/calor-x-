const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_KEY;
async function test() {
    const res = await fetch(url);
    const data = await res.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
}
test();
