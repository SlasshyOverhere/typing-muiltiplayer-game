// API Configuration
// Automatically uses environment variable or falls back to localhost for development

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

if (typeof window !== 'undefined') {
  console.log('[API Config] Using backend:', API_URL);
}

