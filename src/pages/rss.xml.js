import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_TITLE } from '../../site.config';
import { getSiteDescription } from '../i18n';

export async function GET(context) {
	const posts = await getCollection('blog', ({ data }) => {
		// draft: trueの記事を除外（RSSは常に公開記事のみ）
		return data.draft !== true;
	});
	return rss({
		title: SITE_TITLE,
		description: getSiteDescription(),
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: `/blog/${post.id}/`,
		})),
	});
}
