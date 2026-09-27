# ポートフォリオLP（Stage12）

ポートフォリオ（CP01〜CP04）ごとに**LPの骨格そのものを変える**LP群。
設計：`../Stage12_ポートフォリオLP再設計/`（旧設計の橋掛けLP `../橋掛けLP/` は公開中のため残している）

| フォルダ | 型 | 対象KW | 確認用URL（mainマージ後） | lp_id |
|---|---|---|---|---|
| `CP01_王道ランキング/` | ジャンル王道（比較表→ランキング） | 比較・おすすめ・ランキング・どこがいい | /pf/cp01/ | pf_cp01_ranking |
| `CP02_その他ジャンル/fee/` | その他ジャンル（答え→比較→ランキング） | 学費・費用・授業料 | /pf/cp02-fee/ | pf_cp02_fee |
| `CP03_競合/` | 競合KW（設計のみ） | 学校名＋学費／口コミ | — | — |
| `CP04_インテント/schooling/` | インテント（答え→N高単品） | スクーリングとは・スクーリング 少ない | /pf/cp04-schooling/ | pf_cp04_schooling |

URLは https://nko.hakobu-family.com/ の下。どれも `noindex`。

## しくみ

- `page.json` … slug・lp_id・title・description
- `src.html` … そのLPの骨格（セクションの順番とKW専用の文章）。**編集するのはここ**
- `shared/partials/*.html` … どのLPでも同じ内容のブロック。`<!-- @include nkou-detail.html cta=rank1 -->` の形で読み込む（`cta=` はCTA位置名）
- `shared/portfolio.css` … 追加スタイル（共通FVの portfolio-hero と、最小限の c1-*）
- `shared/assets/hero-bg.webp`（＋SP・低解像度向け `hero-bg-960.webp`）… 全LP共通のFV背景（16:9、文字なし）。見出しはHTMLで重ねる
- `index.html` … 自動生成物（リポジトリ内プレビュー用）。**直接編集しない**
- CSS・JS・N高画像は `../CORE01_記事LP/` のもの（parts.css・core01.css・main.js・assets/img/）を使う

| partial | 中身 | 使っているLP |
|---|---|---|
| `compare-table.html` | 3校比較表（5項目） | CP01 |
| `nkou-detail.html` | N高詳細（バナー・特徴・基本情報・コース・変更ルール・メンター・生徒の声1件・CTA） | CP01・CP02（1位）、CP04 |
| `clark-detail.html` / `daiichi-detail.html` | クラーク／第一学院の詳細（写真・特徴・基本情報・公式情報から見える特徴） | CP01・CP02（2位・3位） |
| `nkou-voices.html` | 生徒の声2件 | CP01・CP04 |
| `nkou-life.html` | キャンパス・課外活動・進路 | CP01 |
| `nkou-caution.html` | 全員向けではない・スクーリング・学費・地域差 | CP01 |
| `nkou-fee-table.html` | 初年度の実質負担モデル表（支援金注記つき） | CP01・CP02 |
| `why-now.html` | 出願期間・学校選びの流れ・資料で見るところ | CP01・CP02 |
| `final-cta.html` / `header.html` / `footer.html` | 最終CTA、サイト名帯、フッター・SP固定CTA・main.js | 全LP |

## 更新手順

```bash
node 案件_N高資料請求/ポートフォリオLP/build.mjs   # src.html や partial を変えたら実行して index.html を更新
```

公開は `.github/workflows/pages.yml` が `build.mjs --deploy _site` で毎回組み立て直す（/pf/ 以下）。

## LPを追加するとき

同じ型のフォルダをコピーして `page.json`（slugとlpIdは重複させない）と `src.html` のKW専用部分を書き換え、上のコマンドを実行する。
例：CP04「高校 オンライン授業」→ `CP04_インテント/schooling/` をコピーして `online/` に。FV・答え・詳しい説明・選ぶときの注意・「N高の場合」を書き換え、N高詳細・生徒の声・最終CTAは include のまま。

## CTA・計測（CORE01と共通）

- ASP計測URLは `../CORE01_記事LP/main.js` の `CTA_URL` 1カ所だけ（現在 `"#"`）。独自パラメータは付けない。
- クリックは `cta_click` で dataLayer へ。`lp_id` と `cta_position`（rank1／life／fee_example／answer／nkou_detail／final／sticky など）で区別。ASP URLは送らない。
- SP固定CTAは、`data-sticky-start` を付けたセクション（CP01：比較表、CP02：答え、CP04：N高の場合）を読み始めたら出る。
- クラーク・第一学院の詳細には公式サイトへの誘導リンクを置いていない（出典は基本情報の下の小さい注記にドメイン名で記載）。
- 比較表（CP01・CP02）の N高の行の小さいボタンは `data-cta="compare_table"`。
- GTM / GA4 のタグは、まだどのページにも入っていない。

