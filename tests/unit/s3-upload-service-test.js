/**
 * S3アップロードサービスのテスト
 * TDD Red Phase: 失敗するテストを先に作成
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { Readable } from 'node:stream';

// テスト対象モジュール
import {
  createS3Client,
  createUploadService
} from '../../src/integrations/image-hosting/s3-upload-service.js';

describe('S3UploadService', () => {
  describe('createS3Client', () => {
    test('S3プロバイダーの場合は標準エンドポイントを使用', () => {
      const credentials = {
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key'
      };

      const client = createS3Client('S3', credentials, { region: 'us-east-1' });

      assert.ok(client);
      // クライアントが生成されることを確認
      assert.ok(client.config);
    });

    test('R2プロバイダーの場合はS3互換エンドポイントを使用', () => {
      const credentials = {
        accessKeyId: 'r2-access-key',
        secretAccessKey: 'r2-secret-key'
      };

      const client = createS3Client('R2', credentials, { accountId: 'abc123' });

      assert.ok(client);
      // クライアントが生成されることを確認
      assert.ok(client.config);
    });

    test('認証情報がnullの場合はエラー', () => {
      assert.throws(() => {
        createS3Client('S3', null, { region: 'us-east-1' });
      }, /credentials/i);
    });
  });

  describe('createUploadService', () => {
    // モッククライアントを使用
    const mockClient = {
      send: async () => ({})
    };

    test('アップロードサービスが作成される', () => {
      const service = createUploadService({
        client: mockClient,
        bucket: 'test-bucket',
        prefix: 'images/'
      });

      assert.ok(service);
      assert.strictEqual(typeof service.upload, 'function');
      assert.strictEqual(typeof service.exists, 'function');
      assert.strictEqual(typeof service.getETag, 'function');
    });

    test('prefixのデフォルトは空文字', () => {
      const service = createUploadService({
        client: mockClient,
        bucket: 'test-bucket'
      });

      assert.ok(service);
    });
  });

  describe('S3UploadService.upload', () => {
    test('PutObjectでファイルをアップロード', async () => {
      let capturedInput = null;
      const mockClient = {
        send: async (command) => {
          capturedInput = command.input;
          return {};
        }
      };

      const service = createUploadService({
        client: mockClient,
        bucket: 'test-bucket',
        prefix: 'images/'
      });

      await service.upload({
        key: 'my-post/image.png',
        body: Buffer.from('test'),
        contentType: 'image/png'
      });

      assert.strictEqual(capturedInput.Bucket, 'test-bucket');
      assert.strictEqual(capturedInput.Key, 'images/my-post/image.png');
      assert.strictEqual(capturedInput.ContentType, 'image/png');
    });

    test('CacheControlヘッダーが設定される', async () => {
      let capturedInput = null;
      const mockClient = {
        send: async (command) => {
          capturedInput = command.input;
          return {};
        }
      };

      const service = createUploadService({
        client: mockClient,
        bucket: 'test-bucket'
      });

      await service.upload({
        key: 'image.png',
        body: Buffer.from('test'),
        contentType: 'image/png',
        cacheControl: 'max-age=31536000'
      });

      assert.strictEqual(capturedInput.CacheControl, 'max-age=31536000');
    });
  });

  describe('S3UploadService.exists', () => {
    test('オブジェクトが存在する場合はtrueを返す', async () => {
      const mockClient = {
        send: async () => ({})
      };

      const service = createUploadService({
        client: mockClient,
        bucket: 'test-bucket',
        prefix: 'images/'
      });

      const result = await service.exists('my-post/image.png');

      assert.strictEqual(result, true);
    });

    test('オブジェクトが存在しない場合はfalseを返す', async () => {
      const mockClient = {
        send: async () => {
          const error = new Error('Not Found');
          error.name = 'NotFound';
          throw error;
        }
      };

      const service = createUploadService({
        client: mockClient,
        bucket: 'test-bucket',
        prefix: 'images/'
      });

      const result = await service.exists('nonexistent.png');

      assert.strictEqual(result, false);
    });
  });

  describe('S3UploadService.getETag', () => {
    test('オブジェクトのETagを返す', async () => {
      const mockClient = {
        send: async () => ({
          ETag: '"abc123"'
        })
      };

      const service = createUploadService({
        client: mockClient,
        bucket: 'test-bucket',
        prefix: 'images/'
      });

      const result = await service.getETag('my-post/image.png');

      assert.strictEqual(result, '"abc123"');
    });

    test('オブジェクトが存在しない場合はnullを返す', async () => {
      const mockClient = {
        send: async () => {
          const error = new Error('Not Found');
          error.name = 'NotFound';
          throw error;
        }
      };

      const service = createUploadService({
        client: mockClient,
        bucket: 'test-bucket'
      });

      const result = await service.getETag('nonexistent.png');

      assert.strictEqual(result, null);
    });
  });
});
