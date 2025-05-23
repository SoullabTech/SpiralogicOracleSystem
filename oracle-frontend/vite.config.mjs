// oracle-frontend/vite.config.mjs
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: '.', // now inside oracle-frontend folder
    plugins: [
      react(),
      tsconfigPaths({
        projects: [resolve(__dirname, 'tsconfig.json')],
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
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
      port: 3000,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV ?? 'development'),
    },
  };
});
