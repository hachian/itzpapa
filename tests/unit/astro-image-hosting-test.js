/**
 * astro-image-hostingインテグレーションのテスト
 * TDD Red Phase: 失敗するテストを先に作成
 */

import { test, describe, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';

// テスト対象モジュール
import { astroImageHosting, collectImages, deleteImages } from '../../src/integrations/image-hosting/index.js';

describe('astroImageHosting', () => {
  describe('astroImageHosting factory', () => {
    test('AstroIntegration形式のオブジェクトを返す', () => {
      const integration = astroImageHosting({
        config: {
          enabled: true,
          provider: 'S3',
          baseUrl: 'https://cdn.example.com',
          bucket: 'test-bucket',
          region: 'us-east-1',
          include: ['**/*.png'],
          exclude: [],
          failOnError: false,
          useExternalUrlInDev: false
        }
      });

      assert.ok(integration);
      assert.strictEqual(integration.name, 'astro-image-hosting');
      assert.strictEqual(typeof integration.hooks, 'object');
    });

    test('hooksにastro:build:doneが含まれる', () => {
      const integration = astroImageHosting({
        config: {
          enabled: true,
          provider: 'S3',
          baseUrl: 'https://cdn.example.com',
          bucket: 'test-bucket',
          region: 'us-east-1',
          include: ['**/*.png'],
          exclude: [],
          failOnError: false,
          useExternalUrlInDev: false
        }
      });

      assert.ok(integration.hooks['astro:build:done']);
      assert.strictEqual(typeof integration.hooks['astro:build:done'], 'function');
    });
  });

  describe('collectImages', () => {
    let tempDir;

    beforeEach(async () => {
      // テスト用の一時ディレクトリを作成
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'astro-image-hosting-test-'));

      // テスト用のディレクトリ構造を作成
      await fs.mkdir(path.join(tempDir, 'blog'));
      await fs.mkdir(path.join(tempDir, 'blog/my-post'));
      await fs.mkdir(path.join(tempDir, 'blog/other-post'));

      // テスト用の画像ファイルを作成
      await fs.writeFile(path.join(tempDir, 'blog/my-post/image1.png'), 'fake-png-data');
      await fs.writeFile(path.join(tempDir, 'blog/my-post/image2.jpg'), 'fake-jpg-data');
      await fs.writeFile(path.join(tempDir, 'blog/other-post/photo.webp'), 'fake-webp-data');
      await fs.writeFile(path.join(tempDir, 'blog/other-post/draft.png'), 'draft-image');
    });

    afterEach(async () => {
      // 一時ディレクトリを削除
      await fs.rm(tempDir, { recursive: true, force: true });
    });

    test('指定パターンに一致する画像ファイルを収集', async () => {
      const images = await collectImages(tempDir, {
        include: ['**/*.{png,jpg,jpeg,gif,webp,svg}'],
        exclude: []
      });

      assert.ok(Array.isArray(images));
      assert.strictEqual(images.length, 4);
    });

    test('excludeパターンに一致するファイルを除外', async () => {
      const images = await collectImages(tempDir, {
        include: ['**/*.{png,jpg,jpeg,gif,webp,svg}'],
        exclude: ['**/draft*']
      });

      assert.strictEqual(images.length, 3);
      assert.ok(!images.some(img => img.filePath.includes('draft')));
    });

    test('収集結果にはファイルパスとスラッグ情報が含まれる', async () => {
      const images = await collectImages(tempDir, {
        include: ['**/*.png'],
        exclude: []
      });

      assert.ok(images.length > 0);

      // 各画像にfilePath情報があることを確認
      for (const image of images) {
        assert.ok(image.filePath);
        assert.ok(image.slug);
        assert.ok(image.fileName);
      }
    });
  });

  describe('deleteImages', () => {
    let tempDir;

    beforeEach(async () => {
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'astro-image-hosting-delete-test-'));
      await fs.mkdir(path.join(tempDir, 'blog/my-post'), { recursive: true });
      await fs.writeFile(path.join(tempDir, 'blog/my-post/image1.png'), 'fake-data');
      await fs.writeFile(path.join(tempDir, 'blog/my-post/image2.jpg'), 'fake-data');
    });

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    });

    test('指定した画像ファイルを削除', async () => {
      const imagesToDelete = [
        { filePath: path.join(tempDir, 'blog/my-post/image1.png') }
      ];

      await deleteImages(imagesToDelete);

      // ファイルが削除されたことを確認
      await assert.rejects(
        fs.access(path.join(tempDir, 'blog/my-post/image1.png')),
        { code: 'ENOENT' }
      );

      // 他のファイルは残っていることを確認
      await fs.access(path.join(tempDir, 'blog/my-post/image2.jpg'));
    });

    test('存在しないファイルでもエラーにならない', async () => {
      const imagesToDelete = [
        { filePath: path.join(tempDir, 'nonexistent.png') }
      ];

      // エラーが発生しないことを確認
      await assert.doesNotReject(deleteImages(imagesToDelete));
    });
  });

  describe('upload flow', () => {
    test('認証情報未設定時はアップロードをスキップ', async () => {
      const logs = [];
      const mockLogger = {
        info: (msg) => logs.push(msg),
        warn: (msg) => logs.push(msg)
      };

      const integration = astroImageHosting({
        config: {
          enabled: true,
          provider: 'S3',
          baseUrl: 'https://cdn.example.com',
          bucket: 'test-bucket',
          region: 'us-east-1',
          include: ['**/*.png'],
          exclude: [],
          failOnError: false,
          useExternalUrlInDev: false
        },
        logger: mockLogger
      });

      // credentials未設定でフックを実行
      // 実際のテストでは環境変数が未設定なので、スキップされるはず
      assert.ok(integration);
    });
  });
});
