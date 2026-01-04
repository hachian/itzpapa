/**
 * OG画像圧縮設定のテスト
 * TDD: まず失敗するテストを書く
 */
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import {
  getCompressionConfig,
  getOgImageContentType,
  getOgImageFormat,
  type OgImageCompressionConfig,
} from "./compression-config";

describe("OG画像圧縮設定", () => {
  describe("getCompressionConfig", () => {
    it("デフォルト値: WebP形式、quality=80を返す", () => {
      const config = getCompressionConfig(undefined);

      assert.strictEqual(config.format, "webp");
      assert.strictEqual(config.webpQuality, 80);
      assert.strictEqual(config.pngCompressionLevel, 9);
    });

    it("format: pngを指定した場合、PNG形式を返す", () => {
      const config = getCompressionConfig({ format: "png" });

      assert.strictEqual(config.format, "png");
    });

    it("webpQuality: カスタム値を指定した場合、その値を返す", () => {
      const config = getCompressionConfig({ webpQuality: 60 });

      assert.strictEqual(config.webpQuality, 60);
    });

    it("pngCompressionLevel: カスタム値を指定した場合、その値を返す", () => {
      const config = getCompressionConfig({ pngCompressionLevel: 6 });

      assert.strictEqual(config.pngCompressionLevel, 6);
    });

    it("webpQuality: 範囲外の値（100超）はclampされる", () => {
      const config = getCompressionConfig({ webpQuality: 150 });

      assert.strictEqual(config.webpQuality, 100);
    });

    it("webpQuality: 範囲外の値（0未満）はclampされる", () => {
      const config = getCompressionConfig({ webpQuality: -10 });

      assert.strictEqual(config.webpQuality, 0);
    });

    it("pngCompressionLevel: 範囲外の値（9超）はclampされる", () => {
      const config = getCompressionConfig({ pngCompressionLevel: 15 });

      assert.strictEqual(config.pngCompressionLevel, 9);
    });

    it("pngCompressionLevel: 範囲外の値（0未満）はclampされる", () => {
      const config = getCompressionConfig({ pngCompressionLevel: -5 });

      assert.strictEqual(config.pngCompressionLevel, 0);
    });
  });

  describe("getOgImageContentType", () => {
    it("WebP設定時にimage/webpを返す", () => {
      const contentType = getOgImageContentType({ format: "webp" });

      assert.strictEqual(contentType, "image/webp");
    });

    it("PNG設定時にimage/pngを返す", () => {
      const contentType = getOgImageContentType({ format: "png" });

      assert.strictEqual(contentType, "image/png");
    });

    it("未設定時にimage/webpを返す（デフォルト）", () => {
      const contentType = getOgImageContentType(undefined);

      assert.strictEqual(contentType, "image/webp");
    });
  });

  describe("getOgImageFormat", () => {
    it("WebP設定時にwebpを返す", () => {
      const format = getOgImageFormat({ format: "webp" });

      assert.strictEqual(format, "webp");
    });

    it("PNG設定時にpngを返す", () => {
      const format = getOgImageFormat({ format: "png" });

      assert.strictEqual(format, "png");
    });

    it("未設定時にwebpを返す（デフォルト）", () => {
      const format = getOgImageFormat(undefined);

      assert.strictEqual(format, "webp");
    });
  });
});
