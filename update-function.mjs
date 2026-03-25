import fs from 'fs';
import path from 'path';

const token = 'sbp_977200b8183996687048ac0ec26ff97249ff7834';
const projectRef = 'lurcmwqvgjfsfzsmvkne';
const functionSlug = 'analyze-food';

async function update() {
    const indexPath = path.join(process.cwd(), 'calor-x', 'supabase', 'functions', 'analyze-food', 'index.ts');
    const bodyText = fs.readFileSync(indexPath, 'utf8');

    const payload = {
        verify_jwt: false,
        body: bodyText
    };

    console.log(`Updating ${functionSlug} on ${projectRef}...`);

    try {
        const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/functions/${functionSlug}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
            console.log('Update successful!');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.error(`Update failed with status ${res.status}`);
            console.error(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

update();
