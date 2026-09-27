// 「体験談ランキング型」記事LPのパーツ集（mtmt.site の見せ方を参考に自作。文章・画像は流用しない）
const fs = require("fs");
const OUT_DIR = __dirname.split(String.fromCharCode(92)).join("/") + "/";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const dedent = (s) => { const l = s.replace(/^\n+|\s+$/g, "").split("\n"); const m = Math.min(...l.filter((x) => x.trim()).map((x) => x.match(/^ */)[0].length)); return l.map((x) => x.slice(m)).join("\n"); };

const PARTS_CSS = `
/* ============================================================
   体験談ランキング型LP パーツ（mt-*）
   色：青=見出し・ボタン／赤=強調・注意／黄=マーカー
   ============================================================ */
:root {
  --mt-blue: #0066bf; --mt-blue-2: #007bff; --mt-blue-bg: #eef5fc;
  --mt-red: #e2231a; --mt-red-bg: #fdeeee;
  --mt-mark: #fff100; --mt-yellow-bg: #fffbe0; --mt-orange: #f5a623;
  --mt-ink: #222; --mt-sub: #777; --mt-rule: #dcdcdc;
  --mt-font: "Hiragino Sans", "ヒラギノ角ゴ ProN W3", "Noto Sans JP", Meiryo, sans-serif;
}
.mt-body { font-family: var(--mt-font); color: var(--mt-ink); font-size: 16px; line-height: 1.9; }
.mt-body p { margin: 0 0 1.2em; }

/* 見出し */
.mt-h2 { margin: 2em -8px 1em; padding: 13px 13px 12px; border-radius: 2px; background: var(--mt-blue); color: #fff; font-size: 21px; font-weight: 700; line-height: 1.45; }
.mt-h3 { margin: 1.8em 0 .9em; padding: 0 8px 5px; border-bottom: 3px solid var(--mt-blue); font-size: 18.5px; font-weight: 700; line-height: 1.5; }
.mt-h3__rank { margin-right: .2em; }
.mt-h4 { margin: 1.6em 0 .8em; padding: 2px 8px; border-left: 4px solid var(--mt-blue); font-size: 17px; font-weight: 700; line-height: 1.5; }
.mt-h4 em { font-style: normal; color: var(--mt-red); background: linear-gradient(transparent 60%, var(--mt-mark) 60%); }

/* 強調 */
.mt-mark { font-weight: 700; background: linear-gradient(transparent 55%, var(--mt-mark) 55%); }
.mt-red { color: var(--mt-red); font-weight: 700; }
.mt-worry { margin: 1em 0 .8em !important; color: var(--mt-red); font-size: 18px; font-weight: 700; line-height: 1.6; }
.mt-oneline { margin: 1.2em 0 !important; font-size: 18px; font-weight: 700; line-height: 1.6; }
.mt-oneline span { background: linear-gradient(transparent 55%, var(--mt-mark) 55%); }
.mt-small { font-size: 12px !important; color: var(--mt-sub); line-height: 1.6 !important; }

/* 横スクロール比較表 */
.mt-hint { margin: .6em 0 .3em !important; text-align: center; font-size: 13px !important; font-weight: 700; color: #555; }
.mt-hint::before, .mt-hint::after { content: "👈"; margin: 0 .3em; }
.mt-hint::after { content: "👉"; }
.mt-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; border: 1px solid var(--mt-rule); }
.mt-table { border-collapse: collapse; min-width: 640px; font-size: 13px; line-height: 1.5; background: #fff; }
.mt-table th, .mt-table td { padding: .6em .5em; border: 1px solid var(--mt-rule); text-align: center; vertical-align: middle; }
.mt-table thead th { background: #fbeaea; font-weight: 700; white-space: nowrap; }
.mt-table th:first-child, .mt-table td:first-child { position: sticky; left: 0; z-index: 1; background: #fff; min-width: 5.5em; }
.mt-table thead th:first-child { background: #fbeaea; }
.mt-table tr.is-pick td { background: #fffdf0; }
.mt-table tr.is-pick td:first-child { background: #fffdf0; }
.mt-ico { display: grid; place-items: center; width: 44px; height: 44px; margin: 0 auto .3em; border-radius: 10px; color: #fff; font-weight: 900; font-size: 20px; }
.mt-mini-btn { display: inline-block; padding: 4px 10px; border-radius: 4px; background: var(--mt-blue-2); color: #fff !important; font-size: 12px; font-weight: 700; text-decoration: none; white-space: nowrap; }
.mt-stars { display: block; color: var(--mt-orange); letter-spacing: .05em; }
.mt-score { display: block; color: var(--mt-red); font-size: 16px; font-weight: 900; }
.mt-badge { display: inline-block; margin-top: .2em; padding: .1em .5em; border-radius: 4px; background: var(--mt-red); color: #fff; font-size: 11px; font-weight: 700; }
.mt-name { color: var(--mt-blue); font-weight: 700; text-decoration: underline; }

/* 結論ボックス */
.mt-conclusion { margin: 1.4em 0; padding: 1em 1.1em; border: 2px dashed var(--mt-orange); border-radius: 6px; background: var(--mt-yellow-bg); }
.mt-conclusion__ttl { margin: 0 0 .4em !important; color: var(--mt-red); font-weight: 900; }
.mt-conclusion p { margin: 0 0 .6em; font-size: 15px; line-height: 1.8; }
.mt-conclusion p:last-child { margin: 0; }
.mt-conclusion a { color: var(--mt-blue); font-weight: 700; }

/* 良い／悪い口コミ */
.mt-voice { position: relative; margin: 2em 0 1.2em; padding: 1.4em 1em .8em; border: 2px solid #9cc3e8; border-radius: 12px; background: #fff; }
.mt-voice--bad { border-color: #f0a9a5; }
.mt-voice__lbl { position: absolute; top: -.95em; left: 1em; display: inline-flex; align-items: center; gap: .35em; padding: .1em .8em .1em .3em; border-radius: 999px; background: #fff; color: var(--mt-blue); font-weight: 900; font-size: 15px; }
.mt-voice--bad .mt-voice__lbl { color: var(--mt-red); }
.mt-voice__lbl i { display: grid; place-items: center; width: 1.6em; height: 1.6em; border-radius: 50%; background: var(--mt-blue); color: #fff; font-style: normal; font-size: 13px; }
.mt-voice--bad .mt-voice__lbl i { background: var(--mt-red); }
.mt-voice ul { margin: 0; padding-left: 1.2em; }
.mt-voice li { margin: 0 0 .5em; font-size: 15px; line-height: 1.7; }
.mt-voice li::marker { color: var(--mt-orange); }
.mt-voice li small { color: var(--mt-sub); }
.mt-more summary { cursor: pointer; text-align: right; font-size: 14px; font-weight: 700; color: var(--mt-blue); list-style: none; }
.mt-more summary::-webkit-details-marker { display: none; }

/* ランキング：バナー＋PR */
.mt-banner { position: relative; display: block; margin: .8em 0 1.2em; line-height: 0; }
.mt-banner__img { display: grid; place-items: center; aspect-ratio: 16 / 9; border-radius: 4px; background: linear-gradient(135deg, #cfe3f7, #f8d7e3); color: #555; font-size: 14px; line-height: 1.5; }
.mt-banner__pr { position: absolute; top: 6px; right: 6px; padding: 0 .4em; background: rgba(0,0,0,.55); color: #fff; font-size: 11px; line-height: 1.6; }

/* 写真3枚（お店・実物） */
.mt-photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin: 1em 0 .3em; }
.mt-photos img { display: block; width: 100%; aspect-ratio: 3 / 2; object-fit: cover; border-radius: 4px; }

/* 特徴リスト（黄色い箱） */
.mt-points { margin: 1.2em 0; padding: 1em 1.1em .6em; border-radius: 6px; background: var(--mt-yellow-bg); }
.mt-points ul { margin: 0; padding: 0; list-style: none; }
.mt-points li { position: relative; margin: 0 0 .5em; padding-left: 1.3em; font-size: 15px; line-height: 1.7; }
.mt-points li::before { content: ""; position: absolute; left: .2em; top: .6em; width: .55em; height: .55em; border-radius: 50%; background: var(--mt-orange); }

/* CTA */
.mt-cta { margin: 1.6em 0; text-align: center; }
.mt-cta__micro { margin: 0 0 .4em !important; font-size: 14px; font-weight: 700; color: #333; }
.mt-cta__btn { display: block; max-width: 22em; margin: 0 auto; padding: 1em .8em; border-radius: 8px; background: var(--mt-blue-2); box-shadow: 0 4px 0 #0056b3; color: #fff !important; font-size: 17px; font-weight: 900; line-height: 1.4; text-decoration: none; }
.mt-cta__btn:active { transform: translateY(2px); box-shadow: 0 2px 0 #0056b3; }
/* 光が走るアニメーション（動きを減らす設定の人には出さない） */
.mt-cta__btn { position: relative; overflow: hidden; isolation: isolate; }
.mt-cta__btn::after { content: ""; position: absolute; top: 0; left: -80%; z-index: -1; width: 50%; height: 100%; background: linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.6) 50%, rgba(255,255,255,0) 100%); transform: skewX(-20deg); animation: mt-shine 2.8s ease-in-out infinite; }
@keyframes mt-shine { 0% { left: -80%; } 55%, 100% { left: 130%; } }
@media (prefers-reduced-motion: reduce) { .mt-cta__btn::after { animation: none; display: none; } }
.mt-cta__note { margin: .5em 0 0 !important; font-size: 12px; font-weight: 700; color: var(--mt-red); }
.mt-textlink { margin: 1.2em 0 !important; font-weight: 700; line-height: 1.6 !important; }
.mt-textlink a { color: var(--mt-blue); text-decoration: underline; }
.mt-textlink small { display: block; font-size: 12px; font-weight: 400; color: var(--mt-sub); }
.mt-cta-stack .mt-cta { margin: 0 0 1.4em; }

/* 会話（メッセージ例） */
.mt-chat { margin: 1.2em 0; padding: .9em .8em; border-radius: 12px; background: #eef1f6; }
.mt-chat__ttl { margin: 0 0 .6em !important; font-size: 14px; font-weight: 900; }
.mt-chat__m { display: flex; margin: 0 0 .6em; }
.mt-chat__m--r { justify-content: flex-end; }
.mt-chat__b { max-width: 78%; padding: .5em .8em; border-radius: 14px; background: #fff; font-size: 14.5px; line-height: 1.6; }
.mt-chat__m--r .mt-chat__b { background: #8de055; }
.mt-chat__tip { margin: -.2em 0 .7em !important; font-size: 12px !important; color: var(--mt-red); line-height: 1.5 !important; }

/* 体験談ボックス */
.mt-story { margin: 1.2em 0; padding: 1em 1.1em; border-left: 5px solid var(--mt-blue); background: var(--mt-blue-bg); }
.mt-story__who { margin: 0 0 .5em !important; font-size: 13px; font-weight: 700; color: var(--mt-blue); }
.mt-story p { font-size: 15px; line-height: 1.8; }
.mt-story p:last-child { margin: 0; }

/* 登録手順 */
.mt-steps { margin: 1.2em 0; padding: 0; list-style: none; counter-reset: mtstep; }
.mt-steps li { position: relative; margin: 0 0 .5em; padding: .55em .8em .55em 2.8em; border: 1px solid var(--mt-rule); border-radius: 8px; background: #fff; font-size: 15px; line-height: 1.6; }
.mt-steps li::before { counter-increment: mtstep; content: counter(mtstep); position: absolute; left: .7em; top: 50%; transform: translateY(-50%); display: grid; place-items: center; width: 1.6em; height: 1.6em; border-radius: 50%; background: var(--mt-blue); color: #fff; font-size: 13px; font-weight: 900; }
.mt-steps li small { color: var(--mt-sub); }

/* 画像＋手書き風の注釈 */
.mt-shot { position: relative; margin: 1.2em auto; max-width: 18em; }
.mt-shot__img { display: grid; place-items: center; aspect-ratio: 9 / 14; border-radius: 16px; border: 6px solid #222; background: repeating-linear-gradient(0deg, #fff 0 44px, #f1f1f1 44px 46px); color: #999; font-size: 13px; }
.mt-shot__note { position: absolute; right: -6px; bottom: 18%; padding: .2em .5em; transform: rotate(-8deg); color: #fff; background: var(--mt-red); border-radius: 6px; font-size: 18px; font-weight: 900; line-height: 1.3; box-shadow: 0 3px 8px rgba(0,0,0,.2); }

/* アイキャッチ（悩みの吹き出し） */
.mt-eyecatch { display: grid; place-items: center; aspect-ratio: 16 / 10; margin: .6em 0 1.2em; border-radius: 4px; background: linear-gradient(135deg, #fde2e4, #e2ecfb); }
.mt-eyecatch__bubble { padding: .6em 1.2em; border: 3px solid #222; border-radius: 999px; background: #fff; font-size: 24px; font-weight: 900; }

/* ヘッダー／フッター帯・関連記事 */
.mt-sitebar { padding: .7em; background: var(--mt-blue); color: #fff; text-align: center; font-weight: 700; }
.mt-related { margin: 1.2em 0; padding: 0; list-style: none; border-top: 1px solid var(--mt-rule); }
.mt-related li { border-bottom: 1px solid var(--mt-rule); }
.mt-related a { display: block; padding: .7em .3em; color: var(--mt-ink); font-size: 14.5px; text-decoration: none; }
.mt-related a::before { content: "›"; margin-right: .5em; color: var(--mt-blue); font-weight: 900; }
`;

