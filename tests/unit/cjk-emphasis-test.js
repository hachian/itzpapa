/**
 * CJK Emphasis Unit Test Suite
 *
 * Tests the remark-cjk-friendly plugin integration with emphasis syntax
 * Covers: CJK brackets + emphasis, nested structures, edge cases
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { remark } from 'remark';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkMarkHighlight from '../../src/plugins/remark-mark-highlight/index.js';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

// Helper: Process markdown with CJK-friendly and convert to HTML
async function processToHtml(markdown, options = {}) {
	const processor = unified()
		.use(remarkParse)
		.use(remarkCjkFriendly)
		.use(remarkMarkHighlight, { accessibility: true, cache: true, securityMode: 'auto' })
		.use(remarkRehype)
		.use(rehypeStringify);
	const result = await processor.process(markdown);
	return String(result);
}

// Helper: Process markdown with CJK-friendly to AST
async function processToAst(markdown) {
	const processor = remark().use(remarkCjkFriendly);
	return processor.runSync(processor.parse(markdown));
}

// Helper: Find emphasis nodes in AST
function findEmphasisNodes(ast) {
	const results = [];
	function walk(node) {
		if (node.type === 'emphasis') {
			results.push(node);
		}
		if (node.children) {
			for (const child of node.children) {
				walk(child);
			}
		}
	}
	walk(ast);
	return results;
}

// Helper: Find strong nodes in AST
function findStrongNodes(ast) {
	const results = [];
	function walk(node) {
		if (node.type === 'strong') {
			results.push(node);
		}
		if (node.children) {
			for (const child of node.children) {
				walk(child);
			}
		}
	}
	walk(ast);
	return results;
}

// Helper: Get text content from node
function getTextContent(node) {
	if (node.type === 'text') {
		return node.value;
	}
	if (node.children) {
		return node.children.map(getTextContent).join('');
	}
	return '';
}

describe('CJK Emphasis with remark-cjk-friendly', () => {

	// ============================================================
	// Requirement 5.1: 必須テストケース
	// ============================================================
	describe('Required Test Cases (Req 5.1)', () => {
		test('*【注意】* renders as italic', async () => {
			const input = '*【注意】*マーク';
			const html = await processToHtml(input);
			assert(html.includes('<em>【注意】</em>'), `Expected <em>【注意】</em> in: ${html}`);
		});

		test('*〈参考〉* renders as italic', async () => {
			const input = '*〈参考〉*情報';
			const html = await processToHtml(input);
			assert(html.includes('<em>〈参考〉</em>'), `Expected <em>〈参考〉</em> in: ${html}`);
		});

		test('==*（ハイライト内強調）*== renders as highlight + italic', async () => {
			const input = '==*（ハイライト内強調）*==';
			const html = await processToHtml(input);
			// マークハイライトとイタリックの両方が適用される
			assert(html.includes('<mark'), `Expected <mark> element in: ${html}`);
			assert(html.includes('<em>'), `Expected <em> element in: ${html}`);
		});
	});

	// ============================================================
	// Requirement 5.2: CJK括弧全種のテスト
	// ============================================================
	describe('CJK Bracket Types (Req 5.2)', () => {
		const bracketPairs = [
			{ name: '全角括弧', open: '（', close: '）' },
			{ name: '鉤括弧', open: '「', close: '」' },
			{ name: '二重鉤括弧', open: '『', close: '』' },
			{ name: '隅付き括弧', open: '【', close: '】' },
			{ name: '山括弧', open: '〈', close: '〉' },
			{ name: '二重山括弧', open: '《', close: '》' },
			{ name: '亀甲括弧', open: '〔', close: '〕' },
			{ name: '全角角括弧', open: '［', close: '］' },
			{ name: '全角波括弧', open: '｛', close: '｝' },
		];

		for (const bracket of bracketPairs) {
			test(`${bracket.name} with italic: *${bracket.open}テスト${bracket.close}*`, async () => {
				const input = `*${bracket.open}テスト${bracket.close}*`;
				const ast = await processToAst(input);
				const emphasisNodes = findEmphasisNodes(ast);
				assert(emphasisNodes.length > 0, `Expected emphasis node for ${bracket.name}`);
				const text = getTextContent(emphasisNodes[0]);
				assert(text.includes('テスト'), `Expected text content with ${bracket.name}`);
			});

			test(`${bracket.name} with bold: **${bracket.open}テスト${bracket.close}**`, async () => {
				const input = `**${bracket.open}テスト${bracket.close}**`;
				const ast = await processToAst(input);
				const strongNodes = findStrongNodes(ast);
				assert(strongNodes.length > 0, `Expected strong node for ${bracket.name}`);
				const text = getTextContent(strongNodes[0]);
				assert(text.includes('テスト'), `Expected text content with ${bracket.name}`);
			});
		}
	});

	// ============================================================
	// Requirement 5.3: 入れ子構造パターンのテスト
	// ============================================================
	describe('Nested Patterns (Req 5.3)', () => {
		test('bold with full-width parentheses: **（太字）**', async () => {
			const input = '**（太字）**';
			const html = await processToHtml(input);
			assert(html.includes('<strong>'), `Expected <strong> in: ${html}`);
			assert(html.includes('太字'), `Expected 太字 in: ${html}`);
		});

		test('bold + italic combination: ***（太字斜体）***', async () => {
			const input = '***（太字斜体）***';
			const html = await processToHtml(input);
			assert(html.includes('<strong>'), `Expected <strong> in: ${html}`);
			assert(html.includes('<em>'), `Expected <em> in: ${html}`);
		});

		test('highlight with italic inside: ==*（テキスト）*==', async () => {
			const input = '==*（テキスト）*==';
			const html = await processToHtml(input);
			assert(html.includes('<mark'), `Expected <mark> in: ${html}`);
			assert(html.includes('<em>'), `Expected <em> in: ${html}`);
		});

		test('malformed nested structure falls back gracefully', async () => {
			const input = '*【開かない**';
			const html = await processToHtml(input);
			// 不正な構造は元のテキストとして表示される（静かに失敗）
			assert(html, 'Should produce valid HTML even with malformed input');
		});
	});

	// ============================================================
	// Requirement 5.4: エッジケースのテスト
	// ============================================================
	describe('Edge Cases (Req 5.4)', () => {
		test('empty brackets: *【】*', async () => {
			const input = '*【】*';
			const ast = await processToAst(input);
			const emphasisNodes = findEmphasisNodes(ast);
			assert(emphasisNodes.length > 0, 'Should handle empty brackets');
		});

		test('brackets only: **「」**', async () => {
			const input = '**「」**';
			const ast = await processToAst(input);
			const strongNodes = findStrongNodes(ast);
			assert(strongNodes.length > 0, 'Should handle brackets only');
		});

		test('escaped asterisk with CJK: \\*【注意】\\*', async () => {
			const input = '\\*【注意】\\*';
			const ast = await processToAst(input);
			const emphasisNodes = findEmphasisNodes(ast);
			// エスケープされた場合は強調されない
			assert.strictEqual(emphasisNodes.length, 0, 'Should not create emphasis for escaped markers');
		});

		test('mixed ASCII and CJK brackets', async () => {
			const input = '*（text）* and *[text]*';
			const ast = await processToAst(input);
			const emphasisNodes = findEmphasisNodes(ast);
			// 両方の括弧タイプで動作すること
			assert(emphasisNodes.length >= 2, 'Should handle both bracket types');
		});
	});

	// ============================================================
	// Requirement 3.4: ASCII括弧との互換性確認
	// ============================================================
	describe('ASCII Bracket Compatibility (Req 3.4)', () => {
		test('half-width parentheses work normally: *(text)*', async () => {
			const input = '*(text)*';
			const ast = await processToAst(input);
			const emphasisNodes = findEmphasisNodes(ast);
			assert(emphasisNodes.length > 0, 'Should handle ASCII parentheses');
		});

		test('half-width square brackets work normally: *[text]*', async () => {
			const input = '*[text]*';
			const ast = await processToAst(input);
			const emphasisNodes = findEmphasisNodes(ast);
			assert(emphasisNodes.length > 0, 'Should handle ASCII square brackets');
		});

		test('half-width curly braces work normally: *{text}*', async () => {
			const input = '*{text}*';
			const ast = await processToAst(input);
			const emphasisNodes = findEmphasisNodes(ast);
			assert(emphasisNodes.length > 0, 'Should handle ASCII curly braces');
		});
	});

	// ============================================================
	// HTML出力検証
	// ============================================================
	describe('HTML Output Verification', () => {
		test('CJK italic produces <em> element', async () => {
			const input = '*「重要」*';
			const html = await processToHtml(input);
			assert(html.includes('<em>「重要」</em>'), `Expected <em>「重要」</em> in: ${html}`);
		});

		test('CJK bold produces <strong> element', async () => {
			const input = '**『注目』**';
			const html = await processToHtml(input);
			assert(html.includes('<strong>『注目』</strong>'), `Expected <strong>『注目』</strong> in: ${html}`);
		});

		test('combined text with multiple CJK emphasis', async () => {
			const input = 'これは*【重要】*な情報と**『注意』**です。';
			const html = await processToHtml(input);
			assert(html.includes('<em>【重要】</em>'), 'Should have italic');
			assert(html.includes('<strong>『注意』</strong>'), 'Should have bold');
		});
	});
});

console.log('🧪 Running CJK Emphasis Unit Tests...');
