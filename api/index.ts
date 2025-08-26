import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import the compiled CommonJS backend
const app = require('../backend/dist/index.js').default || require('../backend/dist/index.js');

// Export the Express app directly - Vercel handles the conversion
export default app;