const CH = [];
const ch = (id, title, lead) => CH.push({ id, title, lead, parts: [] });
const part = (o) => CH[CH.length - 1].parts.push(o);

ch("head", "A. 見出し", "見出しは青でそろえる。h2＝青ベタ帯、h3＝青い下線、h4＝左の青線。");
part({ name: "大見出し（青ベタ帯）", cls: "mt-h2", when: "セクションの始まり。", rule: "1セクションに1つ。20字前後。", ng: "青以外の色にする", html: `<h2 class="mt-h2">サービスA vs 人気サービス</h2>` });
part({ name: "中見出し・順位見出し（青い下線）", cls: "mt-h3", when: "ランキングの各順位／h2の中の小分け。", rule: "順位はメダルの絵文字＋「第◯位：サービス名｜ひとこと」。", ng: "順位見出しにひとことを入れない", html: `<h3 class="mt-h3"><span class="mt-h3__rank">🥇</span>第1位：サービスA｜登録初日に予定が決まった</h3>` });
part({ name: "小見出し（左の青線）", cls: "mt-h4", when: "順位の中で話題を変えるとき。", rule: "キーワードを1つだけ赤＋マーカーに。", ng: "赤を2か所以上", html: `<h4 class="mt-h4">毎日増える「<em>新しい会員</em>」をねらえ！</h4>` });

