// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkWikilink from './src/plugins/remark-wikilink/index.js';
import rehypeCallout from './src/plugins/rehype-callout/index.js';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [
		mdx({
			remarkPlugins: [
				// Wikilinkを最初に処理（GFMの前）
				[remarkWikilink, { priority: 'high' }]
			],
			rehypePlugins: [
				// Calloutを処理（remarkプラグインの後）
				rehypeCallout
			],
			extendMarkdownConfig: true
		}), 
		sitemap()
	],
	markdown: {
		remarkPlugins: [
			// Wikilinkを最初に処理（GFMの前）
			[remarkWikilink, { priority: 'high' }]
		],
		rehypePlugins: [
			// Calloutをrehypeステージで処理
			rehypeCallout
		],
		// GFMを最後に処理して干渉を回避
		gfm: true
	}
});
