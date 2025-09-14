// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkWikilink from './src/plugins/remark-wikilink/index.js';
import remarkTags from './src/plugins/remark-tags/index.js';
import remarkMarkHighlight from './src/plugins/remark-mark-highlight/index.js';
import rehypeCallouts from 'rehype-callouts';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [
		mdx({
			remarkPlugins: [
				// Wikilinkを次に処理（GFMの前）
				[remarkWikilink, { priority: 'high' }],
				// ハイライト記法処理（セキュリティ強化設定）
				[remarkMarkHighlight, {
					accessibility: true,
					cache: true,
					securityMode: 'auto',
					maxInputLength: 100000
				}],
				// タグ処理プラグイン
				[remarkTags, { convertToLinks: true }]
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
			// Wikilinkを最初に処理（最高優先度）
			[remarkWikilink, { priority: 'high' }],
			// GFM処理後にハイライト記法とタグを処理（セキュリティ強化設定）
			[remarkMarkHighlight, {
				accessibility: true,
				cache: true,
				securityMode: 'auto',
				maxInputLength: 100000
			}],
			[remarkTags, { convertToLinks: true }]
		],
		rehypePlugins: [
			// Callouts処理（remarkの後でHTMLを処理）
			[rehypeCallouts, { theme: 'obsidian' }]
		],
		// GFMを明示的に設定（remarkPluginsより前に処理される）
		gfm: true
	}
});
