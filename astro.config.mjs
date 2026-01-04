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
import rehypeTrailingSlash from './src/plugins/rehype-trailing-slash/index.js';
import astroImageHosting from './src/integrations/image-hosting/index.js';
import { siteConfig } from './site.config.ts';

// 画像外部ホスティング設定
// site.config.tsの設定と環境変数をマージ
// 有効化するには.envでIMAGE_HOSTING_ENABLEDをtrueに設定
const imageHostingConfig = {
	// 環境変数から読み込む設定（機密情報・環境依存）
	enabled: process.env.IMAGE_HOSTING_ENABLED === 'true',
	provider: process.env.IMAGE_HOSTING_PROVIDER || 'S3',
	baseUrl: process.env.IMAGE_HOST_URL || '',
	bucket: process.env.IMAGE_HOSTING_BUCKET || '',
	region: process.env.AWS_REGION || 'ap-northeast-1',
	accountId: process.env.R2_ACCOUNT_ID || '',
	// site.config.tsから読み込む設定（プロジェクト共通）
	...siteConfig.imageHosting
};

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
		// 画像外部ホスティングインテグレーション（ビルド後にS3/R2にアップロード）
		astroImageHosting({ config: imageHostingConfig }),
		mdx({
			remarkPlugins: [
				// Wikilinkを最初に処理（GFMの前）
				[remarkWikilink, { priority: 'high' }],
				// コールアウトパース（remarkBreaksより前に処理して、ヘッダー行の改行が<br>にならないようにする）
				[remarkCallout, { maxNestingDepth: 3 }],
				// 単一改行を<br>に変換（コールアウト処理後に実行）
				remarkBreaks,
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
				[remarkTags, { convertToLinks: true }]
			],
			rehypePlugins: [
				// テーブルをdiv.table-wrapperでラップ（水平スクロール対応）
				rehypeTableWrapper,
				// GFMのcheckbox要素をカスタムスタイルに置き換え
				rehypeTaskStatus,
				// 相対リンクに末尾スラッシュを追加（Obsidian互換）
				rehypeTrailingSlash
			],
			extendMarkdownConfig: false
		}),
		sitemap()
	],
	markdown: {
		remarkPlugins: [
			// Wikilinkを最初に処理（最高優先度）
			[remarkWikilink, { priority: 'high' }],
			// コールアウトパース（remarkBreaksより前に処理して、ヘッダー行の改行が<br>にならないようにする）
			[remarkCallout, { maxNestingDepth: 3 }],
			// 単一改行を<br>に変換（コールアウト処理後に実行）
			remarkBreaks,
			// タスクステータス処理（Obsidian形式）
			remarkTaskStatus,
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
			// テーブルをdiv.table-wrapperでラップ（水平スクロール対応）
			rehypeTableWrapper,
			// GFMのcheckbox要素をカスタムスタイルに置き換え
			rehypeTaskStatus,
			// 相対リンクに末尾スラッシュを追加（Obsidian互換）
			rehypeTrailingSlash
		],
		// GFMを明示的に設定（remarkPluginsより前に処理される）
		gfm: true
	}
});
