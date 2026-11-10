// microCMS の本文（HTML）に書いた YouTube のURLを、記事内で再生できる動画に置き換える。
// 段落にURLだけを書く（リンクでもそのままの文字でも可）と、その段落が動画になる。
// 例: <p><a href="https://www.youtube.com/watch?v=XXXXXXXXXXX">https://www.youtube.com/watch?v=XXXXXXXXXXX</a></p>
//     <p>https://youtu.be/XXXXXXXXXXX</p>

const YT_URL = String.raw`https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^"<\s]*?&(?:amp;)?)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})[^"<\s]*`;

// <p> の中身がURL（またはURLだけのリンク）のときだけ置き換える。文中のリンクはそのまま
const PARAGRAPH = new RegExp(
  String.raw`<p>\s*(?:<a\s[^>]*href="${YT_URL}"[^>]*>[^<]*<\/a>|${YT_URL})\s*<\/p>`,
  'g'
);

function youtubeFrame(id: string, vertical: boolean) {
  return (
    `<div class="video-embed${vertical ? ' video-embed--vertical' : ''}">` +
    `<iframe src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube動画" loading="lazy" ` +
    `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
    `referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`
  );
}

// Aqua Develop 体験版：段落に https://emeraldblue.jp/aqua-develop/try/ だけを書くと、記事の中で使えるアプリになる
const TRIAL_PATH = '/aqua-develop/try/';
const TRIAL_URL = String.raw`(?:https?:\/\/(?:www\.)?emeraldblue\.jp)?\/aqua-develop\/try\/?(?:index\.html)?`;
const TRIAL_PARAGRAPH = new RegExp(
  String.raw`<p>\s*(?:<a\s[^>]*href="${TRIAL_URL}"[^>]*>[^<]*<\/a>|${TRIAL_URL})\s*<\/p>`,
  'g'
);

function trialFrame() {
  return (
    `<div class="app-embed">` +
    `<div class="app-embed__bar"><span>Aqua Develop_emeraldblue 体験版</span>` +
    `<a href="${TRIAL_PATH}" target="_blank" rel="noopener">全画面で開く ↗</a></div>` +
    `<iframe src="${TRIAL_PATH}" title="Aqua Develop_emeraldblue 体験版" loading="lazy" allow="fullscreen"></iframe>` +
    `<p class="app-embed__note">RAWファイルを上の画面にドラッグ＆ドロップするか「RAWを開く」から選んでください。` +
    `写真はブラウザの中だけで処理され、どこにも送信されません。パソコン（Chrome／Edge）での利用がおすすめです。` +
    `体験版の書き出しは長辺2048px・透かし入りです。</p></div>`
  );
}

export function embedVideos(html: string): string {
  return html
    .replace(PARAGRAPH, (match, linkId?: string, textId?: string) => {
      const id = linkId ?? textId;
      if (!id) return match;
      return youtubeFrame(id, /\/shorts\//.test(match));
    })
    .replace(TRIAL_PARAGRAPH, () => trialFrame());
}
