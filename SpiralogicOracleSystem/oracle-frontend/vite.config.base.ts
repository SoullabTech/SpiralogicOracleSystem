import react from '@vitejs/plugin-react';
import path from 'path';

export default function baseConfig(env: Record<string, string>) {
  const port = Number(env.VITE_PORT || 3000);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@lib': path.resolve(__dirname, 'src/lib'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@test-utils': path.resolve(__dirname, 'src/test-utils'),
      },
    },
    build: {
      sourcemap: false,
      outDir: 'dist',
      assetsDir: 'assets',
      target: 'esnext',
      minify: 'esbuild',
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            framer: ['framer-motion'],
            supabase: ['@supabase/supabase-js'],
            vendor: ['react-router-dom', 'classnames', 'zustand'],
          },
        },
      },
    },
    server: {
      port,
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 5173,
      open: true,
      headers: {
        'x-powered-by': 'Golden-Spiral-Portal',
      },
    },
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV ?? 'development'),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  };
}
