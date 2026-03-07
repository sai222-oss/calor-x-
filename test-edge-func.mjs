import fetch from 'node-fetch';

const url = 'https://kguihdvqodvadmuzamoq.supabase.co/functions/v1/analyze-food';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtndWloZHZxb2R2YWRtdXphbW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NjU2NDgsImV4cCI6MjA4NzI0MTY0OH0.Q8BqzD8_nIpgJL8maDTlFMCn30ph-82FktmRQxbkEog';

async function test() {
    // Try passing a completely invalid URL to see the error message
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({
            imageUrl: 'https://via.placeholder.com/150',
            imageHash: 'testhash123',
            userId: 'test-user-id'
        })
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
}

test();
