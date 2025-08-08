// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkWikilink from './src/plugins/remark-wikilink/index.js';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [
		mdx({
			remarkPlugins: [remarkWikilink]
		}), 
		sitemap()
	],
	markdown: {
		remarkPlugins: [remarkWikilink]
	}
});
