import { createClient } from 'microcms-js-sdk';

const serviceDomain = import.meta.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = import.meta.env.MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
  throw new Error(
    'MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY を .env に設定してください。'
  );
}

export const client = createClient({ serviceDomain, apiKey });

export interface BlogPost {
  id: string;
  title: string;
  description?: string;
  pubDate: string;
  author?: string;
  tags?: string[];
  image?: {
    url: string;
    width?: number;
    height?: number;
  };
  body: string;
  publishedAt: string;
  revisedAt: string;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const { contents } = await client.getList<BlogPost>({
    endpoint: 'blog',
    queries: { limit: 100, orders: '-pubDate' },
  });
  return contents;
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  try {
    return await client.get<BlogPost>({ endpoint: 'blog', contentId: id });
  } catch {
    return null;
  }
}

export interface GalleryPhoto {
  id: string;
  image: {
    url: string;
    width?: number;
    height?: number;
  };
  caption?: string;
  publishedAt: string;
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const { contents } = await client.getList<GalleryPhoto>({
    endpoint: 'gallery',
    queries: { limit: 100, orders: '-publishedAt' },
  });
  return contents;
}
