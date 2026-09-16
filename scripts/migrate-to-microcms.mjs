// 既存の src/content/blog/*.md 記事を microCMS に一括登録するワンショット移行スクリプト。
// 実行前に microCMS 側で「blog」APIを作成し、.env に MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY を設定してください。
// 実行: node --env-file=.env scripts/migrate-to-microcms.mjs

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { createClient, createManagementClient } from 'microcms-js-sdk';

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
  console.error('MICROCMS_SERVICE_DOMAIN と MICROCMS_API_KEY が設定されていません。.env を確認してください。');
  process.exit(1);
}

const client = createClient({ serviceDomain, apiKey });
const managementClient = createManagementClient({ serviceDomain, apiKey });

const BLOG_DIR = path.resolve('src/content/blog');
const PUBLIC_DIR = path.resolve('public');

const MIME_TYPES = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

async function uploadEyecatch(localImagePath) {
  const absPath = path.join(PUBLIC_DIR, localImagePath);
  const buffer = readFileSync(absPath);
  const ext = path.extname(localImagePath).toLowerCase();
  const type = MIME_TYPES[ext] ?? 'application/octet-stream';
  const blob = new Blob([buffer], { type });
  const filename = path.basename(localImagePath);
  const { url } = await managementClient.uploadMedia({ data: blob, name: filename });
  return url;
}

async function migrate() {
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  console.log(`${files.length}件の記事を移行します。\n`);

  for (const file of files) {
    const raw = readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    const slug = data.slug ?? file.replace(/\.md$/, '');

    console.log(`[${slug}] 移行中...`);

    let imageUrl;
    if (data.image) {
      console.log(`  アイキャッチ画像をアップロード中: ${data.image}`);
      imageUrl = await uploadEyecatch(data.image);
      console.log(`  -> ${imageUrl}`);
    }

    const bodyHtml = marked.parse(content);

    const payload = {
      title: data.title,
      description: data.description ?? '',
      pubDate: new Date(data.pubDate).toISOString(),
      author: data.author ?? '',
      tags: data.tags ?? [],
      body: bodyHtml,
      ...(imageUrl ? { image: imageUrl } : {}),
    };

    await client.create({
      endpoint: 'blog',
      contentId: slug,
      content: payload,
    });

    console.log(`  ✓ 登録完了 (id: ${slug})\n`);
  }

  console.log('全記事の移行が完了しました。');
}

migrate().catch((err) => {
  console.error('移行中にエラーが発生しました:', err);
  process.exit(1);
});
