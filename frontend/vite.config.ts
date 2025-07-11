import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: { plugins: ['@emotion/babel-plugin'] },
      }),
      tailwindcss(),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    server: {
      port: 3000,
      hmr: {
        overlay: false
      },
      proxy: {
        '/api': {
          target: env.VITE_API_GATEWAY_URL || 'http://localhost:7000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react','react-dom','react-router-dom'],
            mui: ['@mui/material','@mui/icons-material','@emotion/react','@emotion/styled'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: [
        'react','react-dom','react-router-dom',
        '@mui/material','@emotion/react','@emotion/styled',
        '@reduxjs/toolkit',
      ],
    },
  }
});