ch("text", "B. 本文と強調", "語りかける口調。赤＝強調、黄マーカー＝結論。");
part({ name: "悩みの問いかけ（赤）", cls: "mt-worry", when: "記事の冒頭。読者の悩みをそのまま言う。", rule: "カギカッコで2行まで。", ng: "3行以上", html: `<p class="mt-worry">「本当に会えるの？」<br>「そもそも相手が見つからない…」</p>` });
part({ name: "黄マーカー太字", cls: "mt-mark", when: "そのセクションの結論・答え。", rule: "1セクションに2か所まで。", ng: "段落ごとに付ける", html: `<p>私が悩みから抜け出せた理由、それは<span class="mt-mark">ちゃんと会えるサービス</span>を見つけたからです。</p>` });
part({ name: "赤文字", cls: "mt-red", when: "意外な事実・数字・注意。", rule: "1段落に1か所。", ng: "マーカーと同じ語に重ねる", html: `<p>ところが、サービスを変えただけで<span class="mt-red">驚くほど簡単に</span>会えるようになりました。</p>` });
part({ name: "ひとことの強調（1行）", cls: "mt-oneline", when: "学んだこと・一番言いたいことを1行で。", rule: "前後に「ということ。」などの受けの文を置く。", ng: "長い文", html: `<p class="mt-oneline"><span>「ちゃんと会いたい」</span></p>` });
part({ name: "注記（小さい灰色）", cls: "mt-small", when: "PR表記・年齢制限・個人の感想など。", rule: "冒頭のPR表記は必ず入れる。", ng: "PR表記を省く", html: `<p class="mt-small">※18歳未満の方はご利用いただけません。<br>※本ページにはプロモーションが含まれています。</p>` });
part({ name: "アイキャッチ（悩みの吹き出し）", cls: "mt-eyecatch", when: "タイトル直下。", rule: "吹き出しは「◯◯って本当？」の問い1つ。実際は画像にする。", ng: "文字を詰め込む", html: `<div class="mt-eyecatch"><span class="mt-eyecatch__bubble">◯◯って会える…？</span></div>` });

