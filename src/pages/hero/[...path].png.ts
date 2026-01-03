import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { generateHeroImage } from "../../utils/og-image";
import { removeDatePrefix } from "../../plugins/utils/index.js";

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("blog");

  // imageが未設定の記事のみをフィルタリング
  const postsWithoutHero = posts.filter((post) => !post.data.image);

  // 各記事に対してlight/darkの2つのパスを生成
  // YYYYMMDD-プレフィックスを除去したslugを使用
  const paths = postsWithoutHero.flatMap((post) => {
    const slug = removeDatePrefix(post.id);
    return [
      {
        params: { path: `${slug}-light` },
        props: { title: post.data.title, theme: "light" as const },
      },
      {
        params: { path: `${slug}-dark` },
        props: { title: post.data.title, theme: "dark" as const },
      },
    ];
  });

  return paths;
};

export const GET: APIRoute = async ({ props }) => {
  const { title, theme } = props as { title: string; theme: "light" | "dark" };

  try {
    const pngBuffer = await generateHeroImage({
      title,
      slug: "",
      theme,
    });

    return new Response(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("imageの生成に失敗しました:", error);
    return new Response("Failed to generate hero image", { status: 500 });
  }
};
