# -*- coding: utf-8 -*-
"""KWP取得結果を統合し、4ポートフォリオに仕分ける（判断はしない）。

・削除するのは完全重複だけ（空白の揺れだけ畳む。表記揺れは別行）。
・検索数0 / NO DATA / CPCなし / 意図ズレも全件残す。NO DATA は空欄のまま（0にしない）。
・1KWにつき主分類1つ（rules_nkou の優先順位：競合 → ジャンル王道 → テール → その他ジャンル）。

出力
  nkou_kw_portfolio.csv   … 指定8列（portfolio, keyword, seed, avg_monthly_searches, competition,
                              competition_index, top_of_page_bid_low, top_of_page_bid_high）
  nkou_kw_seed_paths.csv  … 同じKWに到達した全seed・取得方式・段（経路を失わないための別表）
  README.md               … 取得状況と件数のみ
"""
from __future__ import annotations

import csv
import importlib.util
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
CASE = Path(__file__).resolve().parent
RAW = CASE / "raw"

sp = importlib.util.spec_from_file_location("rules_nkou", CASE / "rules_nkou.py")
R = importlib.util.module_from_spec(sp)
sp.loader.exec_module(R)

STAGE_ORDER = {"s1": 1, "s2": 2, "s3": 3, "hist": 0}


def blank(v):
    return "" if v is None else v


