// API Configuration
// Automatically uses environment variable or falls back to localhost for development

// Get the API URL from environment or use localhost in development
const getApiUrl = () => {
  // If we have an environment variable, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In development (localhost), default to local backend
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }
  
  // In production without env var, throw clear error
  throw new Error(
    '❌ BACKEND NOT CONFIGURED!\n\n' +
    'Please set NEXT_PUBLIC_API_URL environment variable in Vercel.\n' +
    'Deploy your backend to Render first, then add the URL to Vercel settings.\n\n' +
    'See RENDER_DEPLOYMENT.md for instructions.'
  );
};

export const API_URL = getApiUrl();

if (typeof window !== 'undefined') {
  console.log('[API Config] Using backend:', API_URL);
}

