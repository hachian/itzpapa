import type { APIRoute } from "astro";
import { generateDefaultOgImage } from "../../utils/og-image";

export const prerender = true;

export const GET: APIRoute = async () => {
  try {
    const pngBuffer = await generateDefaultOgImage();

    return new Response(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("デフォルトOG画像の生成に失敗しました:", error);
    return new Response("Failed to generate default OG image", { status: 500 });
  }
};
