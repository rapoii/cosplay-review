// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],

  // Warm internal routes while their nav links are visible so ClientRouter can start immediately.
  prefetch: {
    defaultStrategy: 'viewport',
    prefetchAll: false
  },

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true
    }
  }
});