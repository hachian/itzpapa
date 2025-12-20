/**
 * 国際化ヘルパーモジュール
 * 翻訳テキスト取得のヘルパー関数を提供
 */
import { siteConfig } from '../../site.config';
import { translations, type TranslationKeys } from './translations';
import type { Language, LocalizedText } from '../types/site-config';

/**
 * 現在の言語設定を取得
 * @returns 設定された言語、未設定の場合は 'ja'
 */
export function getLanguage(): Language {
  return siteConfig.site.language ?? 'ja';
}

/**
 * 翻訳テキストを取得
 * @param key - 翻訳キー
 * @returns 現在の言語に対応する翻訳テキスト
 */
export function t(key: keyof TranslationKeys): string {
  const lang = getLanguage();
  return translations[lang][key];
}

/**
 * 全翻訳キーのオブジェクトを取得（コンポーネント用）
 * @returns 現在の言語の全翻訳
 */
export function getTranslations(): TranslationKeys {
  return translations[getLanguage()];
}

/**
 * ローカライズされたテキストを取得
 * @param text - 単一文字列または言語別オブジェクト
 * @returns 現在の言語に対応するテキスト
 */
export function getLocalizedText(text: LocalizedText): string {
  if (typeof text === 'string') {
    return text;
  }
  const lang = getLanguage();
  return text[lang];
}

/**
 * サイト説明文を取得
 * @returns 現在の言語に対応するサイト説明文
 */
export function getSiteDescription(): string {
  return getLocalizedText(siteConfig.site.description);
}

// 型の再エクスポート
export type { TranslationKeys } from './translations';
export type { Language, LocalizedText } from '../types/site-config';
