// dry_run_test.ts
// Lightweight dry-run harness for `analyze-food` logic.
// Run with Deno: deno run --allow-read dry_run_test.ts

// Copied simplified Hamming function from the function file
function calculateHammingDistance(hash1: string, hash2: string): number {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 1000;
  let diff = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      const val1 = parseInt(hash1[i], 16);
      const val2 = parseInt(hash2[i], 16);
      let xor = val1 ^ val2;
      while (xor > 0) {
        diff += xor & 1;
        xor >>= 1;
      }
    }
  }
  return diff;
}

// Simulate cached results
const cachedResults = [
  { id: 'a1', image_hash: 'abcdef0123456789', created_at: '2025-01-01' },
  { id: 'b2', image_hash: 'abcdef0123456799', created_at: '2025-01-02' },
  { id: 'c3', image_hash: 'ffffffffffffffff', created_at: '2025-01-03' },
];

const inputHash = 'abcdef0123456789';
const normalizedInput = inputHash.trim().toLowerCase();

console.log('Testing fuzzy matching...');
let bestMatch = null;
let minDistance = 1000;
const SIMILARITY_THRESHOLD = 5;
for (const r of cachedResults) {
  const stored = (r.image_hash || '').trim().toLowerCase();
  const d = calculateHammingDistance(normalizedInput, stored);
  console.log(`Compare to ${r.id} (${stored}) => distance = ${d}`);
  if (d < minDistance) {
    minDistance = d;
    bestMatch = r;
  }
}
if (bestMatch && minDistance <= SIMILARITY_THRESHOLD) {
  console.log('Found cached match:', bestMatch.id, 'distance', minDistance);
} else {
  console.log('No sufficiently similar cached match found. minDistance =', minDistance);
}

// Test AI parsing fallbacks
console.log('\nTesting AI response parsing fallbacks...');

const rawJson = `{"dish_label":"Shawarma","confidence":0.92}`;
const fencedJson = "```json\n{\"dish_label\":\"Hummus\",\"confidence\":0.88}\n```";
const messyResponse = 'Some text\n```\n{"dish_label":"Falafel","confidence":0.80}\n```\nFooter';

function parseAIResponse(aiResponse: string) {
  try {
    return JSON.parse(aiResponse);
  } catch (e) {
    const jsonMatch = aiResponse.match(/```json\\n([\\s\\S]*?)\\n```/) || aiResponse.match(/```\\n([\\s\\S]*?)\\n```/);
    const candidate = jsonMatch ? jsonMatch[1] : aiResponse;
    return JSON.parse(candidate);
  }
}

for (const sample of [rawJson, fencedJson, messyResponse]) {
  try {
    const parsed = parseAIResponse(sample);
    console.log('Parsed:', parsed);
  } catch (err) {
    console.error('Failed to parse sample:', sample, 'error:', err.message);
  }
}

console.log('\nDry-run complete.');
