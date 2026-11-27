import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function webmasterVerificationPlugin(): Plugin {
  return {
    name: 'flyorago-webmaster-verification',
    transformIndexHtml(html) {
      const tags: string[] = [];
      const gscToken = process.env.VITE_GSC_VERIFICATION;
      const bingToken = process.env.VITE_BING_VERIFICATION;
      if (gscToken) {
        tags.push(`<meta name="google-site-verification" content="${gscToken}" />`);
      }
      if (bingToken) {
        tags.push(`<meta name="msvalidate.01" content="${bingToken}" />`);
      }
      if (tags.length === 0) return html;
      return html.replace('</head>', `    ${tags.join('\n    ')}\n  </head>`);
    },
  };
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), webmasterVerificationPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: isSsrBuild
    ? undefined
    : {
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'icons-vendor': ['lucide-react'],
              'oauth-vendor': ['@react-oauth/google'],
            },
          },
        },
      },
  server: {
    port: 5173,
    host: '0.0.0.0',
    watch: {
      usePolling: true,
      interval: 100,
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
}));
