/**
 * OG画像圧縮設定
 * WebP/PNGの圧縮パラメータを管理
 */
import type { OgImageCompressionConfig, OgImageFormat } from "../../types/site-config.ts";

export type { OgImageCompressionConfig, OgImageFormat };

/** 圧縮設定（解決済み、必須フィールド） */
interface ResolvedCompressionConfig {
  format: OgImageFormat;
  webpQuality: number;
  pngCompressionLevel: number;
}

/** デフォルト値 */
const DEFAULTS: ResolvedCompressionConfig = {
  format: "webp",
  webpQuality: 80,
  pngCompressionLevel: 9,
};

/**
 * 値を指定範囲にclampする
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 圧縮設定を取得（デフォルト値適用・範囲clamp）
 */
export function getCompressionConfig(
  config: OgImageCompressionConfig | undefined
): ResolvedCompressionConfig {
  const format = config?.format ?? DEFAULTS.format;
  const webpQuality = clamp(
    config?.webpQuality ?? DEFAULTS.webpQuality,
    0,
    100
  );
  const pngCompressionLevel = clamp(
    config?.pngCompressionLevel ?? DEFAULTS.pngCompressionLevel,
    0,
    9
  );

  return {
    format,
    webpQuality,
    pngCompressionLevel,
  };
}

/**
 * Content-Typeを取得
 */
export function getOgImageContentType(
  config: OgImageCompressionConfig | undefined
): "image/webp" | "image/png" {
  const format = config?.format ?? DEFAULTS.format;
  return format === "webp" ? "image/webp" : "image/png";
}

/**
 * 出力フォーマットを取得
 */
export function getOgImageFormat(
  config: OgImageCompressionConfig | undefined
): OgImageFormat {
  return config?.format ?? DEFAULTS.format;
}
