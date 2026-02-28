export function calculateHammingDistance(hash1: string, hash2: string): number {
  if (!hash1 || !hash2) return 1000;
  if (hash1.length !== hash2.length) return 1000; // Invalid comparison

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

export function parseAIResponse(aiResponse: string): any {
  // Try direct JSON first
  try {
    return JSON.parse(aiResponse);
  } catch (e) {
    // Fallback: extract json from markdown fences
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/```\n([\s\S]*?)\n```/);
    const candidate = jsonMatch ? jsonMatch[1] : aiResponse;
    return JSON.parse(candidate);
  }
}
