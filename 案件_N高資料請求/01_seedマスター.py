# -*- coding: utf-8 -*-
"""seedマスター（ユーザー指定のseedと、その組み合わせだけ。AIによる独自の水増しはしない）。

毎回この定義から作り直す（既存CSVを読み戻して追記しない）。
出力: nkou_seed_master.csv
"""
from __future__ import annotations

import csv
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
CASE = Path(__file__).resolve().parent

# ---------------- ① ジャンル王道 ----------------
GENRE = ["通信制高校", "通信高校", "通信制 高校", "ネット高校", "ネットの高校", "オンライン高校",
         "高校 オンライン", "高校 通信", "高校 ネット", "在宅 高校", "自宅 高校", "単位制高校"]
COMPARE = ["比較", "おすすめ", "人気", "ランキング", "どこがいい", "どれがいい", "どこがおすすめ",
           "おすすめ校", "人気校", "比較表"]

# ---------------- ② その他ジャンル ----------------
OTHER_MODS = {
    "資料": ["資料請求", "パンフレット", "資料", "資料 取り寄せ"],
    "評判": ["口コミ", "評判", "体験談"],
    "費用": ["学費", "費用", "授業料", "年間費用"],
    "進路": ["大学進学", "大学受験", "進学実績", "大学", "中3", "中学3年", "高校受験", "進路"],
    "分野": ["プログラミング", "IT", "AI", "eスポーツ", "デザイン", "クリエイティブ", "ゲーム", "起業"],
    "学習スタイル": ["オンライン授業", "自宅学習", "在宅学習", "通学", "通学日数", "週1", "週2", "週3"],
    "転編入": ["転校", "転入", "編入", "転校先", "編入先"],
    "制度": ["コース", "キャンパス", "スクーリング", "卒業", "単位", "入試"],
}
OTHER_HEADS = ["通信制高校", "高校"]
# 「地域名」は都道府県すべて（ユーザー指定の6都府県を含む）
PREFS = ["北海道", "青森", "岩手", "宮城", "秋田", "山形", "福島", "茨城", "栃木", "群馬", "埼玉", "千葉",
         "東京", "神奈川", "新潟", "富山", "石川", "福井", "山梨", "長野", "岐阜", "静岡", "愛知", "三重",
         "滋賀", "京都", "大阪", "兵庫", "奈良", "和歌山", "鳥取", "島根", "岡山", "広島", "山口", "徳島",
         "香川", "愛媛", "高知", "福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄"]

# ---------------- ③ テール（ユーザー指定そのまま） ----------------
TAIL = [
    "通信制高校 選び方", "通信制高校 どう選ぶ", "高校選び 何を基準", "高校 どうやって選ぶ", "自分に合う高校 探し方",
    "高校 週何回通う", "通信制高校 週何回", "高校 毎日通わなくていい", "高校 自宅で勉強できる", "高校 家で授業",
    "高校 オンラインだけ", "高校 スクーリング 少ない",
    "高校 パンフレット いつ届く", "高校 資料請求 いつする", "高校 資料請求 何校", "高校 パンフレット いつもらう",
    "高校 転校 どうやる", "高校 転校 方法", "高校 転校 いつから", "高校 転校 単位", "高校 編入 方法",
    "高校 編入 いつから", "高校 転校 高2", "高校 転校 高3",
    "通信制高校 卒業まで何年", "通信制高校 単位 どう取る", "通信制高校 スクーリング 何日", "通信制高校 毎日通うのか",
]

# ---------------- ④ 競合（ユーザー指定の校名） ----------------
COMPETITORS = {
    "飛鳥未来": ["飛鳥未来高等学校", "飛鳥未来高校", "飛鳥未来きずな高等学校"],
    "おおぞら": ["おおぞら高校", "おおぞら高等学院", "屋久島おおぞら高等学校"],
    "クラーク": ["クラーク記念国際高等学校", "クラーク高校"],
    "ルネサンス": ["ルネサンス高等学校", "ルネサンス高校"],
    "第一学院": ["第一学院高等学校", "第一学院高校"],
    "鹿島学園": ["鹿島学園高等学校", "鹿島学園高校"],
    "NHK学園": ["NHK学園高等学校", "NHK学園高校"],
    "トライ式": ["トライ式高等学院"],
    "ヒューマンキャンパス": ["ヒューマンキャンパス高等学校", "ヒューマンキャンパス高校"],
    "ワオ": ["ワオ高等学校", "ワオ高校"],
    "ID学園": ["ID学園高等学校", "ID学園"],
}
COMP_MODS = ["学費", "費用", "口コミ", "評判", "資料請求", "パンフレット", "コース", "通学", "キャンパス",
             "大学", "進学", "卒業", "スクーリング", "比較", "おすすめ", "メリット", "デメリット"]
