// frontend vite.config.ts
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: '.', // root at oracle-frontend folder
    plugins: [
      react(),
      tsconfigPaths({
        projects: [path.resolve(__dirname, 'tsconfig.json')],
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@api': path.resolve(__dirname, 'src/api'),
        '@app': path.resolve(__dirname, 'src/app'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@config': path.resolve(__dirname, 'src/config'),
        '@contexts': path.resolve(__dirname, 'src/contexts'), // Pick one and be consistent
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@layout': path.resolve(__dirname, 'src/layout'),
        '@lib': path.resolve(__dirname, 'src/lib'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@routes': path.resolve(__dirname, 'src/routes'),
        '@seeds': path.resolve(__dirname, 'src/seeds'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@test-utils': path.resolve(__dirname, 'src/test-utils'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@supabase': path.resolve(__dirname, 'src/supabase'),
        '@swisseph': path.resolve(__dirname, 'src/swisseph'),
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
