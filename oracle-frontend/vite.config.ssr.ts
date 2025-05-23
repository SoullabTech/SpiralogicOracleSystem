// vite.config.ssr.ts
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const port = Number(env.VITE_PORT) || 3000;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@lib': path.resolve(__dirname, 'src/lib'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@test-utils': path.resolve(__dirname, 'src/test-utils'),
        '@context': path.resolve(__dirname, 'src/context'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@types': path.resolve(__dirname, 'src/types'),
        react: path.resolve('./node_modules/react'),
      },
    },
    ssr: {
      noExternal: [
        '@supabase/supabase-js',
        'framer-motion',
        'react-router-dom',
        'zustand',
      ],
    },
    server: {
      port,
    },
    build: {
      target: 'esnext',
      ssr: true,
      outDir: 'dist-ssr',
      rollupOptions: {
        input: './src/entry-server.tsx',
        output: {
          format: 'cjs',
        },
      },
    },
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV ?? 'development'),
    },
  };
});
