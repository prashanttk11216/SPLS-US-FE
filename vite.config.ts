import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      // Add other plugins if needed
    ],

    // Server configuration for development
    server: {
      port: 3000, // Custom port for dev server
      open: true, // Automatically open the browser
    },

    // Optimize build output for production
    build: {
      outDir: 'build',
      envFile: mode === 'production' ? '.env.production' : mode === 'development' ? '.env.development' : '.env.my-local', 
      sourcemap: mode === 'development', // Enable source maps in development
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Separate vendor chunks for better caching
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          },
        },
      },
    },
    
    // CSS Pre-processing and options
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "./src/styles/base/_variables.scss";` // Automatically include variables in SCSS
        },
      },
      modules: {
        localsConvention: 'camelCaseOnly', // Enforce camelCase for CSS Modules
      },
    },
  };
});
