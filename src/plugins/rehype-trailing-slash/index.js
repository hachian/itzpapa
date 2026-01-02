/**
 * rehype-trailing-slash
 *
 * 相対リンクに末尾スラッシュを追加するrehypeプラグイン
 * Obsidian形式のリンク（../xxx/index）をAstroのtrailingSlash: always設定に対応させる
 */

import { visit } from 'unist-util-visit';

export default function rehypeTrailingSlash() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			if (node.tagName !== 'a') return;

			const href = node.properties?.href;
			if (!href || typeof href !== 'string') return;

			// 外部リンク、アンカーのみ、mailto:、tel: などはスキップ
			if (
				href.startsWith('http://') ||
				href.startsWith('https://') ||
				href.startsWith('#') ||
				href.startsWith('mailto:') ||
				href.startsWith('tel:')
			) {
				return;
			}

			// フラグメント識別子を分離
			const hashIndex = href.indexOf('#');
			let path = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
			const fragment = hashIndex >= 0 ? href.slice(hashIndex) : '';

			// 空のパス（#のみ）はスキップ
			if (!path) return;

			// ファイル拡張子があるものはスキップ（画像、PDF等）
			const lastSegment = path.split('/').pop();
			if (lastSegment && lastSegment.includes('.') && !lastSegment.endsWith('.')) {
				// ただし、.html, .htm は末尾スラッシュ追加の対象外
				const ext = lastSegment.split('.').pop().toLowerCase();
				const skipExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'pdf', 'zip', 'html', 'htm'];
				if (skipExtensions.includes(ext)) {
					return;
				}
			}

			// 既に末尾スラッシュがある場合はスキップ
			if (path.endsWith('/')) return;

			// /index で終わる場合は index を削除（Obsidian互換）
			if (path.endsWith('/index')) {
				node.properties.href = path.slice(0, -5) + fragment;
				return;
			}

			// 末尾スラッシュを追加
			node.properties.href = path + '/' + fragment;
		});
	};
}
