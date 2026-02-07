/**
 * astro-og-image-generation
 * Astroビルド時にOG画像を自動生成するインテグレーション
 */

/**
 * Astroインテグレーション
 * @param {Object} options - オプション
 * @param {boolean} [options.enabled=true] - OG画像生成を有効にするか
 * @returns {import('astro').AstroIntegration}
 */
export default function astroOgImageGeneration(options = {}) {
  const { enabled = true } = options;

  return {
    name: 'astro-og-image-generation',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        if (enabled) {
          // ブログ記事ごとのOG画像
          injectRoute({
            pattern: '/og/[...slug].png',
            entrypoint: 'src/pages/_og/[...slug].png.ts'
          });

          // デフォルトOG画像
          injectRoute({
            pattern: '/og/default.png',
            entrypoint: 'src/pages/_og/default.png.ts'
          });
        }
      }
    }
  };
}
