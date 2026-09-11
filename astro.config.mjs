// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://emeraldblue.jp',
  integrations: [sitemap()],
  redirects: {
    '/1-1': '/upcycle/',
    '/1-2': '/creative/',
  },
});
