# Nkou

N高グループ資料請求案件の専用リポジトリです。

## 運用方針

- 2026-09-27時点で、`hozon` からN高案件に必要なデータ・調査・LP設計・画像素材・LPパーツを移管。
- 以後、**N高案件の制作・修正・Claude/Codex作業はこのリポジトリを正本**として進める。
- `hozon` 側は元資料・アーカイブとして残し、原則としてN高制作の更新先にはしない。
- 既存の相対パスを壊さないため、`案件_N高資料請求/` と `LPパーツ集_体験談ランキング型/` は元の構成を保ってコピーする。

## 主なフォルダ

- `案件_N高資料請求/`：KW、調査、LP設計、画像素材、Claude用指示文
- `LPパーツ集_体験談ランキング型/`：今回の比較LPで使うUIパーツ集

## 現在の制作対象

CORE01「競合比較・比較選び方LP」

現行ベース：
`案件_N高資料請求/Stage8_CoreLP設計/CORE01_競合比較共通パート_CV優先_中高生向け_V4.md`

Claude初稿指示：
`案件_N高資料請求/Stage9_Claude_LP初稿/CLAUDE_CORE01_LP初稿_指示文.md`

## 制作物

- CORE01 記事LP（HTML/CSS/JS）：`案件_N高資料請求/CORE01_記事LP/index.html`
  - 公開URL：https://nko.hakobu-family.com/ （`main` へのpushで `.github/workflows/pages.yml` がLPのファイルだけをGitHub Pagesへデプロイ）
  - 実装メモ・使用画像一覧・3つの壁チェック・ABテスト案：`案件_N高資料請求/CORE01_記事LP/IMPLEMENTATION_NOTES.md`
- サイト情報ページ：/about/（運営者情報・編集方針・広告について）・/privacy/・/contact/（`案件_N高資料請求/ポートフォリオLP/サイト情報/`）。全ページのフッターからリンク
- 橋掛けLP（旧設計・公開停止）：`案件_N高資料請求/橋掛けLP/`

- ポートフォリオLP（Stage12・ポートフォリオごとに骨格を変える新設計）：`案件_N高資料請求/ポートフォリオLP/`（README参照）
  - CP01 王道ランキング /nkou/compare/ ・ CP02 学費 /nkou/fee/ ・ CP04 スクーリングとは /nkou/select/（同じページを /pf/ 以下にも公開。CP03 競合KWは設計のみ）
  - 設計：`案件_N高資料請求/Stage12_ポートフォリオLP再設計/`
