// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkWikilink from './src/plugins/remark-wikilink/index.js';
import remarkTags from './src/plugins/remark-tags/index.js';
import remarkMarkHighlight from './src/plugins/remark-mark-highlight/index.js';
import remarkCallout from './src/plugins/remark-callout/index.js';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	// 画像最適化設定
	image: {
		// WebP形式を優先して配信
		experimentalLayout: 'responsive',
	},
	// Viteビルド設定
	vite: {
		build: {
			// CSS・JSのコード分割を有効化
			cssCodeSplit: true,
		},
	},
	integrations: [
		mdx({
			remarkPlugins: [
				// Wikilinkを最初に処理（GFMの前）
				[remarkWikilink, { priority: 'high' }],
				// ハイライト記法処理（セキュリティ強化設定）
				[remarkMarkHighlight, {
					accessibility: true,
					cache: true,
					securityMode: 'auto',
					maxInputLength: 100000
				}],
				// タグ処理プラグイン
				[remarkTags, { convertToLinks: true }],
				// コールアウトパース（データ属性を追加、CSSでスタイリング）
				[remarkCallout, { maxNestingDepth: 3 }]
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
			[remarkTags, { convertToLinks: true }],
			// コールアウトパース（データ属性を追加、CSSでスタイリング）
			[remarkCallout, { maxNestingDepth: 3 }]
		],
		// GFMを明示的に設定（remarkPluginsより前に処理される）
		gfm: true
	}
});
