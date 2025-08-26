// Import the compiled CommonJS backend using dynamic import
const getApp = async () => {
  const backend = await import('../backend/dist/index.js');
  const app = backend.default || backend;
  // Ensure we have a callable Express app
  if (typeof app === 'function') {
    return app;
  }
  throw new Error('Backend module does not export a callable Express app');
};

// Export the Express app for Vercel
export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error('Error loading backend app:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}