ch("compare", "C. 比較・結論", "表で一覧 → 結論ボックスで答えを言い切る。");
part({ name: "横スクロール比較表", cls: "mt-scroll + mt-table", when: "記事の最初の h2 の直後。", rule: "左の列（サービス名）は固定。上下に「横にスクロール」の案内。推す行に is-pick。", ng: "スマホで横スクロールの案内を出さない", html: `<p class="mt-hint">表は横にスクロール可能</p>
<div class="mt-scroll">
  <table class="mt-table">
    <thead><tr><th>サービス</th><th>総合評価</th><th>無料で<br>会えた人数</th><th>会いやすさ</th><th>安全性</th><th>年齢層</th></tr></thead>
    <tbody>
      <tr class="is-pick"><td><span class="mt-ico" style="background:#1e88e5">A</span><a class="mt-mini-btn" href="#sample">無料登録</a></td><td><span class="mt-name">サービスA</span><span class="mt-stars">★★★★★</span><span class="mt-score">97点</span><span class="mt-badge">人気No.1</span></td><td>2人</td><td>めちゃ会える</td><td>安全</td><td>20〜60代</td></tr>
      <tr><td><span class="mt-ico" style="background:#8e24aa">B</span><a class="mt-mini-btn" href="#sample">無料登録</a></td><td><span class="mt-name">サービスB</span><span class="mt-stars">★★★★☆</span><span class="mt-score">93点</span></td><td>2人</td><td>会える</td><td>安全</td><td>20〜30代</td></tr>
    </tbody>
  </table>
</div>
<p class="mt-hint">表は横にスクロール可能</p>` });
part({ name: "結論ボックス（点線）", cls: "mt-conclusion", when: "比較表のすぐ下。", rule: "【結論】＋2段落。2段落目で「初心者なら◯◯」と1つに絞る。", ng: "推しを2つ以上にする", html: `<div class="mt-conclusion"><p class="mt-conclusion__ttl">【結論】</p><p>「サービスX」は、運が良ければ会えるが、<span class="mt-mark">ライバルが多く効率が悪い</span>。</p><p>初心者が無料で始めるなら、<a href="#sample">「サービスA」</a>がおすすめ。</p></div>` });

