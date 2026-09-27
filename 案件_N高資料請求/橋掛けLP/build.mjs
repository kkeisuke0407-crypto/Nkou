// 橋掛けLPの組み立てスクリプト
//
// 各LPは「そのLP専用の冒頭（fv.html）」＋「CORE01の共通本文（指定セクション以降）」でできている。
// CORE01本文は複製して手で直さず、毎回 CORE01_記事LP/index.html から切り出して組み立てる。
//
//   node 案件_N高資料請求/橋掛けLP/build.mjs            … 各フォルダの index.html を作り直す（リポジトリ内プレビュー用）
//   node 案件_N高資料請求/橋掛けLP/build.mjs --deploy _site  … 公開用に _site/nkou/<slug>/index.html を書き出す
//
// CORE01 や fv.html を変えたら、このスクリプトを実行して index.html を更新する。
// 公開（GitHub Pages）では workflow が --deploy で毎回組み立て直すので、公開版は常に最新の CORE01 と一致する。

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE01_DIR = join(HERE, "..", "CORE01_記事LP");
const CORE01_HTML = readFileSync(join(CORE01_DIR, "index.html"), "utf8");

// LPごとの設定。startFrom = CORE01のどのセクションから共通本文につなぐか
const LPS = [
  {
    dir: "CP02_fee",
    slug: "fee",
    lpId: "cp02_fee",
    title: "高校の学費はコースと通い方で変わる｜N高・クラーク・第一学院の比べ方",
    description:
      "高校の学費は、ネット中心・週1＋・週3・週5などコースと通い方で大きく変わります。中3・2027年4月の新入学向けに、学費の見方を整理してからN高グループ・クラーク記念国際・第一学院の通い方を比較しました。",
    startFrom: "axes",
  },
  {
    dir: "CP01_compare",
    slug: "compare",
    lpId: "cp01_compare",
    title: "N高・クラーク・第一学院を比較｜自分に合う高校は？",
    description:
      "中3・2027年4月の高校入学を考えている人向けに、N高グループ・クラーク記念国際・第一学院を「家中心で学べるか」「通う回数」「途中で通い方を変えられるか」などで比較しました。",
    startFrom: "empathy",
  },
  {
    dir: "CP04_select",
    slug: "select",
    lpId: "cp04_select",
    title: "高校選びで迷ったら「通い方」から｜N高・クラーク・第一学院を比較",
    description:
      "高校選びで迷ったら、まず「家中心がいいか」「週何日通いたいか」「途中で通い方を見直せるか」から。中3・2027年4月の新入学向けに、N高グループ・クラーク記念国際・第一学院を比べました。",
    startFrom: "compare",
  },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// CORE01から部品を切り出す
const between = (src, start, end) => {
  const i = src.indexOf(start);
  const j = src.indexOf(end, i + start.length);
  if (i < 0 || j < 0) throw new Error(`CORE01の構造が想定と違います: ${start} … ${end}`);
  return src.slice(i, j);
};
const header = between(CORE01_HTML, '<header class="mt-sitebar', "\n\n<main");
const prNote = between(CORE01_HTML, "  <!-- ============ 0. PR表記", "  <!-- ============ 1. FV");
const afterMain = CORE01_HTML.slice(CORE01_HTML.indexOf("</main>"), CORE01_HTML.indexOf('<script src="main.js"'));

const sectionFrom = (id) => {
  // 目的セクション直前のコメント行から </main> の手前までを共通本文として使う
  const re = new RegExp(`\\n  <!-- =+[^\\n]*-->\\n  <section[^>]*id="${id}"`);
  const m = CORE01_HTML.match(re);
  if (!m) throw new Error(`CORE01にセクション #${id} が見つかりません`);
  const start = m.index + 1;
  return CORE01_HTML.slice(start, CORE01_HTML.indexOf("</main>"));
};

// coreBase: CORE01の共通CSS/JS/画像への相対パス、bridgeBase: bridge.css への相対パス
const render = (lp, { coreBase, bridgeBase }) => {
  const fv = readFileSync(join(HERE, lp.dir, "fv.html"), "utf8").trimEnd();
  const body = [
    header,
    "",
    '<main class="mt-body c1-wrap">',
    "",
    prNote.trimEnd(),
    "",
    `  <!-- ============ 1. 橋掛けFV（${lp.dir}専用。ここより下はCORE01の共通本文：#${lp.startFrom}〜） ============ -->`,
    fv,
    "",
    sectionFrom(lp.startFrom).trimEnd(),
    "",
    afterMain.trimEnd(),
    "",
    `<script src="${coreBase}main.js" defer></script>`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(lp.title)}</title>
<meta name="description" content="${esc(lp.description)}">
<!-- 広告の着地用。本文の大部分がCORE01と共通なので検索結果には出さない -->
<meta name="robots" content="noindex, follow">
<link rel="stylesheet" href="${coreBase}parts.css">
<link rel="stylesheet" href="${coreBase}core01.css">
<link rel="stylesheet" href="${bridgeBase}bridge.css">
</head>
<body data-lp="${lp.lpId}">
<!--
  このファイルは build.mjs が自動生成します。直接編集しないでください。
  冒頭（FV〜最初のCTA）は ${lp.dir}/fv.html、以降の本文は CORE01_記事LP/index.html が元です。
  CTAのURLは CORE01_記事LP/main.js の CTA_URL（1カ所）で全LP共通に管理しています。
-->

${body}
</body>
</html>
`;
  // CORE01の画像パスを、このLPから見た相対パスに置き換える
  return html.replace(/src="assets\/img\//g, `src="${coreBase}assets/img/`);
};

const args = process.argv.slice(2);
const deployIdx = args.indexOf("--deploy");

if (deployIdx >= 0) {
  // 公開用：_site/ 直下にCORE01（index.html・CSS・JS・画像）がある前提で、_site/nkou/<slug>/ に書き出す
  const out = args[deployIdx + 1];
  if (!out) throw new Error("--deploy の後に出力先フォルダを指定してください");
  mkdirSync(join(out, "nkou"), { recursive: true });
  copyFileSync(join(HERE, "bridge.css"), join(out, "nkou", "bridge.css"));
  for (const lp of LPS) {
    const dest = join(out, "nkou", lp.slug);
    mkdirSync(dest, { recursive: true });
    writeFileSync(join(dest, "index.html"), render(lp, { coreBase: "../../", bridgeBase: "../" }));
    console.log(`deploy: nkou/${lp.slug}/index.html (${lp.dir})`);
  }
} else {
  // リポジトリ内プレビュー用：各フォルダの index.html を作り直す
  for (const lp of LPS) {
    writeFileSync(join(HERE, lp.dir, "index.html"), render(lp, { coreBase: "../../CORE01_記事LP/", bridgeBase: "../" }));
    console.log(`built: ${lp.dir}/index.html`);
  }
}
