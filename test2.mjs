import fs from 'fs';
const url = 'https://lurcmwqvgjfsfzsmvkne.supabase.co/functions/v1/analyze-food';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cmNtd3F2Z2pmc2Z6c212a25lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMTAzMTUsImV4cCI6MjA4Nzg4NjMxNX0.IL8dKbsTxpecQlyxcEyd7To5d0bzvFfnr8b-lClvCR0';

async function test() {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({
            imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png',
            imageHash: 'testhash123',
            userId: 'test-user-id'
        })
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
}

test();
