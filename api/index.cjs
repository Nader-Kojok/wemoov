// Import the CommonJS backend
const app = require('../backend/dist/index.js');

// Export the Express app for Vercel
module.exports = app;