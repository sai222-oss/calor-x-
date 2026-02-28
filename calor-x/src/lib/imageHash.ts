/**
 * Generate a perceptual hash for an image
 * Uses a simplified approach: resize to 8x8, convert to grayscale, calculate hash
 */
export async function generateImageHash(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Create canvas for image processing
        const canvas = document.createElement('canvas');
        const size = 8; // 8x8 grid for hash
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, size, size);
        
        // Get pixel data
        const imageData = ctx.getImageData(0, 0, size, size);
        const pixels = imageData.data;
        
        // Convert to grayscale and calculate average
        const grayscale: number[] = [];
        let sum = 0;
        
        for (let i = 0; i < pixels.length; i += 4) {
          const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
          grayscale.push(gray);
          sum += gray;
        }
        
        const avg = sum / grayscale.length;
        
        // Generate hash: 1 if pixel > average, 0 otherwise
        let hash = '';
        for (let i = 0; i < grayscale.length; i++) {
          hash += grayscale[i] > avg ? '1' : '0';
        }
        
        // Convert binary to hex
        const hexHash = parseInt(hash, 2).toString(16).padStart(16, '0');
        resolve(hexHash);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Calculate similarity between two hashes (Hamming distance)
 * Returns a value between 0 (completely different) and 1 (identical)
 */
export function calculateSimilarity(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return 0;
  
  let differences = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) differences++;
  }
  
  const maxDifferences = hash1.length;
  return 1 - (differences / maxDifferences);
}
