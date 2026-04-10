import { getCollection } from 'astro:content';

const includeDrafts = import.meta.env.PUBLIC_INCLUDE_DRAFTS === 'true';

export async function getBlogPosts() {
	const posts = await getCollection('blog');
	return posts.filter((post) => includeDrafts || !post.data.draft);
}

export function shouldIncludeDrafts() {
	return includeDrafts;
}
