// Config updated: 2025-12-10-v2
// Note: Type checking disabled for this file due to remark plugin type complexity

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkBreaks from 'remark-breaks';
import remarkWikilink from './src/plugins/remark-wikilink/index.js';
import remarkTaskStatus from './src/plugins/remark-task-status/index.js';
import remarkTags from './src/plugins/remark-tags/index.js';
import remarkMarkHighlight from './src/plugins/remark-mark-highlight/index.js';
import remarkCallout from './src/plugins/remark-callout/index.js';
import rehypeTableWrapper from './src/plugins/rehype-table-wrapper/index.js';
import rehypeTaskStatus from './src/plugins/rehype-task-status/index.js';

// https://astro.build/config
export default defineConfig({
	site: 'https://itzpapa.hachian.com',
	// URL末尾スラッシュを統一（canonical URLとの整合性確保）
	trailingSlash: 'always',
	// 画像最適化はAstro標準の設定を使用
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
				// 単一改行を<br>に変換
				remarkBreaks,
				// Wikilinkを最初に処理（GFMの前）
				[remarkWikilink, { priority: 'high' }],
				// タスクステータス処理（Obsidian形式）
				remarkTaskStatus,
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
			rehypePlugins: [
				// テーブルをdiv.table-wrapperでラップ（水平スクロール対応）
				rehypeTableWrapper,
				// GFMのcheckbox要素をカスタムスタイルに置き換え
				rehypeTaskStatus
			],
			extendMarkdownConfig: false
		}),
		sitemap()
	],
	markdown: {
		remarkPlugins: [
			// 単一改行を<br>に変換
			remarkBreaks,
			// Wikilinkを最初に処理（最高優先度）
			[remarkWikilink, { priority: 'high' }],
			// タスクステータス処理（Obsidian形式）
			remarkTaskStatus,
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
		rehypePlugins: [
			// テーブルをdiv.table-wrapperでラップ（水平スクロール対応）
			rehypeTableWrapper,
			// GFMのcheckbox要素をカスタムスタイルに置き換え
			rehypeTaskStatus
		],
		// GFMを明示的に設定（remarkPluginsより前に処理される）
		gfm: true
	}
});
