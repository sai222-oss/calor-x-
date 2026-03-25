// Built-in fetch used
const url = 'https://lurcmwqvgjfsfzsmvkne.supabase.co/functions/v1/coach';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtndWloZHZxb2R2YWRtdXphbW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NjU2NDgsImV4cCI6MjA4NzI0MTY0OH0.Q8BqzD8_nIpgJL8maDTlFMCn30ph-82FktmRQxbkEog';

async function test() {
    console.log('Testing Coach Function...');
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({
            message: 'Hello, how can I lose weight?',
            userId: 'test-user-id',
            conversationHistory: []
        })
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
}

test();
