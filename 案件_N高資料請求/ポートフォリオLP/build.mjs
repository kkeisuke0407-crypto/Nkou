// ポートフォリオLPの組み立てスクリプト（Stage12）
//
// 各LPは「そのLP専用の骨格（src.html）」でできている。骨格はLPの型（CP01/CP02/CP04）ごとに違う。
// N高・クラーク・第一学院の詳細や生徒の声など、どのLPでも同じ内容のブロックだけを
// shared/partials/ に置き、骨格の中から次の1行で読み込む。
//
//   <!-- @include nkou-detail.html cta=rank1 -->   … partial を読み込み、中の {{cta}} を rank1 に置き換える
//
// パスの書き方（src.html / partial 共通）
//   {{core}}   … CORE01_記事LP/ への相対パス（parts.css・core01.css・main.js・assets/img/）
//   {{shared}} … shared/ への相対パス（portfolio.css・img/・assets/＝FV背景）
//
//   node 案件_N高資料請求/ポートフォリオLP/build.mjs                 … 各LPフォルダの index.html を作り直す（リポジトリ内プレビュー用）
//   node 案件_N高資料請求/ポートフォリオLP/build.mjs --deploy _site  … 公開用に _site/pf/<slug>/index.html と、
//                                                                     page.json の publishAs（/nkou/compare/ など）に書き出す
//
// LPを追加するときは、同じ型のフォルダをコピーして page.json と src.html を書き換える（README.md 参照）。

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE01_DIR = join(HERE, "..", "CORE01_記事LP");
const SHARED_DIR = join(HERE, "shared");
const PARTIALS_DIR = join(SHARED_DIR, "partials");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const toUrl = (p) => (p.split(sep).join("/") + "/").replace(/^\/$/, "");

// page.json があるフォルダ＝1つのLP
const findPages = (dir) => {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory() || name === "shared") continue;
    if (existsSync(join(p, "page.json"))) out.push(p);
    out.push(...findPages(p));
  }
  return out;
};

const INCLUDE_RE = /^([ \t]*)<!-- @include ([\w.-]+)((?: [\w-]+=[^\s]+)*) -->[ \t]*$/gm;
const expand = (src, depth = 0) => {
  if (depth > 5) throw new Error("@include が深すぎます（循環していないか確認してください）");
  return src.replace(INCLUDE_RE, (_, indent, file, argStr) => {
    const path = join(PARTIALS_DIR, file);
    if (!existsSync(path)) throw new Error(`partial が見つかりません: shared/partials/${file}`);
    let body = readFileSync(path, "utf8").replace(/^<!--[\s\S]*?-->\n/, ""); // 先頭の説明コメントは出力しない
    const args = Object.fromEntries(argStr.trim().split(/\s+/).filter(Boolean).map((kv) => kv.split("=")));
    body = body.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in args ? args[key] : m));
    const left = body.match(/\{\{(?!core\}\}|shared\}\})(\w+)\}\}/);
    if (left) throw new Error(`shared/partials/${file} の ${left[0]} に値が渡されていません`);
    return expand(body.trimEnd(), depth + 1).split("\n").map((l) => (l ? indent + l : l)).join("\n");
  });
};

const render = (pageDir, { core, shared }) => {
  const meta = JSON.parse(readFileSync(join(pageDir, "page.json"), "utf8"));
  const body = expand(readFileSync(join(pageDir, "src.html"), "utf8").trimEnd());
  const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
<!-- 広告の着地用LP。検索結果には出さない -->
<meta name="robots" content="noindex, follow">
<link rel="stylesheet" href="{{core}}parts.css">
<link rel="stylesheet" href="{{shared}}portfolio.css">
</head>
<body data-lp="${meta.lpId}">
<!--
  このファイルは ポートフォリオLP/build.mjs が自動生成します。直接編集しないでください。
  元：${toUrl(relative(HERE, pageDir))}src.html（骨格）＋ shared/partials/（共通ブロック）
  CTAのURLは CORE01_記事LP/main.js の CTA_URL（1カ所）で全LP共通に管理しています。
-->

${body}
</body>
</html>
`;
  return { meta, html: html.replace(/\{\{core\}\}/g, core).replace(/\{\{shared\}\}/g, shared) };
};

const pages = findPages(HERE);
const args = process.argv.slice(2);
const deployIdx = args.indexOf("--deploy");

if (deployIdx >= 0) {
  // 公開用：_site/ 直下にCORE01（parts.css・core01.css・main.js・assets/）がある前提で、_site/pf/ に書き出す
  const out = args[deployIdx + 1];
  if (!out) throw new Error("--deploy の後に出力先フォルダを指定してください");
  const pf = join(out, "pf");
  mkdirSync(join(pf, "shared", "img"), { recursive: true });
  copyFileSync(join(SHARED_DIR, "portfolio.css"), join(pf, "shared", "portfolio.css"));
  for (const sub of ["img", "assets"]) {
    mkdirSync(join(pf, "shared", sub), { recursive: true });
    for (const f of readdirSync(join(SHARED_DIR, sub))) copyFileSync(join(SHARED_DIR, sub, f), join(pf, "shared", sub, f));
  }
  for (const dir of pages) {
    const { meta } = render(dir, { core: "", shared: "" });
    // 公開パス：/pf/<slug>/ に加えて、page.json の publishAs（例："nkou/compare"）にも同じページを書き出す
    for (const path of [`pf/${meta.slug}`, ...(meta.publishAs || [])]) {
      const up = "../".repeat(path.split("/").length);
      const dest = join(out, ...path.split("/"));
      mkdirSync(dest, { recursive: true });
      writeFileSync(join(dest, "index.html"), render(dir, { core: up, shared: `${up}pf/shared/` }).html);
      console.log(`deploy: ${path}/index.html (${relative(HERE, dir)})`);
    }
  }
} else {
  // リポジトリ内プレビュー用：各LPフォルダの index.html を作り直す
  for (const dir of pages) {
    const core = toUrl(relative(dir, CORE01_DIR));
    const shared = toUrl(relative(dir, SHARED_DIR));
    writeFileSync(join(dir, "index.html"), render(dir, { core, shared }).html);
    console.log(`built: ${relative(HERE, dir)}/index.html`);
  }
}
