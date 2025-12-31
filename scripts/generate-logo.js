/**
 * ロゴ/ファビコン生成スクリプト
 * site.config.tsのprimaryHueに基づいてSVGを生成します
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// プリセットマッピング
const HUE_PRESETS = {
  purple: 293,
  ocean: 200,
  forest: 145,
  sunset: 25,
  mono: 240,
};

/**
 * site.config.tsからprimaryHueを読み取る
 */
function getPrimaryHue() {
  const configPath = path.join(projectRoot, 'site.config.ts');
  const content = fs.readFileSync(configPath, 'utf-8');

  // primaryHue: 'preset' or primaryHue: number を抽出
  const match = content.match(/primaryHue:\s*(?:'([^']+)'|"([^"]+)"|(\d+))/);

  if (!match) {
    console.log('primaryHue not found, using default: 293');
    return 293;
  }

  const presetName = match[1] || match[2];
  const numericValue = match[3];

  if (presetName) {
    const hue = HUE_PRESETS[presetName];
    if (hue !== undefined) {
      console.log(`Using preset '${presetName}': ${hue}`);
      return hue;
    }
    console.log(`Unknown preset '${presetName}', using default: 293`);
    return 293;
  }

  const hue = parseInt(numericValue, 10);
  console.log(`Using numeric hue: ${hue}`);
  return hue;
}

/**
 * OKLCH色を生成
 * サイトのdesign-tokens.cssと同じ色空間を使用
 */
function oklch(l, c, h) {
  return `oklch(${l}% ${c} ${h})`;
}

/**
 * ロゴSVGを生成
 * OKLCHベースでサイトの配色と統一
 */
function generateLogoSvg(targetHue) {
  // design-tokens.cssのprimary色スケールに合わせた色定義
  const colors = {
    lightest: oklch(76, 0.16, targetHue),  // 触角先端、頭（明るい）
    light: oklch(66, 0.20, targetHue),     // 上胴体、羽ハイライト
    medium: oklch(55, 0.24, targetHue),    // 下胴体、羽ミッド（primary-500相当）
    deep: oklch(45, 0.22, targetHue),      // 尾、羽ベース（濃い）
  };

  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#ffffff" opacity="0"/>

  <g transform="translate(256, 256)">
    <g id="right-side">
      <path d="M10,-45 Q40,-90 60,-80" fill="none" stroke="${colors.light}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="60" cy="-80" r="7" fill="${colors.lightest}" />

      <polygon points="12,-20 160,-100 150,-40 12,0" fill="${colors.medium}" />
      <polygon points="12,0 150,-40 140,0 12,15" fill="${colors.light}" />
      <polygon points="12,15 140,0 12,30" fill="${colors.deep}" />

      <polygon points="12,35 130,5 110,60" fill="${colors.light}" />
      <polygon points="12,35 110,60 90,100" fill="${colors.medium}" />
      <polygon points="12,35 90,100 40,110" fill="${colors.deep}" />
    </g>

    <use href="#right-side" transform="scale(-1, 1)" />

    <circle cx="0" cy="-35" r="14" fill="${colors.lightest}" />
    <rect x="-11" y="-15" width="22" height="35" rx="2" fill="${colors.light}" />
    <rect x="-11" y="25" width="22" height="35" rx="2" fill="${colors.medium}" />
    <path d="M-11,65 L11,65 L0,95 Z" fill="${colors.deep}" />

  </g>
</svg>`;
}

/**
 * ファビコン用の小さいSVGを生成
 * OKLCHベースでサイトの配色と統一
 */
function generateFaviconSvg(targetHue) {
  const colors = {
    lightest: oklch(76, 0.16, targetHue),
    light: oklch(66, 0.20, targetHue),
    medium: oklch(55, 0.24, targetHue),
    deep: oklch(45, 0.22, targetHue),
  };

  // ファビコン用に最適化（小さいサイズでも視認性を確保）
  return `<svg width="32" height="32" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#ffffff" opacity="0"/>

  <g transform="translate(256, 256) scale(1.5)">
    <g id="right-side">
      <path d="M10,-45 Q40,-90 60,-80" fill="none" stroke="${colors.light}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="60" cy="-80" r="10" fill="${colors.lightest}" />

      <polygon points="12,-20 160,-100 150,-40 12,0" fill="${colors.medium}" />
      <polygon points="12,0 150,-40 140,0 12,15" fill="${colors.light}" />
      <polygon points="12,15 140,0 12,30" fill="${colors.deep}" />

      <polygon points="12,35 130,5 110,60" fill="${colors.light}" />
      <polygon points="12,35 110,60 90,100" fill="${colors.medium}" />
      <polygon points="12,35 90,100 40,110" fill="${colors.deep}" />
    </g>

    <use href="#right-side" transform="scale(-1, 1)" />

    <circle cx="0" cy="-35" r="18" fill="${colors.lightest}" />
    <rect x="-14" y="-15" width="28" height="35" rx="3" fill="${colors.light}" />
    <rect x="-14" y="25" width="28" height="35" rx="3" fill="${colors.medium}" />
    <path d="M-14,65 L14,65 L0,100 Z" fill="${colors.deep}" />

  </g>
</svg>`;
}

// メイン処理
const primaryHue = getPrimaryHue();
const publicDir = path.join(projectRoot, 'public');

// ロゴを生成
const logoSvg = generateLogoSvg(primaryHue);
fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoSvg);
console.log('Generated: public/logo.svg');

// ファビコンを生成
const faviconSvg = generateFaviconSvg(primaryHue);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);
console.log('Generated: public/favicon.svg');

console.log(`Done! primaryHue: ${primaryHue}`);
