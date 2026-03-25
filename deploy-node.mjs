import fs from 'fs';
import path from 'path';

const token = 'sbp_977200b8183996687048ac0ec26ff97249ff7834';
const projectRef = 'lurcmwqvgjfsfzsmvkne';
const functionName = 'analyze-food';

async function deploy() {
    console.log(`Starting deployment of ${functionName} to ${projectRef}...`);

    // Read the function body
    const indexPath = path.join(process.cwd(), 'calor-x', 'supabase', 'functions', functionName, 'index.ts');
    const bodyText = fs.readFileSync(indexPath, 'utf8');

    const payload = {
        slug: functionName,
        name: functionName,
        verify_jwt: false,
        body: bodyText
    };

    try {
        const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/functions/${functionName}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            console.log('Deployment successful!');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.error(`Deployment failed with status ${res.status}`);
            console.error(JSON.stringify(data, null, 2));

            if (res.status === 404) {
                console.log('Function not found, attempting to create (POST)...');
                const createRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/functions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                const createData = await createRes.json();
                if (createRes.ok) {
                    console.log('Creation successful!');
                    console.log(JSON.stringify(createData, null, 2));
                } else {
                    console.error(`Creation failed with status ${createRes.status}`);
                    console.error(JSON.stringify(createData, null, 2));
                }
            }
        }
    } catch (error) {
        console.error('An error occurred during deployment:', error);
    }
}

deploy();
