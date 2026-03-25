const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1cmNtd3F2Z2pmc2Z6c212a25lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMTAzMTUsImV4cCI6MjA4Nzg4NjMxNX0.IL8dKbsTxpecQlyxcEyd7To5d0bzvFfnr8b-lClvCR0';
const url = 'https://lurcmwqvgjfsfzsmvkne.supabase.co/functions/v1/analyze-food';

async function test() {
    const payload = {
        image: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        userId: "test-user-123",
        language: "ar"
    };

    console.log('Sending request to', url);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log('Status:', res.status);
        if (res.ok) {
            console.log('Success:', JSON.stringify(data, null, 2));
            process.exit(0);
        } else {
            console.error('Error:', JSON.stringify(data, null, 2));
            process.exit(1);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        process.exit(1);
    }
}

test();
