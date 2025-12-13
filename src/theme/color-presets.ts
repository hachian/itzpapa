/**
 * カラープリセット定義
 *
 * サイト全体のプライマリカラーを決定するプリセットを定義します。
 * プリセット名または0-360の数値でテーマを設定できます。
 */

/**
 * 単一のカラープリセット
 */
export interface ColorPreset {
  /** プリセット名 */
  name: string;
  /** プライマリカラーの色相（0-360） */
  primaryHue: number;
  /** プリセットの説明 */
  description: string;
}

/**
 * プリセット名の型
 */
export type PresetName = 'purple' | 'ocean' | 'forest' | 'sunset' | 'mono';

/**
 * テーマ設定の入力値の型
 * プリセット名または数値（0-360）を受け付ける
 */
export type ThemeColorInput = PresetName | number;

/**
 * 利用可能なカラープリセット
 */
export const COLOR_PRESETS: Record<PresetName, ColorPreset> = {
  purple: {
    name: 'purple',
    primaryHue: 293,
    description: '紫色 - 創造性と高級感を表現',
  },
  ocean: {
    name: 'ocean',
    primaryHue: 200,
    description: '海のブルー - 信頼感と落ち着きを表現',
  },
  forest: {
    name: 'forest',
    primaryHue: 145,
    description: '森のグリーン - 自然と成長を表現',
  },
  sunset: {
    name: 'sunset',
    primaryHue: 25,
    description: '夕焼けのオレンジ - 温かみと活力を表現',
  },
  mono: {
    name: 'mono',
    primaryHue: 240,
    description: 'モノトーン - シンプルで洗練された印象',
  },
} as const;

/**
 * デフォルトのプリセット
 */
export const DEFAULT_PRESET: PresetName = 'purple';

/**
 * 色相値を0-360の範囲にクランプする
 */
function clampHue(hue: number): number {
  // 負の値や360以上の値を正規化
  const normalized = ((hue % 360) + 360) % 360;
  return Math.round(normalized);
}

/**
 * プリセット名かどうかを判定する
 */
export function isPresetName(value: unknown): value is PresetName {
  return typeof value === 'string' && value in COLOR_PRESETS;
}

/**
 * テーマカラー入力から色相値を解決する
 *
 * @param input - プリセット名または数値（0-360）
 * @returns 解決された色相値（0-360）
 *
 * @example
 * ```ts
 * resolveThemeColor('purple');  // 293
 * resolveThemeColor('ocean');   // 200
 * resolveThemeColor(180);       // 180
 * resolveThemeColor(400);       // 40 (クランプされる)
 * resolveThemeColor('invalid'); // 293 (デフォルト)
 * ```
 */
export function resolveThemeColor(input: ThemeColorInput): number {
  // 数値の場合
  if (typeof input === 'number') {
    return clampHue(input);
  }

  // プリセット名の場合
  if (isPresetName(input)) {
    return COLOR_PRESETS[input].primaryHue;
  }

  // 不明な文字列の場合はデフォルトにフォールバック
  console.warn(`Unknown color preset "${input}", falling back to "${DEFAULT_PRESET}"`);
  return COLOR_PRESETS[DEFAULT_PRESET].primaryHue;
}

/**
 * 全プリセットの一覧を取得
 */
export function getPresetList(): ColorPreset[] {
  return Object.values(COLOR_PRESETS);
}

/**
 * プリセット名から詳細情報を取得
 */
export function getPresetInfo(name: PresetName): ColorPreset | undefined {
  return COLOR_PRESETS[name];
}
