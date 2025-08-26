// Import the compiled CommonJS backend using dynamic import
const getApp = async () => {
  const backend = await import('../backend/dist/index.js');
  return backend.default || backend;
};

// Export the Express app for Vercel
export default async function handler(req: any, res: any) {
  const app = await getApp();
  return app(req, res);
}