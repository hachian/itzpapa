/**
 * astro-search-index
 * Astroビルド時にブログ記事から検索インデックスJSONを生成するインテグレーション
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { stripMarkdown } from '../../utils/search/strip-markdown.js';

/**
 * @typedef {Object} SearchIndexEntry
 * @property {string} slug - 記事のslug
 * @property {string} title - 記事タイトル
 * @property {string} body - プレーンテキスト化された本文
 */

/**
 * YYYYMMDD-プレフィックスを除去してslugを生成
 * @param {string} id - ファイル名/ID
 * @returns {string}
 */
function removeDatePrefix(id) {
  return id.replace(/^\d{8}-/, '');
}

/**
 * ブログディレクトリから記事を収集
 * @param {string} blogDir - ブログコンテンツディレクトリ
 * @returns {Promise<SearchIndexEntry[]>}
 */
export async function collectBlogPosts(blogDir) {
  const entries = [];

  try {
    const dirs = await fs.readdir(blogDir, { withFileTypes: true });

    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;

      const indexPath = path.join(blogDir, dir.name, 'index.md');

      try {
        const content = await fs.readFile(indexPath, 'utf-8');
        const { data: frontmatter, content: body } = matter(content);

        // draft記事はスキップ
        if (frontmatter.draft === true) {
          continue;
        }

        // タイトルがない場合はスキップ
        if (!frontmatter.title) {
          continue;
        }

        const slug = removeDatePrefix(dir.name);
        const plainBody = stripMarkdown(body);

        // 空の本文はスキップ
        if (!plainBody.trim()) {
          continue;
        }

        entries.push({
          slug,
          title: frontmatter.title,
          body: plainBody
        });
      } catch (error) {
        // index.mdが存在しない場合はスキップ
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  return entries;
}

/**
 * 検索インデックスJSONを生成
 * @param {SearchIndexEntry[]} entries - インデックスエントリ
 * @returns {string} - JSON文字列
 */
export function generateIndexJson(entries) {
  return JSON.stringify(entries, null, 0); // 圧縮形式
}

/**
 * Astroインテグレーション
 * @param {Object} options - オプション
 * @param {string} [options.outputPath] - 出力先パス（デフォルト: public/search-index.json）
 * @returns {import('astro').AstroIntegration}
 */
export function astroSearchIndex(options = {}) {
  const logger = options.logger || console;

  return {
    name: 'astro-search-index',
    hooks: {
      'astro:build:start': async () => {
        const rootDir = process.cwd();
        const blogDir = path.join(rootDir, 'src', 'content', 'blog');
        const outputPath = options.outputPath || path.join(rootDir, 'public', 'search-index.json');

        logger.info?.('[astro-search-index] Generating search index...');

        try {
          // 記事を収集
          const entries = await collectBlogPosts(blogDir);

          if (entries.length === 0) {
            logger.warn?.('[astro-search-index] No blog posts found');
            return;
          }

          // JSONを生成
          const json = generateIndexJson(entries);

          // ファイルを出力
          await fs.mkdir(path.dirname(outputPath), { recursive: true });
          await fs.writeFile(outputPath, json, 'utf-8');

          logger.info?.(`[astro-search-index] Generated index with ${entries.length} entries`);
        } catch (error) {
          logger.error?.(`[astro-search-index] Failed to generate index: ${error.message}`);
          throw error;
        }
      }
    }
  };
}

export default astroSearchIndex;
