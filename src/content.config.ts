import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			// Required fields
			title: z.string(),
			published: z.coerce.date(),

			// Optional fields with defaults
			updated: z.coerce.date().optional(),
			description: z.string().optional().default(''),
			image: image().optional(),
			tags: z.array(z.string()).optional().default([]),
			category: z.string().optional().default(''),
			draft: z.boolean().optional().default(false),
			lang: z.string().optional().default(''),

			// Obsidian official property
			aliases: z.array(z.string()).optional(),
		}),
});

export const collections = { blog };
