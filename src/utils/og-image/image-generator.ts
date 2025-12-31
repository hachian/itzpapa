import satori from "satori";
import sharp from "sharp";
import { readFile } from "fs/promises";
import { join } from "path";
import { loadFonts } from "./font-loader";

// プロジェクトルートからの絶対パスを使用
const ASSETS_DIR = join(process.cwd(), "src/assets");

export interface OgImageOptions {
  title: string;
  slug: string;
  width?: number;
  height?: number;
}

export interface HeroImageOptions {
  title: string;
  slug: string;
  theme: "light" | "dark";
  width?: number;
  height?: number;
}

interface TemplateOptions {
  title: string;
  width: number;
  height: number;
  backgroundImageBase64: string;
  theme: "light" | "dark";
}

function calculateFontSize(title: string, baseSize: number): number {
  const length = title.length;
  if (length <= 20) return baseSize;
  if (length <= 40) return Math.floor(baseSize * 0.85);
  if (length <= 60) return Math.floor(baseSize * 0.7);
  return Math.floor(baseSize * 0.6);
}

function createTemplate(options: TemplateOptions) {
  const { title, width, height, backgroundImageBase64, theme } = options;
  const fontSize = calculateFontSize(title, 56);
  const textColor = theme === "light" ? "#1a1a2e" : "#ffffff";
  const overlayColor =
    theme === "light" ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)";

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      },
      children: [
        {
          type: "img",
          props: {
            src: backgroundImageBase64,
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: overlayColor,
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 60px",
              maxWidth: "90%",
              textAlign: "center",
            },
            children: [
              {
                type: "p",
                props: {
                  style: {
                    fontSize: `${fontSize}px`,
                    fontWeight: 700,
                    color: textColor,
                    lineHeight: 1.4,
                    margin: 0,
                    wordBreak: "break-word",
                  },
                  children: title,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function loadBackgroundImage(
  theme: "light" | "dark"
): Promise<string> {
  const filename =
    theme === "light" ? "itzpapa-light_16_9.png" : "itzpapa-dark_16_9.png";
  const imagePath = join(ASSETS_DIR, filename);
  const imageBuffer = await readFile(imagePath);
  const base64 = imageBuffer.toString("base64");
  return `data:image/png;base64,${base64}`;
}

export async function generateOgImage(
  options: OgImageOptions
): Promise<Buffer> {
  const { title, width = 1200, height = 630 } = options;

  if (!title || title.trim() === "") {
    throw new Error("タイトルは空文字列であってはなりません");
  }

  const fonts = await loadFonts();
  const backgroundImageBase64 = await loadBackgroundImage("light");

  const template = createTemplate({
    title,
    width,
    height,
    backgroundImageBase64,
    theme: "light",
  });

  const svg = await satori(template, {
    width,
    height,
    fonts,
  });

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return pngBuffer;
}

export async function generateHeroImage(
  options: HeroImageOptions
): Promise<Buffer> {
  const { title, theme, width = 1020, height = 510 } = options;

  if (!title || title.trim() === "") {
    throw new Error("タイトルは空文字列であってはなりません");
  }

  const fonts = await loadFonts();
  const backgroundImageBase64 = await loadBackgroundImage(theme);

  const template = createTemplate({
    title,
    width,
    height,
    backgroundImageBase64,
    theme,
  });

  const svg = await satori(template, {
    width,
    height,
    fonts,
  });

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return pngBuffer;
}

export async function generateDefaultOgImage(): Promise<Buffer> {
  const width = 1200;
  const height = 630;

  const fonts = await loadFonts();
  const backgroundImageBase64 = await loadBackgroundImage("light");

  const template = {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      },
      children: [
        {
          type: "img",
          props: {
            src: backgroundImageBase64,
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255,255,255,0.75)",
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 60px",
              textAlign: "center",
            },
            children: [
              {
                type: "p",
                props: {
                  style: {
                    fontSize: "72px",
                    fontWeight: 700,
                    color: "#1a1a2e",
                    margin: 0,
                  },
                  children: "itzpapa",
                },
              },
              {
                type: "p",
                props: {
                  style: {
                    fontSize: "32px",
                    fontWeight: 400,
                    color: "#4a4a6a",
                    marginTop: "20px",
                  },
                  children: "Obsidian × Astro ブログテンプレート",
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(template, {
    width,
    height,
    fonts,
  });

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  return pngBuffer;
}
