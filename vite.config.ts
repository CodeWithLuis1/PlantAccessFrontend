import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
    , tailwindcss(),
      tsconfigPaths()
  ],
  test: {
    // Use jsdom so browser globals (window, document) are available in tests
    environment: 'jsdom',
    // Automatically import @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
  },
})
