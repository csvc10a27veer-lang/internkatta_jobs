import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  const proxyTarget = env.VITE_API_PROXY_TARGET || env.VITE_API_BASE_URL || 'http://localhost:4000';
  // Log resolved proxy target to aid local debugging when proxies fail
  // This prints when Vite starts so you can confirm the backend target
  // and troubleshoot ECONNREFUSED errors.
  // eslint-disable-next-line no-console
  console.log('[vite] Resolved API proxy target:', proxyTarget);

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],

    // Development configuration
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Production build configuration
    build: {
      outDir: 'dist',
      sourcemap: false, // Disable sourcemaps in production
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
          },
          assetFileNames: (assetInfo) => {
            // Keep assets in their original folder structure
            if (assetInfo.name && assetInfo.name.match(/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i)) {
              return 'assets/[name].[ext]';
            }
            return 'assets/[name]-[hash].[ext]';
          },
        },
      },
      // Copy assets to the correct location
      assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
    },

    // Environment variables
    define: {
      __DEV__: JSON.stringify(isDev),
    },
    
    // Drop console logs in production to prevent leaking sensitive information
    esbuild: {
      drop: isDev ? [] : ['console', 'debugger'],
    },
  };
})