ch("voice", "D. 口コミ・体験談", "良い口コミと悪い口コミの両方を見せてから、体験談で背中を押す。");
part({ name: "良い口コミ／悪い口コミ", cls: "mt-voice / mt-voice--bad", when: "比較している相手サービスの評判を見せるとき。", rule: "良い2つ・悪い3つ程度。末尾に（年代・性別）。下に「※個人の感想です」。", ng: "良い口コミだけ", html: `<div class="mt-voice"><span class="mt-voice__lbl"><i>○</i>良い口コミ</span><ul><li>近くの人を探しやすい。<small>(20代男性)</small></li><li>写真が多くて雰囲気がつかみやすい。<small>(20代女性)</small></li></ul></div>
<div class="mt-voice mt-voice--bad"><span class="mt-voice__lbl"><i>×</i>悪い口コミ</span><ul><li>会うまでに時間がかかる。<small>(30代女性)</small></li><li><b>勧誘目的の人が多い。</b><small>(40代男性)</small></li></ul></div>
<p class="mt-small" style="text-align:right">※個人の感想です。</p>` });
part({ name: "もっと見る（開閉）", cls: "mt-more", when: "口コミが多いとき。", rule: "最初は閉じておく。", ng: "大事な情報を中に隠す", html: `<details class="mt-more"><summary>もっと口コミを見る▼</summary><p>（ここに追加の口コミ）</p></details>` });
part({ name: "体験談ボックス", cls: "mt-story", when: "推すサービスの紹介のあと、ボタンの前。", rule: "5段落まで。最後に「※個人の感想です」。", ng: "作り話", html: `<div class="mt-story"><p class="mt-story__who">利用者の声（30代男性）</p><p>プロフィールに共通の趣味が書いてあった人にメッセージを送ったのがきっかけでした。</p><p>「もっと早く使っておけばよかった」そう感じたサービスでした。</p></div>` });

