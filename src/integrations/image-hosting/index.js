/**
 * astro-image-hosting
 * Astroビルド完了後に画像をS3/R2にアップロードし、HTMLを書き換え、distから画像を削除するインテグレーション
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { loadConfig, loadCredentials, validateConfig } from './config.js';
import { createS3Client, createUploadService } from './s3-upload-service.js';

/**
 * @typedef {Object} ImageInfo
 * @property {string} filePath - ファイルの絶対パス
 * @property {string} relativePath - distからの相対パス
 * @property {string} fileName - ファイル名
 * @property {string} key - S3キー
 */

/**
 * @typedef {Object} AstroImageHostingOptions
 * @property {Partial<import('./config.js').ImageHostingConfig>} config
 * @property {Object} [logger] - ロガーオブジェクト
 */

/**
 * 画像ファイルのContent-Typeを取得
 * @param {string} fileName
 * @returns {string}
 */
function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const contentTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.avif': 'image/avif'
  };
  return contentTypes[ext] || 'application/octet-stream';
}

/**
 * ファイルのMD5ハッシュを計算
 * @param {Buffer} content
 * @returns {string}
 */
function calculateMD5(content) {
  return createHash('md5').update(content).digest('hex');
}

/**
 * globパターンのシンプルなマッチング
 * @param {string} pattern - globパターン
 * @param {string} filePath - ファイルパス
 * @returns {boolean}
 */
function matchGlob(pattern, filePath) {
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '<<<DOUBLESTAR>>>')
    .replace(/\*/g, '[^/]*')
    .replace(/<<<DOUBLESTAR>>>/g, '.*')
    .replace(/\{([^}]+)\}/g, (_, group) => `(${group.split(',').join('|')})`);

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
}

/**
 * ディレクトリを再帰的に走査してファイルを収集
 * @param {string} dir - ディレクトリパス
 * @param {string} baseDir - ベースディレクトリ（相対パス計算用）
 * @returns {Promise<string[]>}
 */
async function walkDir(dir, baseDir) {
  const files = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await walkDir(fullPath, baseDir));
      } else {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // ディレクトリが存在しない場合は空配列を返す
    if (error.code !== 'ENOENT') throw error;
  }
  return files;
}

/**
 * distディレクトリから画像ファイルを収集
 * @param {string} distDir - distディレクトリのパス
 * @param {{ include: string[], exclude: string[] }} patterns - include/excludeパターン
 * @returns {Promise<ImageInfo[]>}
 */
export async function collectImages(distDir, patterns) {
  const allFiles = await walkDir(distDir, distDir);
  const images = [];

  for (const filePath of allFiles) {
    const relativePath = path.relative(distDir, filePath);

    // includeパターンにマッチするかチェック
    const matchesInclude = patterns.include.some(pattern => matchGlob(pattern, relativePath));
    if (!matchesInclude) continue;

    // excludeパターンにマッチする場合はスキップ
    const matchesExclude = patterns.exclude.some(pattern => matchGlob(pattern, relativePath));
    if (matchesExclude) continue;

    const fileName = path.basename(filePath);

    images.push({
      filePath,
      relativePath,
      fileName,
      key: relativePath.replace(/\\/g, '/') // Windows対応
    });
  }

  return images;
}

/**
 * HTMLファイルを収集
 * @param {string} distDir - distディレクトリのパス
 * @returns {Promise<string[]>}
 */
async function collectHtmlFiles(distDir) {
  const allFiles = await walkDir(distDir, distDir);
  return allFiles.filter(f => f.endsWith('.html'));
}

/**
 * HTMLファイル内の画像URLを書き換え
 * @param {string} htmlPath - HTMLファイルのパス
 * @param {Map<string, string>} urlMap - ローカルパス → 外部URLのマップ
 * @returns {Promise<number>} - 置換した数
 */
async function rewriteHtmlImageUrls(htmlPath, urlMap) {
  let content = await fs.readFile(htmlPath, 'utf-8');
  let replacements = 0;

  for (const [localPath, externalUrl] of urlMap) {
    // ローカルパスをエスケープ
    const escapedPath = localPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // src="/_astro/..." や srcset="/_astro/..." などを置換
    // http/https で始まるURLは除外（既に置換済みを避ける）
    // 属性値の開始（"/ または '/）にマッチさせる
    const patterns = [
      // src="/_astro/xxx" 形式
      new RegExp(`(src=["'])/(${escapedPath})(["'])`, 'g'),
      // srcset="/_astro/xxx 1x" 形式（スペースや,が続く）
      new RegExp(`(srcset=["'][^"']*?)/(${escapedPath})(\\s|,)`, 'g'),
    ];

    for (const pattern of patterns) {
      const before = content;
      content = content.replace(pattern, (match, prefix, path, suffix) => {
        return `${prefix}${externalUrl}${suffix}`;
      });
      if (content !== before) {
        replacements++;
      }
    }
  }

  if (replacements > 0) {
    await fs.writeFile(htmlPath, content, 'utf-8');
  }

  return replacements;
}