## 素材

- `shared/assets/hero-bg.webp`：ユーザー提供の「青空と学びのキャンパス風景」（1672×941。受け取ったWebPをそのまま使用）。`hero-bg-960.webp` はその縮小版（960×540・品質82）。実在の生徒の写真ではないため、FV右下に「※写真はイメージです」を表示。

- N高の画像・生徒の声・事実はCORE01で確認済みのものを再利用（`CORE01_記事LP/IMPLEMENTATION_NOTES.md` の画像一覧・事実の出典を参照）。
- `shared/img/clark_campus_sapporo_shiroishi_ccbysa.webp`：Wikimedia Commons「Clark Memorial International High School Sapporo Shiroishi Campus.jpg」撮影：禁樹なずな／CC BY-SA 4.0（640px）。
- `shared/img/daiichi_campus_yabu_ccbysa.webp`：Wikimedia Commons「Daiichi Gakuin high school Yabu campus.jpg」撮影：KASEI（2012年10月）／CC BY-SA 3.0（640px）。
- 比較表のロゴ（CP01・CP02の学校名セル。切り抜き・加工せず元の比率で表示。使用可否＝各校のロゴ利用ルールは要確認）
  - `shared/img/nkou_logo_nhighschool_official.svg`：N高等学校のロゴ（nnn.ed.jp/images/logos/logo_nhighschool.svg、2026-09-27取得）
  - `shared/img/clark_logo_official.webp`：クラーク記念国際高等学校の公式ロゴ（ユーザー提供・641×89）
  - `shared/img/daiichi_logo_official.svg`：第一学院高等学校のロゴ（daiichigakuin.ed.jp/assets/images/daiichi_logo01.svg、2026-09-27取得）
- CC BY-SAの表示として、写真の直下に作者・ライセンス（リンク）・出典・「縮小・トリミングして使用」を記載している。競合校の公式サイトの画像は使っていない。

## クラーク・第一学院の確認済み事実（2026年9月27日・公式サイト）

| 学校 | 事実 | ページ |
|---|---|---|
| クラーク | 本校：北海道深川。全国70を超える教育拠点で1万人以上が学ぶ。2021年度からスマートスタディコース | クラークの特徴（/feature/） |
| クラーク | 3つの通学スタイル：週5日通学（全日型・制服）／スマートスタディ（オンライン＋通学）／単位修得（月1・2回程度登校） | 自分で選べる通学スタイル（/learning-style/） |
| クラーク | スマートスタディはキャンパスにより週1〜5日。コーチング担任。Zoomのライブ授業＋アーカイブ | スマートスタディ（/lp/clark-smart/） |
| クラーク | 単位修得：年間登校20日程度、年間学費30,000円〜（25単位・支援金減免後）、担任制、Web学習（動画） | 単位修得コース（/learning-style/credit-based/） |
| クラーク | 2027年度新入生モデル（支援金対象）：スマートスタディⅠ 162,800円／Ⅱ 378,300円。週5日は拠点ごとの募集要項。北海道地区は異なる | 学費について（/gakuhi/） |
| クラーク | コース変更は可能（時期はキャンパス・コースで異なる、トライアル期間あり）。パーソナルティーチャー制度。スクーリングは原則在籍キャンパス | よくある質問（/faq/） |
| 第一学院 | 本校：茨城県高萩市・兵庫県養父市。全国68キャンパス（2026年4月時点、提携・グループ内含む） | 学校概要（/about/outline/） |
| 第一学院 | 通学スタイル：スタンダード（最大週5日）／ベーシック（最大週2日）、プレミアム（週5日）、本校通学コース（週1日）。オンラインスタイル：Mobile HighSchool | コース紹介（/course/） |
| 第一学院 | 登校日・登校日数はいつでも変更可能。心理カウンセラー資格の教員（フェロー）。学費は「コースによって異なる。資料を確認」 | よくある質問（/faq/） |
| 第一学院 | Mobile HighSchool：オンライン学習室、Slackで質問、担任制、オンライン担任面談、スクーリングは高萩校・養父校 | Mobile HighSchool（/course/mobilehighschool/） |
| 第一学院 | 入学手続き時に就学支援金相当額を差し引いた額を納入。学費の詳細は募集要項 | 入学案内（/guide/） |

比較表の「通うペース」のクラーク欄は、CORE01の「全日型は週5、スマートスタディは拠点により週1〜5日など」に、今回確認した単位修得（月1・2回程度）を加えた（CORE01本体は変更していない）。