ch("rank", "E. ランキングの中身", "順位見出し → バナー → 悩み → 実体験 → 特徴リスト → ボタン、の順。");
part({ name: "バナー＋PR表記", cls: "mt-banner", when: "順位見出しの直後。", rule: "右上に必ず「PR」。実際は公式バナー画像。", ng: "PR表記なし", html: `<a class="mt-banner" href="#sample"><span class="mt-banner__img">公式バナー画像（16:9）</span><span class="mt-banner__pr">PR</span></a>` });
part({ name: "写真3枚（お店・実物）", cls: "mt-photos", when: "順位の紹介の中で、お店や実物の雰囲気を見せるとき。", rule: "3枚。下に「※店舗により内装は異なります」などの注記。", ng: "ほかのお店の写真／フリー素材を実物のように見せる", html: `<div class="mt-photos"><span class="mt-banner__img" style="aspect-ratio:3/2;font-size:11px">店内の写真</span><span class="mt-banner__img" style="aspect-ratio:3/2;font-size:11px">査定カウンター</span><span class="mt-banner__img" style="aspect-ratio:3/2;font-size:11px">査定スペース</span></div>` });
part({ name: "特徴リスト（黄色い箱）", cls: "mt-points", when: "実体験のあとに、特徴を事実で並べる。", rule: "3〜4項目。数字を1つは入れる。", ng: "感想を入れる（感想は本文へ）", html: `<div class="mt-points"><ul><li>2002年運営開始の老舗で安心</li><li>累計会員数が多く、地方でも使える</li><li>無料登録でお試しポイントあり</li></ul></div>` });

ch("cta", "F. ボタン（CTA）", "ボタンの上に「＼ひとこと／」、下に年齢などの注記。これが1セット。");
part({ name: "大ボタン（ひとこと＋注記つき）", cls: "mt-cta", when: "各順位の紹介の最後。", rule: "上のひとことは「＼◯◯／」の形で毎回変える。ボタンは【順位】＋サービス名＋「無料登録」。ボタンには光が走るアニメーション付き（動きを減らす設定の人には出ない）。", ng: "ひとことを全部同じにする", html: `<div class="mt-cta"><p class="mt-cta__micro">＼簡単1分！匿名登録OK／</p><a class="mt-cta__btn" href="#sample">【1位】サービスA 無料登録</a><p class="mt-cta__note">-18歳未満利用禁止-</p></div>` });
part({ name: "テキストリンクのボタン", cls: "mt-textlink", when: "体験談やコツの直後。大ボタンの合間に。", rule: "「▶◯◯に無料登録してみる」＋下に注記。", ng: "大ボタンと同じ位置に並べる", html: `<p class="mt-textlink">▶<a href="#sample">サービスAに無料登録してみる</a><small>└18歳未満利用禁止</small></p>` });
part({ name: "最後のボタン一覧", cls: "mt-cta-stack", when: "記事の最後。全順位のボタンを並べる。", rule: "順位ごとに「＼こんな人なら！／」のひとことを変える。", ng: "ひとことなしで並べる", html: `<div class="mt-cta-stack"><div class="mt-cta"><p class="mt-cta__micro">＼初日から予定を決めるなら！／</p><a class="mt-cta__btn" href="#sample">【1位】サービスA 無料登録</a></div><div class="mt-cta"><p class="mt-cta__micro">＼ノリの合う相手を探すなら！／</p><a class="mt-cta__btn" href="#sample">【2位】サービスB 無料登録</a></div></div>` });

ch("how", "G. 使い方・手順", "「どうやればいいか」を具体的に見せて、行動のハードルを下げる。");
part({ name: "メッセージ例（会話）", cls: "mt-chat", when: "「会うまでの流れ」を見せるとき。", rule: "3往復まで。コツは吹き出しの下に赤い小さい字で。", ng: "4往復以上", html: `<div class="mt-chat"><p class="mt-chat__ttl">▼メッセージ例</p>
  <div class="mt-chat__m mt-chat__m--r"><span class="mt-chat__b">はじめまして、よろしくです！</span></div>
  <p class="mt-chat__tip">※最初はフランクなほうが返信しやすい</p>
  <div class="mt-chat__m"><span class="mt-chat__b">はじめまして！こちらこそ</span></div>
</div>` });
part({ name: "登録手順", cls: "mt-steps", when: "「登録は1分」を見せるとき。", rule: "入力項目を5つまで。補足は small で。", ng: "手順を多く見せて面倒に感じさせる", html: `<ol class="mt-steps"><li>ニックネーム <small>(本名じゃなくてOK)</small></li><li>性別</li><li>エリア</li><li>生年月日 <small>(公開されません)</small></li></ol>` });
part({ name: "画面の画像＋手書き風の注釈", cls: "mt-shot", when: "アプリ画面など、実物を見せるとき。", rule: "注釈は1つだけ、赤で斜めに。個人が分かる部分はぼかす。", ng: "注釈を2つ以上", html: `<div class="mt-shot"><div class="mt-shot__img">スマホ画面のスクショ</div><span class="mt-shot__note">毎日、新しい<br>登録が多い！</span></div>` });

