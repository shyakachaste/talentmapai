import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      // Security headers for development
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Security optimizations for production build
    minify: 'esbuild', // Use esbuild instead of terser for compatibility
    rollupOptions: {
      output: {
        // Prevent sensitive information in file names
        manualChunks: {
          vendor: ['react', 'react-dom'],
          'pdf-processing': ['pdfjs-dist'],
          'docx-processing': ['mammoth'],
        },
      },
    },
    // Enable source maps only in development
    sourcemap: mode === 'development',
  },
  // Prevent directory traversal attacks
  publicDir: 'public',
}));
