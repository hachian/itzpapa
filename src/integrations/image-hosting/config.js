/**
 * 画像ホスティング設定モジュール
 * S3/R2への画像外部ホスティング設定を管理
 */

/**
 * @typedef {'S3' | 'R2' | 'custom'} ProviderType
 */

/**
 * @typedef {Object} ImageHostingConfig
 * @property {boolean} enabled - 外部ホスティングを有効化するか
 * @property {ProviderType} provider - プロバイダー種別
 * @property {string} baseUrl - 画像配信用のベースURL
 * @property {string} bucket - S3/R2バケット名
 * @property {string} [region] - S3リージョン（S3の場合のみ必須）
 * @property {string} [accountId] - R2アカウントID（R2の場合のみ必須）
 * @property {string[]} include - アップロード対象のファイルパターン
 * @property {string[]} exclude - アップロード除外のファイルパターン
 * @property {boolean} failOnError - アップロード失敗時にビルドを中断するか
 * @property {boolean} useExternalUrlInDev - 開発モードでも外部URLを使用するか
 */

/**
 * @typedef {Object} ImageHostingCredentials
 * @property {string} accessKeyId
 * @property {string} secretAccessKey
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string[]} errors
 */

/** @type {ImageHostingConfig} */
const DEFAULT_CONFIG = {
  enabled: false,
  provider: 'S3',
  baseUrl: '',
  bucket: '',
  region: undefined,
  accountId: undefined,
  include: ['**/*.{png,jpg,jpeg,gif,webp,svg}'],
  exclude: [],
  failOnError: false,
  useExternalUrlInDev: false
};

/**
 * 設定をロードしデフォルト値とマージ
 * @param {Partial<ImageHostingConfig>} options - 設定オプション
 * @returns {ImageHostingConfig}
 */
export function loadConfig(options = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...options,
    // 配列フィールドは上書きではなく置換
    include: options.include ?? DEFAULT_CONFIG.include,
    exclude: options.exclude ?? DEFAULT_CONFIG.exclude
  };
}

/**
 * 環境変数から認証情報を読み取る
 * @param {'S3' | 'R2'} provider - プロバイダー種別
 * @returns {ImageHostingCredentials | null}
 */
export function loadCredentials(provider) {
  let accessKeyId;
  let secretAccessKey;

  if (provider === 'S3') {
    accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  } else if (provider === 'R2') {
    accessKeyId = process.env.R2_ACCESS_KEY_ID;
    secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  } else {
    return null;
  }

  // 両方の認証情報が存在する場合のみ返す
  if (accessKeyId && secretAccessKey) {
    return { accessKeyId, secretAccessKey };
  }

  return null;
}

/**
 * 設定を検証
 * @param {ImageHostingConfig} config - 検証対象の設定
 * @returns {ValidationResult}
 */
export function validateConfig(config) {
  const errors = [];

  // 無効時はバリデーションをスキップ
  if (!config.enabled) {
    return { valid: true, errors: [] };
  }

  // プロバイダーチェック
  const validProviders = ['S3', 'R2', 'custom'];
  if (!validProviders.includes(config.provider)) {
    errors.push(`Invalid provider: ${config.provider}. Supported: ${validProviders.join(', ')}`);
  }

  // baseURL形式チェック（enabled時のみ）
  if (config.baseUrl) {
    try {
      new URL(config.baseUrl);
    } catch {
      errors.push(`Invalid baseUrl format: ${config.baseUrl}. Must be a valid URL.`);
    }
  }

  // bucket必須チェック
  if (!config.bucket) {
    errors.push('bucket is required when image hosting is enabled.');
  }

  // プロバイダー固有のチェック
  if (config.provider === 'S3' && !config.region) {
    errors.push('region is required for S3 provider.');
  }

  if (config.provider === 'R2' && !config.accountId) {
    errors.push('accountId is required for R2 provider.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