/**
 * 画像ファイルを削除
 * @param {ImageInfo[]} images - 削除する画像のリスト
 */
export async function deleteImages(images) {
  for (const image of images) {
    try {
      await fs.unlink(image.filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

/**
 * Astroインテグレーション
 * @param {AstroImageHostingOptions} options
 * @returns {import('astro').AstroIntegration}
 */
export function astroImageHosting(options = {}) {
  const fullConfig = loadConfig(options.config || {});
  const logger = options.logger || console;

  return {
    name: 'astro-image-hosting',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        // 設定が無効な場合は何もしない
        if (!fullConfig.enabled) {
          logger.info?.('[astro-image-hosting] Disabled, skipping upload');
          return;
        }

        // 設定の検証
        const validation = validateConfig(fullConfig);
        if (!validation.valid) {
          logger.warn?.(`[astro-image-hosting] Invalid config: ${validation.errors.join(', ')}`);
          return;
        }

        // 認証情報の読み込み
        const credentials = loadCredentials(fullConfig.provider);
        if (!credentials) {
          logger.warn?.('[astro-image-hosting] No credentials found, skipping upload');
          return;
        }

        // distディレクトリのパス
        const distDir = dir.pathname || dir.href?.replace('file://', '') || dir.toString().replace('file://', '');

        // 画像ファイルの収集
        const images = await collectImages(distDir, {
          include: fullConfig.include,
          exclude: fullConfig.exclude
        });

        if (images.length === 0) {
          logger.info?.('[astro-image-hosting] No images found to upload');
          return;
        }

        logger.info?.(`[astro-image-hosting] Found ${images.length} images to process`);

        // S3クライアントの作成
        const s3Client = createS3Client(fullConfig.provider, credentials, {
          region: fullConfig.region,
          accountId: fullConfig.accountId
        });

        const uploadService = createUploadService({
          client: s3Client,
          bucket: fullConfig.bucket,
          prefix: ''  // prefixなし、relativePathをそのまま使用
        });

        // アップロード結果の追跡
        const results = {
          uploaded: [],
          skipped: [],
          failed: []
        };

        // URLマップを作成（ローカルパス → 外部URL）
        const urlMap = new Map();

        // 並列アップロード（5並列）
        const concurrency = 5;
        const uploadImage = async (image) => {
          try {
            const content = await fs.readFile(image.filePath);
            const localMD5 = calculateMD5(content);

            // 既存ファイルのETagをチェック
            const remoteETag = await uploadService.getETag(image.key);
            if (remoteETag) {
              const cleanETag = remoteETag.replace(/"/g, '');
              if (cleanETag === localMD5) {
                results.skipped.push(image.key);
                // スキップした場合もURLマップに追加
                urlMap.set(image.relativePath, `${fullConfig.baseUrl}/${image.key}`);
                return;
              }
            }

            // アップロード
            await uploadService.upload({
              key: image.key,
              body: content,
              contentType: getContentType(image.fileName),
              cacheControl: 'max-age=31536000, immutable'
            });

            results.uploaded.push(image.key);
            urlMap.set(image.relativePath, `${fullConfig.baseUrl}/${image.key}`);
          } catch (error) {
            results.failed.push({ path: image.key, error });
            if (fullConfig.failOnError) {
              throw error;
            }
          }
        };

        // バッチ処理
        for (let i = 0; i < images.length; i += concurrency) {
          const batch = images.slice(i, i + concurrency);
          await Promise.all(batch.map(uploadImage));
        }

        logger.info?.(`[astro-image-hosting] Upload complete: ${results.uploaded.length} uploaded, ${results.skipped.length} skipped, ${results.failed.length} failed`);

        // 失敗があればログ
        if (results.failed.length > 0) {
          for (const { path: failedPath, error } of results.failed) {
            logger.warn?.(`[astro-image-hosting] Failed to upload ${failedPath}: ${error.message}`);
          }
        }

        // HTMLファイル内の画像URLを書き換え
        if (urlMap.size > 0) {
          const htmlFiles = await collectHtmlFiles(distDir);
          let totalReplacements = 0;

          for (const htmlFile of htmlFiles) {
            const count = await rewriteHtmlImageUrls(htmlFile, urlMap);
            totalReplacements += count;
          }

          logger.info?.(`[astro-image-hosting] Rewrote ${totalReplacements} image URLs in ${htmlFiles.length} HTML files`);
        }

        // distから画像を削除（アップロード成功またはスキップした分）
        const imagesToDelete = images.filter(img =>
          results.uploaded.includes(img.key) || results.skipped.includes(img.key)
        );

        if (imagesToDelete.length > 0) {
          await deleteImages(imagesToDelete);
          logger.info?.(`[astro-image-hosting] Deleted ${imagesToDelete.length} images from dist`);
        }
      }
    }
  };
}

// デフォルトエクスポート
export default astroImageHosting;
