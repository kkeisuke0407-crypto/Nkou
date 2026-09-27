# 橋掛けLP

検索意図ごとに **冒頭（title / description / FV / 導入 / 最初のCTA）だけ** を変え、その後はCORE01の共通本文へつなぐLP群。
設計：`../Stage11_橋掛けLP設計/01_橋掛けLP設計_V1.md`

| フォルダ | 対象 | 公開URL | CORE01のどこからつなぐか |
|---|---|---|---|
| `CP02_fee/` | 学費・費用（通信制高校 学費 など） | https://nko.hakobu-family.com/nkou/fee/ | `#axes`（比較ポイント）から |
| `CP01_compare/` | 王道（比較・おすすめ・ランキング・どこがいい） | https://nko.hakobu-family.com/nkou/compare/ | `#empathy`（共感）から＝CORE01とほぼ同じ |
| `CP04_select/` | 選び方 | https://nko.hakobu-family.com/nkou/select/ | `#compare`（3校比較）から |
| `CP03_alternative/` | 競合KW（設計のみ・未実装） | — | CORE01へはつながない（競合名を出さない専用LPが必要） |

## しくみ

- 各フォルダの `fv.html` … そのLP専用の冒頭（FV〜最初のCTA、CORE01へのつなぎの一文）。**編集するのはここだけ**。
- `bridge.css` … 橋掛けFVだけで使う部品（`b-*`）。色・部品はCORE01の `parts.css` / `core01.css` をそのまま使う。
- `build.mjs` … `fv.html` ＋ CORE01の共通本文（指定セクション以降）を組み立てて `index.html` を作る。
- 各フォルダの `index.html` … 自動生成物（リポジトリ内プレビュー用）。**直接編集しない**。
- CORE01本文は複製していないので、CORE01を直せば全LPに反映される。

## 更新手順

```bash
node 案件_N高資料請求/橋掛けLP/build.mjs   # CORE01 や fv.html を変えたら実行して index.html を更新
```

公開（GitHub Pages）は `.github/workflows/pages.yml` が `build.mjs --deploy _site` で毎回組み立て直すので、
公開版は常に最新のCORE01と一致する（`index.html` の更新を忘れても公開版はずれない）。

## CTA・計測（CORE01と共通）

- ASP計測URLは `../CORE01_記事LP/main.js` の `CTA_URL` 1カ所だけ。全LPの全CTAにそのまま入る（独自パラメータは付けない）。
- クリックは `cta_click` イベントで dataLayer / gtag へ。パラメータは `lp_id`（core01 / cp01_compare / cp02_fee / cp04_select）・`cta_position`・`cta_type`・`cta_text`。ASP URLの全文は送らない。
- 流入CPの識別は当サイトのページURL（/nkou/fee/ など）と `lp_id` で行う。
- **GTM / GA4のタグはまだどのページにも入っていない**（dataLayerにpushされるだけで、Analyticsには届かない）。配信前にGTMを入れ、`cta_click` をトリガーに `lp_id × cta_position` をGA4へ送る設定をする。

## 検索結果の扱い

橋掛けLPは広告の着地用で、本文の大部分がCORE01と同じなので `noindex, follow` を付けている。
