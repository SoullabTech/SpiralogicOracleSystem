// vite.config.ts
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: 'oracle-frontend', // important!
    plugins: [
      react(),
      tsconfigPaths({
        projects: [path.resolve(__dirname, 'oracle-frontend/tsconfig.json')],
      }),
    ],
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV ?? 'development'),
    },
    build: {
      outDir: path.resolve(__dirname, 'oracle-frontend/dist'),
      sourcemap: false,
    },
    server: {
      port: 3000,
    }
  };
});
