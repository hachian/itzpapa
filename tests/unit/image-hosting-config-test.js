/**
 * 画像ホスティング設定モジュールのテスト
 * TDD Red Phase: 失敗するテストを先に作成
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

// テスト対象モジュール（まだ存在しない）
import { loadConfig, loadCredentials, validateConfig } from '../../src/integrations/image-hosting/config.js';

describe('ImageHostingConfig', () => {
  // 環境変数のバックアップ
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // 環境変数を復元
    process.env = originalEnv;
  });

  describe('loadConfig', () => {
    test('デフォルト値が正しくマージされる', () => {
      const config = loadConfig({});

      assert.strictEqual(config.enabled, false);
      assert.strictEqual(config.provider, 'S3');
      assert.strictEqual(config.baseUrl, '');
      assert.strictEqual(config.bucket, '');
      assert.deepStrictEqual(config.include, ['**/*.{png,jpg,jpeg,gif,webp,svg}']);
      assert.deepStrictEqual(config.exclude, []);
      assert.strictEqual(config.failOnError, false);
      assert.strictEqual(config.useExternalUrlInDev, false);
    });

    test('部分的なオプションでデフォルト値がマージされる', () => {
      const config = loadConfig({
        enabled: true,
        provider: 'R2',
        bucket: 'my-bucket'
      });

      assert.strictEqual(config.enabled, true);
      assert.strictEqual(config.provider, 'R2');
      assert.strictEqual(config.bucket, 'my-bucket');
      assert.strictEqual(config.baseUrl, '');
      assert.strictEqual(config.failOnError, false);
    });

    test('全てのオプションが指定された場合はそのまま使用', () => {
      const fullConfig = {
        enabled: true,
        provider: 'R2',
        baseUrl: 'https://cdn.example.com',
        bucket: 'my-bucket',
        region: 'us-east-1',
        accountId: 'abc123',
        include: ['*.png'],
        exclude: ['**/draft/**'],
        failOnError: true,
        useExternalUrlInDev: true
      };

      const config = loadConfig(fullConfig);

      assert.deepStrictEqual(config, fullConfig);
    });

    test('S3プロバイダーの場合はregionが設定される', () => {
      const config = loadConfig({
        enabled: true,
        provider: 'S3',
        bucket: 'my-bucket',
        region: 'ap-northeast-1'
      });

      assert.strictEqual(config.region, 'ap-northeast-1');
    });

    test('R2プロバイダーの場合はaccountIdが設定される', () => {
      const config = loadConfig({
        enabled: true,
        provider: 'R2',
        bucket: 'my-bucket',
        accountId: 'cf-account-id'
      });

      assert.strictEqual(config.accountId, 'cf-account-id');
    });
  });

  describe('loadCredentials', () => {
    test('S3の場合はAWS環境変数から認証情報を読み取る', () => {
      process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
      process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';

      const credentials = loadCredentials('S3');

      assert.strictEqual(credentials.accessKeyId, 'test-access-key');
      assert.strictEqual(credentials.secretAccessKey, 'test-secret-key');
    });

    test('R2の場合はR2環境変数から認証情報を読み取る', () => {
      process.env.R2_ACCESS_KEY_ID = 'r2-access-key';
      process.env.R2_SECRET_ACCESS_KEY = 'r2-secret-key';

      const credentials = loadCredentials('R2');

      assert.strictEqual(credentials.accessKeyId, 'r2-access-key');
      assert.strictEqual(credentials.secretAccessKey, 'r2-secret-key');
    });

    test('認証情報が未設定の場合はnullを返す', () => {
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;

      const credentials = loadCredentials('S3');

      assert.strictEqual(credentials, null);
    });

    test('部分的な認証情報の場合もnullを返す', () => {
      process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
      delete process.env.AWS_SECRET_ACCESS_KEY;

      const credentials = loadCredentials('S3');

      assert.strictEqual(credentials, null);
    });
  });

  describe('validateConfig', () => {
    test('有効な設定の場合はvalidがtrue', () => {
      const config = {
        enabled: true,
        provider: 'S3',
        baseUrl: 'https://cdn.example.com',
        bucket: 'my-bucket',
        region: 'us-east-1',
        include: ['**/*.png'],
        exclude: [],
        failOnError: false,
        useExternalUrlInDev: false
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, true);
      assert.deepStrictEqual(result.errors, []);
    });

    test('無効なbaseURL形式の場合はエラー', () => {
      const config = {
        enabled: true,
        provider: 'S3',
        baseUrl: 'not-a-valid-url',
        bucket: 'my-bucket',
        region: 'us-east-1',
        include: [],
        exclude: [],
        failOnError: false,
        useExternalUrlInDev: false
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('baseUrl')));
    });

    test('enabled時にbucketが空の場合はエラー', () => {
      const config = {
        enabled: true,
        provider: 'S3',
        baseUrl: 'https://cdn.example.com',
        bucket: '',
        region: 'us-east-1',
        include: [],
        exclude: [],
        failOnError: false,
        useExternalUrlInDev: false
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('bucket')));
    });

    test('S3プロバイダーでregion未設定の場合はエラー', () => {
      const config = {
        enabled: true,
        provider: 'S3',
        baseUrl: 'https://cdn.example.com',
        bucket: 'my-bucket',
        include: [],
        exclude: [],
        failOnError: false,
        useExternalUrlInDev: false
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('region')));
    });

    test('R2プロバイダーでaccountId未設定の場合はエラー', () => {
      const config = {
        enabled: true,
        provider: 'R2',
        baseUrl: 'https://cdn.example.com',
        bucket: 'my-bucket',
        include: [],
        exclude: [],
        failOnError: false,
        useExternalUrlInDev: false
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('accountId')));
    });

    test('未対応プロバイダーの場合はエラー', () => {
      const config = {
        enabled: true,
        provider: 'unknown',
        baseUrl: 'https://cdn.example.com',
        bucket: 'my-bucket',
        include: [],
        exclude: [],
        failOnError: false,
        useExternalUrlInDev: false
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('provider')));
    });

    test('無効時はバリデーションをスキップ', () => {
      const config = {
        enabled: false,
        provider: 'S3',
        baseUrl: '',
        bucket: '',
        include: [],
        exclude: [],
        failOnError: false,
        useExternalUrlInDev: false
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, true);
    });

    test('customプロバイダーの場合はregion/accountIdチェックをスキップ', () => {
      const config = {
        enabled: true,
        provider: 'custom',
        baseUrl: 'https://cdn.example.com',
        bucket: 'my-bucket',
        include: [],
        exclude: [],
        failOnError: false,
        useExternalUrlInDev: false
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, true);
    });
  });
});