# 「N高 競合校名」系（ユーザー指定の型）。校名は短縮形を使う
COMP_SHORT = {"飛鳥未来": "飛鳥未来", "おおぞら": "おおぞら高校", "クラーク": "クラーク", "ルネサンス": "ルネサンス",
              "第一学院": "第一学院", "鹿島学園": "鹿島学園", "NHK学園": "NHK学園", "トライ式": "トライ式",
              "ヒューマンキャンパス": "ヒューマンキャンパス", "ワオ": "ワオ高校", "ID学園": "ID学園"}

# ---------------- URL / Site seed（HTTP 200 と表題を確認済み 2026-09-26） ----------------
SITE_SEEDS = [
    ("nnn.ed.jp", "競合", "N高等学校・S高等学校・R高等学校（自社）"),
    ("www.clark.ed.jp", "競合", "クラーク記念国際高等学校"),
    ("www.r-ac.jp", "競合", "ルネサンス高校グループ"),
    ("www.daiichigakuin.ed.jp", "競合", "第一学院高等学校"),
    ("www.kg-school.net", "競合", "鹿島学園系"),
    ("www.n-gaku.jp", "競合", "NHK学園"),
    ("www.try-gakuin.com", "競合", "トライ式高等学院"),
    ("www.hchs.ed.jp", "競合", "ヒューマンキャンパス高校"),
]
URL_SEEDS = [
    ("https://ja.wikipedia.org/wiki/%E9%80%9A%E4%BF%A1%E5%88%B6%E9%AB%98%E7%AD%89%E5%AD%A6%E6%A0%A1",
     "ジャンル王道", "Wikipedia 通信制高等学校"),
    ("https://ja.wikipedia.org/wiki/%E5%8D%98%E4%BD%8D%E5%88%B6%E9%AB%98%E7%AD%89%E5%AD%A6%E6%A0%A1",
     "ジャンル王道", "Wikipedia 単位制高等学校"),
]
KW_AND_URL = [("通信制高校", URL_SEEDS[0][0], "ジャンル王道", "通信制高校 × Wikipedia")]


def build() -> list[dict]:
    """(seed, portfolio, category, method, ideas) の行を作る。ideas=Trueなら Ideas も投げる。"""
    rows: list[dict] = []

    def add(seed, portfolio, category, method="KeywordSeed", ideas=True, url=None, site=None):
        rows.append(dict(seed=seed, portfolio=portfolio, category=category, method=method,
                         ideas=ideas, url=url or "", site=site or ""))

    for g in GENRE:
        add(g, "ジャンル王道", "ジャンル名")
        for c in COMPARE:
            add(f"{g} {c}", "ジャンル王道", f"ジャンル×比較:{c}")
    for head in OTHER_HEADS:
        for cat, mods in OTHER_MODS.items():
            for m in mods:
                add(f"{head} {m}", "その他ジャンル", f"{cat}:{m}")
    for p in PREFS:
        add(f"通信制高校 {p}", "その他ジャンル", "地域")
    for t in TAIL:
        add(t, "テール", "ユーザー指定テール")
    for group, names in COMPETITORS.items():
        for name in names:
            add(name, "競合", f"{group}:校名")
            for m in COMP_MODS:
                # 組み合わせは実測（Historical）だけ。Ideas は校名単体で広く取る
                add(f"{name} {m}", "競合", f"{group}:校名×{m}", ideas=False)
        short = COMP_SHORT[group]
        add(f"N高 {short}", "競合", f"{group}:N高比較")
        add(f"N高 {short} 比較", "競合", f"{group}:N高比較", ideas=False)
        add(f"N高と{short} どっち", "競合", f"{group}:N高比較", ideas=False)
    for site, pf, note in SITE_SEEDS:
        add(f"site:{site}", pf, note, method="SiteSeed", site=site)
    for url, pf, note in URL_SEEDS:
        add(f"url:{note}", pf, note, method="UrlSeed", url=url)
    for kw, url, pf, note in KW_AND_URL:
        add(kw, pf, note, method="KeywordAndUrlSeed", url=url)

    # 完全重複の防止（同じ seed×method は1行）
    seen, out = set(), []
    for r in rows:
        key = (r["seed"], r["method"], r["url"], r["site"])
        if key not in seen:
            seen.add(key)
            out.append(r)
    return out


SEEDS = build()

if __name__ == "__main__":
    with (CASE / "nkou_seed_master.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(SEEDS[0].keys()))
        w.writeheader()
        w.writerows(SEEDS)
    from collections import Counter
    print("seed総数", len(SEEDS), "Ideas対象", sum(1 for s in SEEDS if s["ideas"]))
    print(Counter(s["portfolio"] for s in SEEDS))
    print(Counter(s["method"] for s in SEEDS))