def main() -> int:
    kws: dict[str, dict] = {}
    paths: dict[str, list] = defaultdict(list)
    req = Counter()
    incomplete = []

    def observe(keyword, metrics, seed, method, stage, portfolio_seed):
        key = " ".join(str(keyword).split())
        if not key:
            return
        paths[key].append((stage, method, seed, portfolio_seed))
        cur = kws.get(key)
        # 指標は Historical（seed本体の実測）を優先し、無ければ最初に観測した Ideas の値
        if cur is None or (stage == "hist" and cur["_stage"] != "hist"):
            kws[key] = dict(keyword=key, _stage=stage, **metrics)

    for stage in ("s1", "s2", "s3"):
        p = RAW / f"ideas_{stage}.jsonl"
        if not p.exists():
            continue
        for line in p.open(encoding="utf-8"):
            j = json.loads(line)
            req[(stage, "error" if j.get("error") else "ok")] += 1
            if j.get("total_size") is not None and j["record_count"] < j["total_size"]:
                incomplete.append((j["job"], j["record_count"], j["total_size"]))
            for r in j["records"]:
                observe(r["keyword"], r["metrics"], j["seed"], j["method"], stage, j["portfolio"])

    hp = RAW / "hist_seed.jsonl"
    hist_no_metrics = 0
    if hp.exists():
        for line in hp.open(encoding="utf-8"):
            j = json.loads(line)
            if not j.get("metrics_found"):
                hist_no_metrics += 1
            observe(j["keyword"], j["metrics"], j["seed"], "HistoricalMetrics", "hist", j["portfolio"])

    rows, seed_rows = [], []
    for key, m in kws.items():
        ps = sorted(paths[key], key=lambda x: (STAGE_ORDER[x[0]] or 9, x[2]))
        first_seed = ps[0][2]
        rows.append(dict(
            portfolio=R.portfolio_of(key), keyword=key, seed=first_seed,
            avg_monthly_searches=blank(m.get("avg_monthly_searches")),
            competition=blank(m.get("competition")),
            competition_index=blank(m.get("competition_index")),
            top_of_page_bid_low=blank(m.get("low_bid")),
            top_of_page_bid_high=blank(m.get("high_bid")),
        ))
        uniq = list(dict.fromkeys((p[1], p[2], p[0]) for p in ps))
        seed_rows.append(dict(
            keyword=key, source_seed_count=len({u[1] for u in uniq}),
            all_source_seeds=" | ".join(dict.fromkeys(u[1] for u in uniq)),
            all_methods=" | ".join(sorted({u[0] for u in uniq})),
            stages=" | ".join(sorted({u[2] for u in uniq})),
            observation_count=len(ps),
        ))

    order = {p: i for i, p in enumerate(R.PORTFOLIOS)}

    def vol(r):
        v = r["avg_monthly_searches"]
        return v if isinstance(v, int) else -1

    rows.sort(key=lambda r: (order[r["portfolio"]], -vol(r), r["keyword"]))
    cols = ["portfolio", "keyword", "seed", "avg_monthly_searches", "competition",
            "competition_index", "top_of_page_bid_low", "top_of_page_bid_high"]
    with (CASE / "nkou_kw_portfolio.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(rows)
    with (CASE / "nkou_kw_seed_paths.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(seed_rows[0].keys()))
        w.writeheader()
        w.writerows(sorted(seed_rows, key=lambda r: r["keyword"]))

    # 完全重複が無いことを確認
    assert len({r["keyword"] for r in rows}) == len(rows)

    cnt = Counter(r["portfolio"] for r in rows)
    summary = [f"{p}：{cnt[p]:,}件" for p in R.PORTFOLIOS] + [f"合計：{len(rows):,}件"]
    print("\n".join(summary))

    # ---------------- README（取得状況のみ。判断は書かない） ----------------
    seeds = list(csv.DictReader((CASE / "nkou_seed_master.csv").open(encoding="utf-8-sig")))
    has_vol = sum(1 for r in rows if r["avg_monthly_searches"] not in ("", None))
    vol0 = sum(1 for r in rows if r["avg_monthly_searches"] == 0)
    has_cpc = sum(1 for r in rows if r["top_of_page_bid_high"] not in ("", None))
    comp = Counter(r["competition"] or "NO DATA" for r in rows)
    L = [
        "# N高グループ資料請求｜KWP母集団（4ポートフォリオ）",
        "",
        f"取得日：{json.loads(next(iter((RAW / 'ideas_s1.jsonl').open(encoding='utf-8'))))['surveyed_at']}"
        "　／　Google Keyword Planner（JP・日本語・Google検索）READ ONLY",
        "",
        "この工程は「取り切る作業」。採用・除外・優先度・規約・CV見込み・マッチタイプ・入札は判断していない。",
        "削除したのは完全重複のみ（空白の揺れだけ畳み、表記揺れは別行で残す）。",
        "",
        "## 件数",
        "",
        *[f"- {s}" for s in summary],
        "",
        "## 取得状況",
        "",
        f"- seed総数：{len(seeds):,}（Ideas投入 {sum(1 for s in seeds if s['ideas'] == 'True'):,}）",
        f"- seed内訳（ポートフォリオ）：{dict(Counter(s['portfolio'] for s in seeds))}",
        f"- seed内訳（方式）：{dict(Counter(s['method'] for s in seeds))}",
        f"- Ideasリクエスト：1段目 {req[('s1','ok')]:,}（エラー{req[('s1','error')]}）／"
        f"2段目 {req[('s2','ok')]:,}（エラー{req[('s2','error')]}）／"
        f"3段目 {req[('s3','ok')]:,}（エラー{req[('s3','error')]}）",
        f"- 全ページ取得の未完了（取得件数 < total_size）：{len(incomplete)}件",
        f"- Historical Metrics：seed {sum(1 for s in seeds if s['method']=='KeywordSeed'):,}件を実測"
        f"（metricsなし {hist_no_metrics}件）",
        f"- 観測総数：{sum(len(v) for v in paths.values()):,}　／　ユニークKW：{len(rows):,}",
        f"- 検索数あり：{has_vol:,}（うち0件：{vol0:,}）／ 検索数NO DATA：{len(rows) - has_vol:,}",
        f"- 入札単価あり：{has_cpc:,} ／ 入札単価NO DATA：{len(rows) - has_cpc:,}",
        f"- Competition：{dict(comp)}",
        "",
        "## 分類ルール（rules_nkou.py）",
        "",
        "1. 競合校名を含む → 競合（ユーザー指定の11校グループのみ。短い名前『おおぞら・クラーク・ルネサンス』は学校文脈語と同時に出たときだけ）",
        "2. ジャンル名単体、または学校・選択肢の比較前提ワード（比較・おすすめ・人気・ランキング・どこがいい・どれがいい・どっち 等 × 高校/学校/学院/学園/通信制 等）→ ジャンル王道",
        "3. 疑問・How-to・方法・質問型・口語（どう・いつ・何・方法・選び方・できる・だけ 等）、転校・編入×学年、または詰め表記16文字以上の長めの複合（学校の正式名称だけのKWは除く）→ テール",
        "4. それ以外 → その他ジャンル",
        "",
        "KWPは分かち書きで返すため、照合は空白を詰めて行っている。",
        "",
        "## ファイル",
        "",
        "- `nkou_kw_portfolio.csv` … 指定8列の一覧（seed列は最初に到達したseed）",
        "- `nkou_kw_seed_paths.csv` … 同じKWに到達した全seed・方式・段",
        "- `nkou_seed_master.csv` … seed定義",
        "- `raw/` … KWP応答そのもの（jsonl）",
    ]
    (CASE / "README.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    if incomplete:
        print("未完了ジョブ:", incomplete[:10])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