ch("frame", "H. 枠まわり", "ページの上下。");
part({ name: "サイト名の帯", cls: "mt-sitebar", when: "ページの一番上と一番下。", rule: "青。サイト名だけ。", ng: "広告を入れる", html: `<div class="mt-sitebar">サイト名</div>` });
part({ name: "関連記事", cls: "mt-related", when: "ページの最後。", rule: "5〜7本。", ng: "関係ない記事", html: `<ul class="mt-related"><li><a href="#sample">初対面で好印象を残すコツ</a></li><li><a href="#sample">自己紹介の例文まとめ</a></li></ul>` });

const card = (p, i, id) => `
    <section class="pd-card" id="${id}-${i + 1}">
      <div class="pd-card__head"><span class="pd-card__name">${p.name}</span><code class="pd-card__cls">${esc(p.cls)}</code></div>
      <dl class="pd-meta"><dt>使う場面</dt><dd>${p.when}</dd><dt>ルール</dt><dd>${p.rule}</dd><dt class="pd-ng">NG</dt><dd>${p.ng}</dd></dl>
      <div class="pd-sample"><p class="pd-sample__lbl">見本</p><div class="mt-body">${p.html}</div></div>
      <details class="pd-code"><summary>HTMLを見る・コピー</summary><button type="button" class="pd-copy">コピー</button><pre><code>${esc(dedent(p.html))}</code></pre></details>
    </section>`;

