// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkWikilink from './src/plugins/remark-wikilink/index.js';
import remarkMarkHighlight from './src/plugins/remark-mark-highlight/index.js';
import remarkTags from './src/plugins/remark-tags/index.js';
import rehypeCallouts from 'rehype-callouts';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [
		mdx({
			remarkPlugins: [
				// マークハイライトを最初に処理（最優先）
				remarkMarkHighlight,
				// Wikilinkを次に処理（GFMの前）
				[remarkWikilink, { priority: 'high' }],
				// タグ処理プラグイン
				[remarkTags, { convertToLinks: false }]
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
			// マークハイライトを最初に処理（最優先）
			remarkMarkHighlight,
			// Wikilinkを次に処理（GFMの前）
			[remarkWikilink, { priority: 'high' }],
			// タグ処理プラグイン
			[remarkTags, { convertToLinks: false }]
		],
		rehypePlugins: [
			// Callouts処理（remarkの後でHTMLを処理）
			[rehypeCallouts, { theme: 'obsidian' }]
		],
		// GFMを明示的に設定して順序を制御
		gfm: true
	}
});
