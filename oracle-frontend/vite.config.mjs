// frontend/vite.config.mjs
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';  // Plugin to handle tsconfig path aliases
import { defineConfig, loadEnv } from 'vite'; // Vite helpers
import { fileURLToPath } from 'url'; // URL utilities
import { dirname, resolve } from 'path'; // Path utilities

// Calculate the file and directory name for ESM usage
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // Load environment variables based on mode (development, production)

  return {
    root: '.', // Ensure this points to the root of your project (oracle-frontend folder)
    plugins: [
      react(),  // React plugin for Vite
      tsconfigPaths({
        projects: [resolve(__dirname, 'tsconfig.json')], // Points to your tsconfig.json file for alias resolution
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'), // Resolves '@' to 'src' directory
        '@components': resolve(__dirname, 'src/components'),
        '@lib': resolve(__dirname, 'src/lib'),
        '@services': resolve(__dirname, 'src/services'),
        '@test-utils': resolve(__dirname, 'src/test-utils'),
        '@contexts': resolve(__dirname, 'src/contexts'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@routes': resolve(__dirname, 'src/routes'),
        '@styles': resolve(__dirname, 'src/styles'),
      },
    },
    server: {
      port: 3000, // Port for your development server
    },
    build: {
      outDir: 'dist', // Output directory for the build
      sourcemap: false, // Disable sourcemaps for production
    },
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV ?? 'development'), // Define environment variable for the app
    },
  };
});