const total = CH.reduce((n, c) => n + c.parts.length, 0);
const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>体験談ランキング型LP パーツ集</title>
<link rel="stylesheet" href="parts.css">
<style>
body { margin: 0; background: #f4f4f4; font-family: "Hiragino Sans", "Noto Sans JP", Meiryo, sans-serif; color: #222; }
.pd-wrap { max-width: 640px; margin: 0 auto; padding: 16px; background: #fff; }
.pd-top { margin: 0 0 1.2em; padding: 1.1em; border-radius: 12px; background: #0b3d6e; color: #fff; }
.pd-top h1 { margin: 0 0 .4em; font-size: 21px; }
.pd-top p { margin: 0 0 .4em; font-size: 13.5px; line-height: 1.7; color: #dbe7f3; }
.pd-top b { color: #fff100; }
.pd-toc { display: flex; flex-wrap: wrap; gap: .4em; margin: 0 0 1.2em; padding: 0; list-style: none; }
.pd-toc a { display: inline-block; padding: .35em .75em; border-radius: 999px; border: 1px solid #c8d6e5; background: #fff; font-size: 13px; font-weight: 700; color: #0b3d6e; text-decoration: none; }
.pd-chapter { margin: 2.2em 0 .4em; padding: .5em .8em; border-radius: 8px; background: #e6eef7; font-size: 18px; font-weight: 900; }
.pd-chapter__lead { margin: 0 0 1em; font-size: 13.5px; color: #666; line-height: 1.7; }
.pd-card { margin: 1em 0 1.8em; padding: .9em .7em 1em; border: 2px dashed #c8d6e5; border-radius: 12px; background: #fbfcfe; }
.pd-card__head { display: flex; flex-wrap: wrap; align-items: center; gap: .4em .6em; margin-bottom: .5em; }
.pd-card__name { font-size: 17px; font-weight: 900; }
.pd-card__cls { padding: .1em .5em; border-radius: 6px; background: #1f2733; color: #cfe3ff; font-size: 12px; font-family: ui-monospace, Consolas, monospace; }
.pd-meta { display: grid; grid-template-columns: 5.2em 1fr; gap: .25em .6em; margin: 0 0 .8em; font-size: 13.5px; line-height: 1.65; }
.pd-meta dt { font-weight: 900; color: #666; }
.pd-meta dd { margin: 0; }
.pd-meta .pd-ng { color: #c62828; }
.pd-sample { padding: .3em .8em .6em; border-radius: 10px; background: #fff; border: 1px solid #e3e8ef; overflow: hidden; }
.pd-sample__lbl { margin: 0 0 .2em; font-size: 11px; font-weight: 900; letter-spacing: .1em; color: #9aa7b6; }
.pd-code { margin-top: .6em; position: relative; }
.pd-code summary { cursor: pointer; font-size: 13px; font-weight: 700; color: #0b3d6e; }
.pd-code pre { margin: .5em 0 0; padding: .8em; border-radius: 8px; background: #1f232c; color: #e9e3d0; font-size: 12px; line-height: 1.55; overflow-x: auto; }
.pd-copy { position: absolute; right: 0; top: 0; padding: .2em .8em; border: 1px solid #c8d6e5; border-radius: 6px; background: #fff; font-size: 12px; cursor: pointer; }
.pd-table { width: 100%; border-collapse: collapse; font-size: 13.5px; line-height: 1.6; }
.pd-table th, .pd-table td { border: 1px solid #dbe3ec; padding: .5em .6em; text-align: left; vertical-align: top; }
.pd-table th { background: #f3f6fa; white-space: nowrap; }
</style>
</head>
<body>
<div class="pd-wrap">
  <div class="pd-top">
    <h1>体験談ランキング型LP パーツ集</h1>
    <p>「◯◯はやばい？使った感想＆実際に◯◯できた5選」型の記事LPを組むための部品です。参考サイトの<b>見せ方の型だけ</b>を抜き出して作り直しました（文章・画像・サービス名は使っていません）。</p>
    <p>全${total}パーツ。CSSは <code>parts.css</code> 1ファイル。LPで使うときは parts.css を読み込み、本文を <code>class="mt-body"</code> で囲む。</p>
  </div>
  <ul class="pd-toc"><li><a href="#flow">基本の流れ</a></li>${CH.map((c) => `<li><a href="#${c.id}">${c.title}</a></li>`).join("")}</ul>

  <p class="pd-chapter" id="flow">基本の流れとルール</p>
  <table class="pd-table">
    <tr><th>流れ</th><td>タイトル → アイキャッチ → 悩みの問いかけ → 共感（私も同じだった）→ 答えの予告（黄マーカー）→ PR・年齢注記 → 比較表 → 結論ボックス → 比較相手の口コミ（良い・悪い）→ 自分の体験（目的で選ぶ）→ ランキング（各順位：見出し・バナー・実体験・特徴リスト・ボタン）→ 1位だけ深掘り（コツ・会話例・体験談・登録手順）→ まとめ → 全順位のボタン → 関連記事</td></tr>
    <tr><th>色</th><td>青＝見出し・ボタン／<span class="mt-red">赤</span>＝強調・注意／<span class="mt-mark">黄マーカー</span>＝結論</td></tr>
    <tr><th>口調</th><td>1人称の体験談。語りかけ（「〜ですよね」「w」は1記事で数回まで）。1段落1〜2文、改行多め</td></tr>
    <tr><th>ボタン</th><td>大ボタンの上に「＼ひとこと／」、下に注記。ひとことは毎回変える。大ボタンの合間にテキストリンクのボタン</td></tr>
    <tr><th>必ず入れる</th><td>冒頭のPR表記・年齢制限の注記・口コミや体験談の「※個人の感想です」。体験していないことは書かない</td></tr>
  </table>
${CH.map((c) => `
  <p class="pd-chapter" id="${c.id}">${c.title}</p>
  <p class="pd-chapter__lead">${c.lead}</p>
${c.parts.map((p, i) => card(p, i, c.id)).join("\n")}`).join("\n")}
</div>
<script>
document.querySelectorAll('a[href="#sample"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });
document.querySelectorAll('.pd-copy').forEach(function (b) { b.addEventListener('click', function () { var t = b.parentNode.querySelector('code').textContent; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { b.textContent = 'コピーしました'; setTimeout(function () { b.textContent = 'コピー'; }, 1500); }).catch(function () { b.textContent = '選択してコピーしてください'; }); }); });
</script>
</body>
</html>
`;
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_DIR + "parts.css", PARTS_CSS.trimStart());
fs.writeFileSync(OUT_DIR + "index.html", html);
console.log("parts:", total, "->", OUT_DIR);
