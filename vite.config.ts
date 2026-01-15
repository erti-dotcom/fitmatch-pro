import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Lädt Umgebungsvariablen (lokal aus .env oder vom Vercel Server)
  // Fix: Cast process to any to resolve TS error "Property 'cwd' does not exist on type 'Process'"
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
    },
    define: {
      // Dies sorgt dafür, dass 'process.env.API_KEY' im Browser Code verfügbar ist
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env': {} // Fallback um Crashes zu vermeiden
    }
  };
});