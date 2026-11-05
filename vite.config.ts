import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      presets: [reactCompilerPreset()],
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
})
