/**
 * S3/R2アップロードサービス
 * AWS SDK v3を使用してS3互換ストレージへの画像アップロードを実行
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

/**
 * @typedef {Object} S3UploadServiceConfig
 * @property {S3Client} client - S3クライアント
 * @property {string} bucket - バケット名
 * @property {string} [prefix] - キーのプレフィックス
 */

/**
 * @typedef {Object} UploadOptions
 * @property {string} key - S3キー（プレフィックスなし）
 * @property {Buffer|import('stream').Readable} body - ファイル内容
 * @property {string} contentType - Content-Typeヘッダー
 * @property {string} [cacheControl] - Cache-Controlヘッダー
 */

/**
 * @typedef {Object} S3UploadService
 * @property {(options: UploadOptions) => Promise<void>} upload
 * @property {(key: string) => Promise<boolean>} exists
 * @property {(key: string) => Promise<string|null>} getETag
 */

/**
 * S3クライアントを作成
 * @param {'S3' | 'R2'} provider - プロバイダー種別
 * @param {{ accessKeyId: string; secretAccessKey: string } | null} credentials - 認証情報
 * @param {{ region?: string; accountId?: string }} config - 追加設定
 * @returns {S3Client}
 */
export function createS3Client(provider, credentials, config = {}) {
  if (!credentials) {
    throw new Error('credentials are required to create S3 client');
  }

  const clientConfig = {
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    }
  };

  if (provider === 'R2') {
    // Cloudflare R2はS3互換APIを提供
    if (!config.accountId) {
      throw new Error('accountId is required for R2 provider');
    }
    clientConfig.endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;
    clientConfig.region = 'auto';
  } else {
    // AWS S3
    clientConfig.region = config.region || 'us-east-1';
  }

  return new S3Client(clientConfig);
}

/**
 * アップロードサービスを作成
 * @param {S3UploadServiceConfig} config - サービス設定
 * @returns {S3UploadService}
 */
export function createUploadService(config) {
  const { client, bucket, prefix = '' } = config;

  /**
   * キーにプレフィックスを追加
   * @param {string} key
   * @returns {string}
   */
  const getFullKey = (key) => {
    if (prefix) {
      return prefix.endsWith('/') ? `${prefix}${key}` : `${prefix}/${key}`;
    }
    return key;
  };

  return {
    /**
     * ファイルをS3にアップロード
     * @param {UploadOptions} options
     */
    async upload(options) {
      const { key, body, contentType, cacheControl } = options;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: getFullKey(key),
        Body: body,
        ContentType: contentType,
        CacheControl: cacheControl
      });

      await client.send(command);
    },

    /**
     * オブジェクトの存在確認
     * @param {string} key
     * @returns {Promise<boolean>}
     */
    async exists(key) {
      try {
        const command = new HeadObjectCommand({
          Bucket: bucket,
          Key: getFullKey(key)
        });
        await client.send(command);
        return true;
      } catch (error) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
          return false;
        }
        throw error;
      }
    },

    /**
     * オブジェクトのETagを取得
     * @param {string} key
     * @returns {Promise<string|null>}
     */
    async getETag(key) {
      try {
        const command = new HeadObjectCommand({
          Bucket: bucket,
          Key: getFullKey(key)
        });
        const response = await client.send(command);
        return response.ETag || null;
      } catch (error) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
          return null;
        }
        throw error;
      }
    }
  };
}
