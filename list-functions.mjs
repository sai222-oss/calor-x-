const token = 'sbp_977200b8183996687048ac0ec26ff97249ff7834';
const projectRef = 'lurcmwqvgjfsfzsmvkne';

async function listFunctions() {
    try {
        const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/functions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        console.log('Functions List:');
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Failed to list functions:', error);
    }
}

listFunctions();
