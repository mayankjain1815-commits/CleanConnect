import Pocketbase from 'pocketbase';

// Hostinger serves PocketBase under /hcgi/platform. For local development,
// set VITE_POCKETBASE_URL (see .env.development) to point at the local server.
const POCKETBASE_API_URL = import.meta.env.VITE_POCKETBASE_URL || '/hcgi/platform';

const pocketbaseClient = new Pocketbase(POCKETBASE_API_URL);

export default pocketbaseClient;

export { pocketbaseClient };
