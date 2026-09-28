# N高PPC｜MCV計測仕様 V1

更新日: 2026-09-28

## 目的
Google AdsのSmart Bidding（CV最大化＋tCPA）が、LPからN高グループ資料請求ページへ進むユーザーを学習できるよう、CTAクリックをMCVとして計測する。

## 現状
- `CORE01_記事LP/main.js` は、すべての `a[data-cta]` クリック時に `cta_click` を `dataLayer` へpush済み。
- 送信項目: `lp_id`, `cta_position`, `cta_type`, `cta_text`
- ASP URL全文は計測イベントへ送らない。
- GTM / GA4タグは未設置。
- `CTA_URL` は現在 `"#"`。本番前にA8計測URLへ置換必須。

## 採用するMCV
- Google Ads conversion action名: `N高(mcv) affiliate_click`
- 発火条件: custom event `cta_click`
- Action optimization: Primary
- Campaign goal: CP01〜CP04すべてでこのMCVを選択
- Count: One
- Value: 初期は固定値なし（件数最適化）
- 最終CV（ASP成果）は別管理し、MCV→CV率を後で評価する。

## 実装
1. GTMコンテナを全LPへ設置
2. Google tagをAll Pagesで設置
3. Google Adsで `N高(mcv) affiliate_click` を作成
4. GTMで Google Ads Conversion Tracking tag
   - Conversion ID: Google Ads側から取得
   - Conversion Label: 上記conversion actionから取得
   - Trigger: Custom Event = `cta_click`
5. 必要なら同じ `cta_click` をGA4にも送る。ただし入札用はGoogle Ads直接計測を正本にし、GA4インポートをPrimaryに重ねない。
6. Tag Assistant / GTM Previewで全CTA位置を検証。

## 検証項目
- rank1 / compare_table / fee_example / answer / nkou_detail / final / sticky など全CTAで1クリック1イベント
- `lp_id` がLPごとに正しい
- ASP URLに独自query parameterを付けない
- 計測失敗でCTA遷移を止めない
- 広告クリック由来のGCLID等を保持できている
- Google Ads診断でconversion actionがActiveになる

## 本番投入前に必要な値
- GTM Container ID（GTM-XXXXXXX）
- Google Ads Conversion ID（AW-XXXXXXXXX）
- Conversion Label
- A8のN高資料請求計測URL

この4つが揃ったら、コードとGTM設定を確定する。
