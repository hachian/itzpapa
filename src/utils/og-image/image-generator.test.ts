/**
 * OG画像生成のテスト
 * TDD: 画像出力形式の確認
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  generateOgImage,
  generateHeroImage,
  generateDefaultOgImage,
  getOgImageContentType,
  getOgImageFormat,
} from "./image-generator";

describe("OG画像生成", () => {
  describe("getOgImageContentType", () => {
    it("デフォルト設定でimage/webpを返す", () => {
      const contentType = getOgImageContentType();
      assert.strictEqual(contentType, "image/webp");
    });
  });

  describe("getOgImageFormat", () => {
    it("デフォルト設定でwebpを返す", () => {
      const format = getOgImageFormat();
      assert.strictEqual(format, "webp");
    });
  });

  describe("generateOgImage - 出力形式", () => {
    it("WebP形式のBufferを生成する（magic bytes確認）", async () => {
      const buffer = await generateOgImage({
        title: "テストタイトル",
        slug: "test",
      });

      // WebP magic bytes: RIFF....WEBP
      const header = buffer.slice(0, 12);
      const riff = header.slice(0, 4).toString("ascii");
      const webp = header.slice(8, 12).toString("ascii");

      assert.strictEqual(riff, "RIFF", "WebP RIFFヘッダーが存在すること");
      assert.strictEqual(webp, "WEBP", "WebP識別子が存在すること");
    });
  });

  describe("generateHeroImage - 出力形式", () => {
    it("WebP形式のBufferを生成する", async () => {
      const buffer = await generateHeroImage({
        title: "テストタイトル",
        slug: "test",
        theme: "light",
      });

      // WebP magic bytes
      const header = buffer.slice(0, 12);
      const riff = header.slice(0, 4).toString("ascii");
      const webp = header.slice(8, 12).toString("ascii");

      assert.strictEqual(riff, "RIFF");
      assert.strictEqual(webp, "WEBP");
    });
  });

  describe("generateDefaultOgImage - 出力形式", () => {
    it("WebP形式のBufferを生成する", async () => {
      const buffer = await generateDefaultOgImage();

      // WebP magic bytes
      const header = buffer.slice(0, 12);
      const riff = header.slice(0, 4).toString("ascii");
      const webp = header.slice(8, 12).toString("ascii");

      assert.strictEqual(riff, "RIFF");
      assert.strictEqual(webp, "WEBP");
    });
  });
});
