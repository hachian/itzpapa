// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkWikilink from './src/plugins/remark-wikilink/index.js';
import rehypeCallouts from 'rehype-callouts';

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
				// Callouts処理（remarkの後でHTMLを処理）
				[rehypeCallouts, { theme: 'obsidian' }]
			],
			extendMarkdownConfig: false
		}), 
		sitemap()
	],
	markdown: {
		remarkPlugins: [
			// Wikilinkを最初に処理（GFMの前）
			[remarkWikilink, { priority: 'high' }]
		],
		rehypePlugins: [
			// Callouts処理（remarkの後でHTMLを処理）
			[rehypeCallouts, { theme: 'obsidian' }]
		],
		// GFMを明示的に設定して順序を制御
		gfm: true
	}
});
