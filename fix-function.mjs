const token = 'sbp_977200b8183996687048ac0ec26ff97249ff7834';
const projectRef = 'lurcmwqvgjfsfzsmvkne';
const functionName = 'analyze-food';

async function fix() {
    console.log(`Deleting ${functionName}...`);
    try {
        const delRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/functions/${functionName}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`Delete status: ${delRes.status}`);
        const delData = await delRes.json().catch(() => ({}));
        console.log(JSON.stringify(delData, null, 2));
    } catch (e) { console.error('Delete failed:', e); }

    console.log(`Waiting 2 seconds...`);
    await new Promise(r => setTimeout(r, 2000));

    console.log(`Creating ${functionName}...`);
    // Read the body from the file system
    // (Self-contained for this test - I'll just use a dummy body first to see if it works)
    const payload = {
        slug: functionName,
        name: functionName,
        verify_jwt: false,
        body: 'console.log("hello")'
    };

    const createRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/functions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    console.log(`Create status: ${createRes.status}`);
    const createData = await createRes.json();
    console.log(JSON.stringify(createData, null, 2));
}

fix();
