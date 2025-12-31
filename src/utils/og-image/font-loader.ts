import { readFile } from "fs/promises";
import { join } from "path";

export interface SatoriFont {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
}

// プロジェクトルートからの絶対パスを使用
const FONTS_DIR = join(process.cwd(), "src/assets/fonts");

let cachedFonts: SatoriFont[] | null = null;

export async function loadFonts(): Promise<SatoriFont[]> {
  if (cachedFonts) {
    return cachedFonts;
  }

  try {
    const [regularData, boldData] = await Promise.all([
      readFile(join(FONTS_DIR, "NotoSansJP-Regular.ttf")),
      readFile(join(FONTS_DIR, "NotoSansJP-Bold.ttf")),
    ]);

    cachedFonts = [
      {
        name: "Noto Sans JP",
        data: regularData,
        weight: 400,
        style: "normal",
      },
      {
        name: "Noto Sans JP",
        data: boldData,
        weight: 700,
        style: "normal",
      },
    ];

    return cachedFonts;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `フォントファイルの読み込みに失敗しました。${FONTS_DIR} にNotoSansJP-Regular.ttf と NotoSansJP-Bold.ttf が存在することを確認してください。\n詳細: ${message}`
    );
  }
}
